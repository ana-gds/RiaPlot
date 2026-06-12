<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    // Validade do link de reposição, em minutos.
    private const EXPIRES_MINUTES = 60;

    /**
     * Pedido de reposição: gera um token e envia o link por email.
     * Devolve sempre uma resposta genérica — não revela se o email existe.
     */
    public function forgot(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        $user = User::where('email', $data['email'])->first();

        if ($user) {
            // Invalida pedidos anteriores e cria um novo token.
            PasswordResetToken::where('email', $user->email)->delete();

            $raw = Str::random(64);
            PasswordResetToken::create([
                'email' => $user->email,
                'token' => Hash::make($raw),
            ]);

            $resetUrl = rtrim(config('app.frontend_url'), '/')
                . '/reset-password?email=' . urlencode($user->email)
                . '&token=' . $raw;

            try {
                Mail::to($user->email)->send(
                    new ResetPasswordMail($user->name, $resetUrl, self::EXPIRES_MINUTES)
                );
            } catch (\Throwable $e) {
                Log::error('Falha ao enviar email de reposição: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Se existir uma conta com esse email, enviámos um link de reposição.',
        ]);
    }

    /**
     * Define a nova palavra-passe a partir do token recebido por email.
     */
    public function reset(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|min:8',
        ]);

        $record = PasswordResetToken::where('email', $data['email'])->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Link de reposição inválido'], 422);
        }

        // Verifica a expiração.
        if ($record->created_at->addMinutes(self::EXPIRES_MINUTES)->isPast()) {
            $record->delete();
            return response()->json(['message' => 'O link de reposição expirou'], 422);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Utilizador não encontrado'], 404);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        // Consome o token (não pode ser reutilizado).
        PasswordResetToken::where('email', $data['email'])->delete();

        return response()->json(['message' => 'Palavra-passe atualizada com sucesso']);
    }
}
