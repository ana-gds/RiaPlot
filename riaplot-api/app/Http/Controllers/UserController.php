<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Lista/pesquisa utilizadores (dados públicos não sensíveis).
     * `?q=` filtra por nome ou username (case-insensitive). Sem `q`,
     * devolve todos limitado a 50 resultados.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($q = trim((string) $request->query('q', ''))) {
            // Escapa caracteres especiais de regex para evitar erros/injeção.
            $safe = preg_quote($q, '/');
            $query->where(function ($w) use ($safe) {
                $w->where('username', 'regex', "/{$safe}/i")
                  ->orWhere('name', 'regex', "/{$safe}/i");
            });
        }

        $users = $query->limit(50)->get();

        return response()->json(
            $users->map(fn ($user) => [
                'id'        => (string) $user->_id,
                'name'      => $user->name,
                'username'  => $user->username,
                'photo_url' => $user->photo_url ?? null,
            ])->values()
        );
    }

    /**
     * Perfil público de um utilizador (dados não sensíveis).
     */
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }

        return response()->json([
            'id'        => (string) $user->_id,
            'name'      => $user->name,
            'username'  => $user->username,
            'photo_url' => $user->photo_url ?? null,
            'followers' => $user->followers ?? [],
            'following' => $user->following ?? [],
        ]);
    }

    /**
     * Lista (resumida) dos seguidores de um utilizador.
     */
    public function followers($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }
        return response()->json($this->resolveUsers($user->followers ?? []));
    }

    /**
     * Lista (resumida) de quem um utilizador segue.
     */
    public function following($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }
        return response()->json($this->resolveUsers($user->following ?? []));
    }

    /**
     * Converte um array de ids em dados públicos resumidos, numa única query.
     */
    private function resolveUsers(array $ids)
    {
        if (empty($ids)) return [];

        return User::whereIn('_id', $ids)->get()->map(fn ($u) => [
            'id'        => (string) $u->_id,
            'name'      => $u->name,
            'username'  => $u->username,
            'photo_url' => $u->photo_url ?? null,
        ])->values();
    }

    /**
     * Segue/deixa de seguir um utilizador (toggle). Mantém os dois lados
     * sincronizados (o meu `following` e o `followers` do alvo) e gera uma
     * notificação para o alvo quando começo a segui-lo.
     */
    public function follow(Request $request, $id)
    {
        $me = $request->user();

        if ($me->id === $id) {
            return response()->json(['message' => 'Não te podes seguir a ti próprio'], 422);
        }

        $target = User::find($id);
        if (!$target) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }

        $following = $me->following ?? [];
        $followers = $target->followers ?? [];

        if (in_array($id, $following)) {
            // Deixar de seguir
            $following = array_values(array_filter($following, fn($u) => $u !== $id));
            $followers = array_values(array_filter($followers, fn($u) => $u !== $me->id));
            $isFollowing = false;
        } else {
            // Seguir
            $following[] = $id;
            $followers[] = $me->id;
            $isFollowing = true;

            Notification::create([
                'type'  => 'follow',
                'user'  => $id,
                'actor' => $me->id,
                'read'  => false,
            ]);
        }

        $me->update(['following' => $following]);
        $target->update(['followers' => $followers]);

        return response()->json([
            'is_following'    => $isFollowing,
            'following'       => $following,
            'followers_count' => count($followers),
        ]);
    }
}
