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

        $query = Post::orderBy('created_at', 'desc');

        // Filtro opcional por autor (perfil próprio/público) — feito no servidor
        // para não trazer o feed inteiro só para filtrar no cliente.
        if ($userId = $request->query('user')) {
            $query->where('user_id', $userId);
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'data'         => $this->enrichMany(collect($paginator->items())),
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
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
            'comments' => [],
        ]);

        return response()->json($post, 201);
    }

    public function show($id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);
        return response()->json($this->enrichMany(collect([$post]))->first());
    }

    public function update(Request $request, $id)
    {
        $post = Post::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $post->update($request->all());
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

        $post->update(['likes' => array_values($likes)]);

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

        $data = $request->validate(['comment' => 'required|string']);
        $user = $request->user();

        $newComment = [
            'id'         => (string) new \MongoDB\BSON\ObjectId(),
            'user_id'    => $user->id,
            'comment'    => $data['comment'],
            'created_at' => now()->toISOString(),
        ];

        $comments   = $post->comments ?? [];
        $comments[] = $newComment;
        $post->update(['comments' => $comments]);

        // Notifica o dono do post (exceto ao comentar o próprio post).
        if ($post->user_id !== $user->id) {
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
            'created_at' => $newComment['created_at'],
        ], 201);
    }

    /**
     * Acrescenta a foto de perfil do autor a cada post e enriquece cada
     * comentário com o username/foto do respetivo autor — numa única query
     * de utilizadores para evitar o problema N+1.
     */
    private function enrichMany($posts)
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

        return $posts->map(function ($p) use ($users) {
            $author = $users->get((string) $p->user_id);
            $arr = $p->toArray();
            $arr['photo_url'] = $author->photo_url ?? null;
            $arr['comments'] = array_map(function ($c) use ($users) {
                $u = $users->get((string) ($c['user_id'] ?? ''));
                return [
                    'id'         => $c['id'] ?? null,
                    'user_id'    => $c['user_id'] ?? null,
                    'username'   => $u->username ?? 'utilizador',
                    'photo_url'  => $u->photo_url ?? null,
                    'comment'    => $c['comment'] ?? '',
                    'created_at' => $c['created_at'] ?? null,
                ];
            }, $p->comments ?? []);
            return $arr;
        })->values();
    }
}
