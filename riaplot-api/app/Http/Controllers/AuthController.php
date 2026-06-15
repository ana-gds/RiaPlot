<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Boat;
use App\Models\Post;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'username' => 'required|string|unique:users',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            ...$data,
            'password'     => Hash::make($data['password']),
            'saved_routes' => [],
            'followers'    => [],
            'following'    => [],
        ]);

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('riaplot')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('riaplot')->plainTextToken,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'             => 'sometimes|string',
            'username'         => 'sometimes|string|unique:users,username,' . $user->id . ',_id',
            'email'            => 'sometimes|email|unique:users,email,' . $user->id . ',_id',
            'password'         => 'sometimes|min:8',
            'current_password' => 'required_with:password',
            'photo_url'        => 'sometimes|string',
        ]);

        if (isset($data['password'])) {
            if (!Hash::check($data['current_password'] ?? '', $user->password)) {
                return response()->json(['message' => 'A palavra-passe atual está incorreta.'], 422);
            }
            $data['password'] = Hash::make($data['password']);
        }
        unset($data['current_password']);

        $user->update($data);
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sessão terminada']);
    }

    /**
     * Elimina permanentemente a conta do utilizador autenticado e todos os
     * dados associados em todas as coleções:
     *   - embarcações e posts próprios;
     *   - comentários/likes deste utilizador (e respostas a esses comentários)
     *     espalhados pelos posts de terceiros;
     *   - notificações onde é destinatário ou autor;
     *   - presença nos arrays followers/following dos outros utilizadores;
     *   - tokens de acesso (Sanctum);
     *   - o próprio documento do utilizador.
     */
    public function destroy(Request $request)
    {
        $user   = $request->user();
        $userId = $user->id;

        // 1. Embarcações e posts próprios.
        Boat::where('user_id', $userId)->delete();
        Post::where('user_id', $userId)->delete();

        // 2. Limpa a participação deste utilizador nos posts de terceiros:
        //    likes no post, os seus comentários (e respostas a eles) e likes
        //    que deu em comentários alheios.
        $posts = Post::where('likes', $userId)
            ->orWhere('comments.user_id', $userId)
            ->orWhere('comments.likes', $userId)
            ->get();

        foreach ($posts as $post) {
            $likes = array_values(array_filter(
                $post->likes ?? [],
                fn($l) => $l !== $userId,
            ));

            // Ids dos comentários deste utilizador — para também apagar as respostas.
            $myCommentIds = [];
            foreach (($post->comments ?? []) as $c) {
                if (($c['user_id'] ?? null) === $userId) {
                    $myCommentIds[] = $c['id'] ?? null;
                }
            }

            $comments = array_values(array_filter(
                $post->comments ?? [],
                fn($c) => ($c['user_id'] ?? null) !== $userId
                    && !in_array($c['parent_id'] ?? null, $myCommentIds, true),
            ));

            // Remove os likes deste utilizador dos comentários que sobram.
            $comments = array_map(function ($c) use ($userId) {
                $c['likes'] = array_values(array_filter(
                    $c['likes'] ?? [],
                    fn($l) => $l !== $userId,
                ));
                return $c;
            }, $comments);

            $post->update(['likes' => $likes, 'comments' => $comments]);
        }

        // 3. Notificações onde é destinatário ou autor.
        Notification::where('user', $userId)
            ->orWhere('actor', $userId)
            ->delete();

        // 4. Remove-o dos followers/following de quem o seguia ou quem ele seguia.
        User::where('followers', $userId)->get()->each(function ($u) use ($userId) {
            $u->update(['followers' => array_values(array_filter(
                $u->followers ?? [], fn($f) => $f !== $userId,
            ))]);
        });
        User::where('following', $userId)->get()->each(function ($u) use ($userId) {
            $u->update(['following' => array_values(array_filter(
                $u->following ?? [], fn($f) => $f !== $userId,
            ))]);
        });

        // 5. Tokens de acesso e, por fim, o próprio utilizador.
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Conta eliminada']);
    }
}
