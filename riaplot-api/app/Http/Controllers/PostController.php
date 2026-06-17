<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);
        $sort = $request->query('sort', 'recent');
        // Auth opcional: rota pública, mas se vier um token válido personaliza.
        $viewer = $request->user('sanctum');

        $query = Post::query();

        // Filtro opcional por autor (perfil próprio/público) — feito no servidor
        // para não trazer o feed inteiro só para filtrar no cliente.
        if ($userId = $request->query('user')) {
            $query->where('user_id', $userId);

            // Gating do perfil: bloqueios ou conta privada não seguida → vazio.
            // (Visitantes nunca seguem ninguém, por isso veem só contas públicas.)
            $isSelf = $viewer && $userId === $viewer->id;
            if (!$isSelf) {
                $target = User::find($userId);
                $blocked = $viewer && (
                    in_array($userId, $viewer->blocked ?? [])
                    || ($target && in_array($viewer->id, $target->blocked ?? []))
                );
                $isFollower = $viewer && in_array($userId, $viewer->following ?? []);
                $privateHidden = $target && ($target->is_private ?? false) && !$isFollower;
                if ($blocked || $privateHidden) {
                    return response()->json([
                        'data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0,
                    ]);
                }
            }
        } else {
            // Filtro "de quem sigo": só publicações de utilizadores que o
            // autenticado segue. Lista vazia → sentinela que não casa com nada.
            if ($request->boolean('following') && $viewer) {
                $following = $viewer->following ?? [];
                $query->whereIn('user_id', $following ?: ['__none__']);
            }

            // Esconde do feed os autores bloqueados (ambos os sentidos) e as
            // contas privadas não seguidas. Para visitantes, esconde os privados.
            $hidden = $this->hiddenAuthorIds($viewer);
            if (!empty($hidden)) $query->whereNotIn('user_id', $hidden);
        }

        // Ordenação no servidor (abrange todo o histórico, não só o carregado).
        if ($sort === 'liked') {
            // Garante likes_count nos posts antigos (corre só até estarem todos
            // preenchidos; depois esta query não devolve nada).
            Post::whereNull('likes_count')->get()->each(
                fn($p) => $p->update(['likes_count' => count($p->likes ?? [])]),
            );
            $query->orderBy('likes_count', 'desc')->orderBy('created_at', 'desc');
        } elseif ($sort === 'old') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data'         => $this->enrichMany(collect($paginator->items()), $viewer?->id),
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
    }

    /**
     * Ids de autores a esconder do feed para este utilizador: quem ele
     * bloqueou, quem o bloqueou, e contas privadas que ele não segue.
     */
    private function hiddenAuthorIds($viewer): array
    {
        $privateIds = User::where('is_private', true)->get()
            ->map(fn ($u) => (string) $u->_id)->all();

        // Visitante (sem sessão): esconde todas as contas privadas.
        if (!$viewer) return $privateIds;

        $myId = $viewer->id;
        $iBlocked  = $viewer->blocked ?? [];
        $blockedMe = User::where('blocked', $myId)->get()
            ->map(fn ($u) => (string) $u->_id)->all();

        $allowed = array_merge($viewer->following ?? [], [$myId]);
        $privateHidden = array_values(array_diff($privateIds, $allowed));

        return array_values(array_unique(array_merge($iBlocked, $blockedMe, $privateHidden)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'route_doc'   => 'nullable|string',
            'post_url'    => 'nullable|array',
            'gpx_url'     => 'nullable|string',
            'gpx_points'  => 'nullable|array',
        ]);

        $post = Post::create([
            ...$data,
            'description' => $data['description'] ?? '',
            'user_id'  => $request->user()->id,
            'username' => $request->user()->username,
            'likes'    => [],
            'likes_count' => 0,
            'comments' => [],
        ]);

        return response()->json($post, 201);
    }

    public function show(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        // Mesma proteção do feed: post de conta privada não seguida ou de quem
        // há bloqueio fica inacessível por link direto. Auth opcional (visitantes
        // só acedem a posts de contas públicas).
        $viewer = $request->user('sanctum');
        $isOwner = $viewer && (string) $post->user_id === $viewer->id;
        if (!$isOwner) {
            $author = User::find($post->user_id);
            if ($author) {
                $blocked = $viewer && (
                    in_array((string) $post->user_id, $viewer->blocked ?? [])
                    || in_array($viewer->id, $author->blocked ?? [])
                );
                $isFollower = $viewer && in_array((string) $post->user_id, $viewer->following ?? []);
                $privateHidden = ($author->is_private ?? false) && !$isFollower;
                if ($blocked || $privateHidden) {
                    return response()->json(['message' => 'Não disponível'], 403);
                }
            }
        }

        return response()->json($this->enrichMany(collect([$post]), $viewer?->id)->first());
    }

    public function update(Request $request, $id)
    {
        $post = Post::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        // Whitelist explícita: nunca deixar o cliente alterar campos sensíveis
        // como user_id, likes, likes_count ou comments através do update.
        $data = $request->validate([
            'title'       => 'sometimes|string',
            'description' => 'sometimes|nullable|string',
            'location'    => 'sometimes|nullable|string',
            'route_doc'   => 'sometimes|nullable|string',
            'post_url'    => 'sometimes|nullable|array',
            'gpx_url'     => 'sometimes|nullable|string',
            'gpx_points'  => 'sometimes|nullable|array',
        ]);

        $post->update($data);
        return response()->json($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $post->delete();
        return response()->json(['message' => 'Post removido']);
    }

    public function like(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $userId = $request->user()->id;
        $likes  = $post->likes ?? [];

        if (in_array($userId, $likes)) {
            $likes = array_filter($likes, fn($l) => $l !== $userId);
        } else {
            $likes[] = $userId;
            // Notifica o dono do post (exceto ao gostar do próprio post).
            if ($post->user_id !== $userId) {
                Notification::create([
                    'type'  => 'like',
                    'user'  => $post->user_id,
                    'actor' => $userId,
                    'post'  => $post->id,
                    'read'  => false,
                ]);
            }
        }

        $likes = array_values($likes);
        $post->update(['likes' => $likes, 'likes_count' => count($likes)]);

        // Devolve a contagem e o estado atual para o cliente reconciliar sem
        // depender do palpite otimista (evita ficar dessincronizado).
        return response()->json([
            'likes' => count($post->likes),
            'liked' => in_array($userId, $post->likes),
        ]);
    }

    public function comment(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $data = $request->validate([
            'comment'   => 'required|string',
            // Quando preenchido, este comentário é uma resposta a outro.
            'parent_id' => 'nullable|string',
        ]);
        $user = $request->user();

        $newComment = [
            'id'         => (string) new \MongoDB\BSON\ObjectId(),
            'user_id'    => $user->id,
            'comment'    => $data['comment'],
            'parent_id'  => $data['parent_id'] ?? null,
            'likes'      => [],
            'created_at' => now()->toISOString(),
        ];

        $comments   = $post->comments ?? [];

        // Se é uma resposta, descobre o autor do comentário-pai para o notificar.
        $parentAuthorId = null;
        if (!empty($data['parent_id'])) {
            foreach ($comments as $c) {
                if (($c['id'] ?? null) === $data['parent_id']) {
                    $parentAuthorId = $c['user_id'] ?? null;
                    break;
                }
            }
        }

        $comments[] = $newComment;
        $post->update(['comments' => $comments]);

        // Notifica o autor do comentário-pai de que houve uma resposta (exceto
        // ao responder ao próprio comentário).
        if ($parentAuthorId && $parentAuthorId !== $user->id) {
            Notification::create([
                'type'    => 'reply',
                'user'    => $parentAuthorId,
                'actor'   => $user->id,
                'post'    => $post->id,
                'comment' => $data['comment'],
                'read'    => false,
            ]);
        }

        // Notifica o dono do post (exceto ao comentar o próprio post e sem
        // duplicar quando o dono é também o autor do comentário respondido).
        if ($post->user_id !== $user->id && $post->user_id !== $parentAuthorId) {
            Notification::create([
                'type'    => 'comment',
                'user'    => $post->user_id,
                'actor'   => $user->id,
                'post'    => $post->id,
                'comment' => $data['comment'],
                'read'    => false,
            ]);
        }

        // Devolve o comentário já enriquecido para o cliente o poder mostrar
        // sem recarregar o post.
        return response()->json([
            'id'         => $newComment['id'],
            'user_id'    => $user->id,
            'username'   => $user->username,
            'photo_url'  => $user->photo_url ?? null,
            'comment'    => $newComment['comment'],
            'parent_id'  => $newComment['parent_id'],
            'likes'      => [],
            'created_at' => $newComment['created_at'],
        ], 201);
    }

    public function likeComment(Request $request, $id, $commentId)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $userId   = $request->user()->id;
        $comments = $post->comments ?? [];
        $found    = false;
        $liked    = false;
        $count    = 0;
        $commentAuthorId = null;

        foreach ($comments as &$c) {
            if (($c['id'] ?? null) === $commentId) {
                $commentAuthorId = $c['user_id'] ?? null;
                $likes = $c['likes'] ?? [];
                if (in_array($userId, $likes)) {
                    $likes = array_values(array_filter($likes, fn($l) => $l !== $userId));
                    $liked = false;
                } else {
                    $likes[] = $userId;
                    $liked = true;
                }
                $c['likes'] = array_values($likes);
                $count = count($c['likes']);
                $found = true;
                break;
            }
        }
        unset($c);

        if (!$found) return response()->json(['message' => 'Comentário não encontrado'], 404);

        $post->update(['comments' => $comments]);

        // Ao gostar (não ao retirar o gosto), notifica o autor do comentário —
        // exceto se gostou do próprio comentário.
        if ($liked && $commentAuthorId && $commentAuthorId !== $userId) {
            Notification::create([
                'type'  => 'comment_like',
                'user'  => $commentAuthorId,
                'actor' => $userId,
                'post'  => $post->id,
                'read'  => false,
            ]);
        }

        return response()->json(['likes' => $count, 'liked' => $liked]);
    }

    public function updateComment(Request $request, $id, $commentId)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $data = $request->validate(['comment' => 'required|string']);
        $user = $request->user();

        $comments = $post->comments ?? [];
        $found    = false;

        foreach ($comments as &$c) {
            if (($c['id'] ?? null) === $commentId) {
                // Só o autor do comentário o pode editar.
                if (($c['user_id'] ?? null) !== $user->id) {
                    return response()->json(['message' => 'Sem permissão'], 403);
                }
                $c['comment'] = $data['comment'];
                $found = true;
                break;
            }
        }
        unset($c);

        if (!$found) return response()->json(['message' => 'Comentário não encontrado'], 404);

        $post->update(['comments' => $comments]);

        return response()->json([
            'id'        => $commentId,
            'user_id'   => $user->id,
            'username'  => $user->username,
            'photo_url' => $user->photo_url ?? null,
            'comment'   => $data['comment'],
        ]);
    }

    public function deleteComment(Request $request, $id, $commentId)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $user     = $request->user();
        $comments = $post->comments ?? [];

        $target = null;
        foreach ($comments as $c) {
            if (($c['id'] ?? null) === $commentId) { $target = $c; break; }
        }

        if (!$target) return response()->json(['message' => 'Comentário não encontrado'], 404);

        // Pode apagar quem escreveu o comentário ou o dono do post.
        $isAuthor    = ($target['user_id'] ?? null) === $user->id;
        $isPostOwner = $post->user_id === $user->id;
        if (!$isAuthor && !$isPostOwner) {
            return response()->json(['message' => 'Sem permissão'], 403);
        }

        // Remove o comentário e, em cascata, as respostas que lhe apontam.
        $comments = array_values(array_filter(
            $comments,
            fn($c) => ($c['id'] ?? null) !== $commentId
                && ($c['parent_id'] ?? null) !== $commentId,
        ));
        $post->update(['comments' => $comments]);

        return response()->json(['message' => 'Comentário removido']);
    }

    /**
     * Acrescenta a foto de perfil do autor a cada post e enriquece cada
     * comentário com o username/foto do respetivo autor — numa única query
     * de utilizadores para evitar o problema N+1.
     */
    private function enrichMany($posts, $viewerId = null)
    {
        $ids = [];
        foreach ($posts as $p) {
            $ids[] = $p->user_id;
            foreach (($p->comments ?? []) as $c) {
                $ids[] = $c['user_id'] ?? null;
            }
        }
        $ids = array_values(array_unique(array_filter($ids)));

        $users = User::whereIn('_id', $ids)->get()
            ->keyBy(fn($u) => (string) $u->_id);

        return $posts->map(function ($p) use ($users, $viewerId) {
            $author = $users->get((string) $p->user_id);
            $arr = $p->toArray();
            $arr['photo_url'] = $author->photo_url ?? null;

            // Privacidade de localização: esconde localização e traçado das
            // publicações do autor a toda a gente exceto o próprio autor.
            if ($author && ($author->hide_location ?? false)
                && (string) $p->user_id !== (string) $viewerId) {
                $arr['location'] = null;
                $arr['gpx_url'] = null;
                $arr['gpx_points'] = null;
            }

            $arr['comments'] = array_map(function ($c) use ($users) {
                $u = $users->get((string) ($c['user_id'] ?? ''));
                return [
                    'id'         => $c['id'] ?? null,
                    'user_id'    => $c['user_id'] ?? null,
                    'username'   => $u->username ?? 'utilizador',
                    'photo_url'  => $u->photo_url ?? null,
                    'comment'    => $c['comment'] ?? '',
                    'parent_id'  => $c['parent_id'] ?? null,
                    'likes'      => $c['likes'] ?? [],
                    'created_at' => $c['created_at'] ?? null,
                ];
            }, $p->comments ?? []);
            return $arr;
        })->values();
    }
}
