<?php
namespace App\Http\Controllers;

use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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
            'password'           => Hash::make($data['password']),
            'saved_routes'       => [],
            'followers'          => [],
            'following'          => [],
            'email_verified_at'  => null,
            'verification_token' => Str::random(64),
        ]);

        $this->sendVerificationEmail($user);

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
            'name'      => 'sometimes|string',
            'username'  => 'sometimes|string|unique:users,username,' . $user->id . ',_id',
            'email'     => 'sometimes|email|unique:users,email,' . $user->id . ',_id',
            'password'  => 'sometimes|min:8',
            'photo_url' => 'sometimes|string',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sessão terminada']);
    }

    /**
     * Verifica o email a partir do link enviado (público — id + token).
     */
    public function verifyEmail(Request $request)
    {
        $data = $request->validate([
            'id'    => 'required|string',
            'token' => 'required|string',
        ]);

        $user = User::find($data['id']);

        if (!$user || !$user->verification_token
            || !hash_equals($user->verification_token, $data['token'])) {
            return response()->json(['message' => 'Link de verificação inválido'], 422);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'O email já estava verificado', 'already' => true]);
        }

        $user->update([
            'email_verified_at'  => now(),
            'verification_token' => null,
        ]);

        return response()->json(['message' => 'Email verificado com sucesso']);
    }

    /**
     * Reenvia o email de verificação ao utilizador autenticado.
     */
    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'O email já está verificado']);
        }

        // Garante que existe um token (contas antigas podem não ter).
        if (!$user->verification_token) {
            $user->update(['verification_token' => Str::random(64)]);
        }

        $this->sendVerificationEmail($user);

        return response()->json(['message' => 'Email de verificação reenviado']);
    }

    /**
     * Envia o email de verificação. Falhas de envio não interrompem o fluxo
     * (ex.: registo) — são apenas registadas no log.
     */
    private function sendVerificationEmail(User $user): void
    {
        $verifyUrl = rtrim(config('app.frontend_url'), '/')
            . '/verify-email?id=' . $user->id
            . '&token=' . $user->verification_token;

        try {
            Mail::to($user->email)->send(new VerifyEmailMail($user->name, $verifyUrl));
        } catch (\Throwable $e) {
            Log::error('Falha ao enviar email de verificação: ' . $e->getMessage());
        }
    }
}
