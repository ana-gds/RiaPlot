<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasswordAndVerificationTest extends TestCase
{
    public function test_register_sends_verification_email_and_user_starts_unverified(): void
    {
        Mail::fake();

        $this->postJson('/api/register', [
            'name'     => 'Nova',
            'email'    => 'nova@example.com',
            'username' => 'nova',
            'password' => 'secret123',
        ])->assertCreated()
          ->assertJsonPath('user.email_verified_at', null);

        Mail::assertSent(VerifyEmailMail::class);
    }

    public function test_email_verification_succeeds_with_valid_token(): void
    {
        $user = User::factory()->create([
            'email_verified_at'  => null,
            'verification_token' => 'token-valido',
        ]);

        $this->postJson('/api/email/verify', [
            'id'    => $user->id,
            'token' => 'token-valido',
        ])->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_email_verification_rejects_wrong_token(): void
    {
        $user = User::factory()->create([
            'email_verified_at'  => null,
            'verification_token' => 'token-valido',
        ]);

        $this->postJson('/api/email/verify', [
            'id'    => $user->id,
            'token' => 'token-errado',
        ])->assertStatus(422);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_forgot_password_is_generic_for_unknown_email(): void
    {
        Mail::fake();

        // Email inexistente — resposta genérica, sem revelar e sem enviar email.
        $this->postJson('/api/forgot-password', ['email' => 'ninguem@example.com'])
            ->assertOk();

        Mail::assertNothingSent();
    }

    public function test_password_reset_flow_updates_password(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email'    => 'reset@example.com',
            'password' => Hash::make('antiga123'),
        ]);

        $this->postJson('/api/forgot-password', ['email' => 'reset@example.com'])->assertOk();

        // Captura o token em claro a partir do link enviado.
        $rawToken = null;
        Mail::assertSent(ResetPasswordMail::class, function ($mail) use (&$rawToken) {
            parse_str(parse_url($mail->resetUrl, PHP_URL_QUERY), $query);
            $rawToken = $query['token'] ?? null;
            return true;
        });
        $this->assertNotNull($rawToken);

        $this->postJson('/api/reset-password', [
            'email'    => 'reset@example.com',
            'token'    => $rawToken,
            'password' => 'novaSegura123',
        ])->assertOk();

        $fresh = $user->fresh();
        $this->assertTrue(Hash::check('novaSegura123', $fresh->password));
        $this->assertFalse(Hash::check('antiga123', $fresh->password));
    }

    public function test_password_reset_rejects_invalid_token(): void
    {
        User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/reset-password', [
            'email'    => 'reset@example.com',
            'token'    => Str::random(64),
            'password' => 'novaSegura123',
        ])->assertStatus(422);
    }
}
