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
     * devolve todos limitado a 50 resultados. Exclui quem optou por não
     * aparecer na pesquisa (`searchable = false`) e bloqueios (em ambos os
     * sentidos).
     */
    public function index(Request $request)
    {
        $me = $request->user();
        $query = User::query();

        if ($q = trim((string) $request->query('q', ''))) {
            // Escapa caracteres especiais de regex para evitar erros/injeção.
            $safe = preg_quote($q, '/');
            $query->where(function ($w) use ($safe) {
                $w->where('username', 'regex', "/{$safe}/i")
                  ->orWhere('name', 'regex', "/{$safe}/i");
            });
        }

        // Opt-out da pesquisa: só esconde quem tem `searchable` explicitamente
        // a false (contas antigas, sem o campo, continuam a aparecer).
        $query->where('searchable', '!=', false);

        $users = $query->limit(50)->get();

        // Remove o próprio, quem bloqueei e quem me bloqueou.
        $iBlocked  = $me->blocked ?? [];
        $blockedMe = User::where('blocked', $me->id)->get()
            ->map(fn ($u) => (string) $u->_id)->all();

        return response()->json(
            $users
                ->filter(fn ($u) =>
                    (string) $u->_id !== $me->id
                    && !in_array((string) $u->_id, $iBlocked)
                    && !in_array((string) $u->_id, $blockedMe))
                ->map(fn ($user) => [
                    'id'        => (string) $user->_id,
                    'name'      => $user->name,
                    'username'  => $user->username,
                    'photo_url' => $user->photo_url ?? null,
                ])->values()
        );
    }

    /**
     * Perfil público de um utilizador, com a relação face a quem o vê
     * (sigo / pedido pendente / privado). Bloqueios tornam o perfil
     * indisponível em ambos os sentidos.
     */
    public function show(Request $request, $id)
    {
        $me = $request->user();
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }

        if (in_array($id, $me->blocked ?? []) || in_array($me->id, $user->blocked ?? [])) {
            return response()->json(['message' => 'Perfil indisponível', 'unavailable' => true], 403);
        }

        return response()->json([
            'id'             => (string) $user->_id,
            'name'           => $user->name,
            'username'       => $user->username,
            'photo_url'      => $user->photo_url ?? null,
            'bio'            => $user->bio ?? null,
            'is_private'     => (bool) ($user->is_private ?? false),
            'hide_followers' => (bool) ($user->hide_followers ?? false),
            'is_following'   => in_array($id, $me->following ?? []),
            'requested'      => in_array($me->id, $user->follow_requests ?? []),
            'followers'      => $user->followers ?? [],
            'following'      => $user->following ?? [],
        ]);
    }

    /**
     * Lista (resumida) dos seguidores de um utilizador.
     */
    public function followers(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }
        if (!$this->listsVisibleTo($request->user(), $user)) {
            return response()->json([], 200);
        }
        return response()->json($this->resolveUsers($user->followers ?? []));
    }

    /**
     * Lista (resumida) de quem um utilizador segue.
     */
    public function following(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }
        if (!$this->listsVisibleTo($request->user(), $user)) {
            return response()->json([], 200);
        }
        return response()->json($this->resolveUsers($user->following ?? []));
    }

    /**
     * As listas de seguidores/a-seguir só são visíveis para: o próprio; ou,
     * caso `hide_followers` esteja desligado, para quem pode ver o perfil
     * (conta pública ou seguidor de uma privada, sem bloqueios).
     */
    private function listsVisibleTo($me, $target): bool
    {
        $targetId = (string) $target->_id;
        if ($me->id === $targetId) return true;
        if (in_array($targetId, $me->blocked ?? []) || in_array($me->id, $target->blocked ?? [])) {
            return false;
        }
        if ($target->hide_followers ?? false) return false;
        if (($target->is_private ?? false) && !in_array($targetId, $me->following ?? [])) {
            return false;
        }
        return true;
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
     * Segue/deixa de seguir um utilizador (toggle). Para contas privadas, em
     * vez de seguir logo, cria/cancela um pedido de seguidor. Gera notificação
     * para o alvo. Mantém os dois lados sincronizados.
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

        // Bloqueios impedem qualquer interação de seguimento.
        if (in_array($id, $me->blocked ?? []) || in_array($me->id, $target->blocked ?? [])) {
            return response()->json(['message' => 'Ação indisponível'], 403);
        }

        $following = $me->following ?? [];
        $followers = $target->followers ?? [];
        $requests  = $target->follow_requests ?? [];

        // Já sigo → deixar de seguir.
        if (in_array($id, $following)) {
            $following = array_values(array_filter($following, fn ($u) => $u !== $id));
            $followers = array_values(array_filter($followers, fn ($u) => $u !== $me->id));
            $me->update(['following' => $following]);
            $target->update(['followers' => $followers]);

            return response()->json([
                'status'          => 'unfollowed',
                'is_following'    => false,
                'requested'       => false,
                'following'       => $following,
                'followers_count' => count($followers),
            ]);
        }

        // Conta privada → gerir pedido (toggle).
        if ($target->is_private ?? false) {
            if (in_array($me->id, $requests)) {
                $requests = array_values(array_filter($requests, fn ($u) => $u !== $me->id));
                $target->update(['follow_requests' => $requests]);
                return response()->json(['status' => 'cancelled', 'requested' => false, 'is_following' => false]);
            }

            $requests[] = $me->id;
            $target->update(['follow_requests' => $requests]);
            Notification::create([
                'type'  => 'follow_request',
                'user'  => $id,
                'actor' => $me->id,
                'read'  => false,
            ]);
            return response()->json(['status' => 'requested', 'requested' => true, 'is_following' => false]);
        }

        // Conta pública → seguir já.
        $following[] = $id;
        $followers[] = $me->id;
        $me->update(['following' => $following]);
        $target->update(['followers' => $followers]);
        Notification::create([
            'type'  => 'follow',
            'user'  => $id,
            'actor' => $me->id,
            'read'  => false,
        ]);

        return response()->json([
            'status'          => 'followed',
            'is_following'    => true,
            'requested'       => false,
            'following'       => $following,
            'followers_count' => count($followers),
        ]);
    }

    /**
     * Pedidos de seguidor pendentes do utilizador autenticado.
     */
    public function followRequests(Request $request)
    {
        return response()->json($this->resolveUsers($request->user()->follow_requests ?? []));
    }

    /**
     * Aceita um pedido de seguidor: passa o requerente para os meus seguidores
     * e a mim para o `following` dele.
     */
    public function acceptRequest(Request $request, $id)
    {
        $me = $request->user();
        $requests = $me->follow_requests ?? [];
        if (!in_array($id, $requests)) {
            return response()->json(['message' => 'Pedido não encontrado'], 404);
        }

        $requests  = array_values(array_filter($requests, fn ($u) => $u !== $id));
        $followers = $me->followers ?? [];
        if (!in_array($id, $followers)) $followers[] = $id;
        $me->update(['follow_requests' => $requests, 'followers' => $followers]);

        $requester = User::find($id);
        if ($requester) {
            $f = $requester->following ?? [];
            if (!in_array($me->id, $f)) {
                $f[] = $me->id;
                $requester->update(['following' => $f]);
            }
            Notification::create([
                'type'  => 'follow_accept',
                'user'  => $id,
                'actor' => $me->id,
                'read'  => false,
            ]);
        }

        return response()->json(['accepted' => true, 'followers_count' => count($followers)]);
    }

    /**
     * Recusa (remove) um pedido de seguidor pendente.
     */
    public function rejectRequest(Request $request, $id)
    {
        $me = $request->user();
        $requests = array_values(array_filter($me->follow_requests ?? [], fn ($u) => $u !== $id));
        $me->update(['follow_requests' => $requests]);
        return response()->json(['rejected' => true]);
    }

    /**
     * Bloqueia/desbloqueia um utilizador (toggle). Ao bloquear, corta as
     * relações de seguimento e pedidos pendentes nos dois sentidos.
     */
    public function block(Request $request, $id)
    {
        $me = $request->user();
        if ($me->id === $id) {
            return response()->json(['message' => 'Não te podes bloquear a ti próprio'], 422);
        }

        $blocked = $me->blocked ?? [];

        if (in_array($id, $blocked)) {
            $blocked = array_values(array_filter($blocked, fn ($u) => $u !== $id));
            $me->update(['blocked' => $blocked]);
            return response()->json(['blocked' => false]);
        }

        $blocked[] = $id;
        $me->update([
            'blocked'         => $blocked,
            'following'       => array_values(array_filter($me->following ?? [], fn ($u) => $u !== $id)),
            'followers'       => array_values(array_filter($me->followers ?? [], fn ($u) => $u !== $id)),
            'follow_requests' => array_values(array_filter($me->follow_requests ?? [], fn ($u) => $u !== $id)),
        ]);

        $other = User::find($id);
        if ($other) {
            $other->update([
                'following'       => array_values(array_filter($other->following ?? [], fn ($u) => $u !== $me->id)),
                'followers'       => array_values(array_filter($other->followers ?? [], fn ($u) => $u !== $me->id)),
                'follow_requests' => array_values(array_filter($other->follow_requests ?? [], fn ($u) => $u !== $me->id)),
            ]);
        }

        return response()->json(['blocked' => true]);
    }

    /**
     * Lista dos utilizadores bloqueados pelo autenticado.
     */
    public function blockedList(Request $request)
    {
        return response()->json($this->resolveUsers($request->user()->blocked ?? []));
    }
}
