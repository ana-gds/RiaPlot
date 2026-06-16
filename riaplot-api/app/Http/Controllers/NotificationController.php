<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('per_page', 20), 1), 50);

        $paginator = Notification::where('user', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $notifications = collect($paginator->items());

        // Enriquece com o autor (quem despoletou) e a miniatura do post,
        // numa única query de cada coleção para evitar o problema N+1.
        $actorIds = array_values(array_unique(array_filter(
            $notifications->pluck('actor')->all()
        )));
        $postIds = array_values(array_unique(array_filter(
            $notifications->pluck('post')->all()
        )));

        $actors = User::whereIn('_id', $actorIds)->get()
            ->keyBy(fn($u) => (string) $u->_id);
        $posts = Post::whereIn('_id', $postIds)->get()
            ->keyBy(fn($p) => (string) $p->_id);

        $data = $notifications->map(function ($n) use ($actors, $posts) {
            $actor = $actors->get((string) $n->actor);
            $post  = $posts->get((string) $n->post);

            return [
                'id'         => (string) $n->_id,
                'type'       => $n->type,
                'actor_id'   => $n->actor ? (string) $n->actor : null,
                'username'   => $actor->username ?? 'utilizador',
                'photo_url'  => $actor->photo_url ?? null,
                'post_id'    => $n->post,
                'thumb'      => $post->post_url[0] ?? null,
                'comment'    => $n->comment ?? null,
                'read'       => (bool) $n->read,
                'created_at' => $n->created_at,
            ];
        })->values();

        return response()->json([
            'data'         => $data,
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
    }

    // Contagem de não-lidas do utilizador autenticado. Endpoint leve usado
    // pelo polling do badge (não carrega a lista inteira).
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user', $request->user()->id)
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('_id', $id)
            ->where('user', $request->user()->id)
            ->first();
        if (!$notification) return response()->json(['message' => 'Não encontrado'], 404);

        $notification->update(['read' => true]);
        return response()->json(['message' => 'Marcado como lido']);
    }

    // Marca todas as notificações do utilizador como lidas.
    public function markAllRead(Request $request)
    {
        $updated = Notification::where('user', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['updated' => $updated]);
    }
}
