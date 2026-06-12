<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_register_creates_user_and_returns_token(): void
    {
        $res = $this->postJson('/api/register', [
            'name'     => 'Maria',
            'email'    => 'maria@example.com',
            'username' => 'maria',
            'password' => 'secret123',
        ]);

        $res->assertCreated()
            ->assertJsonStructure(['user' => ['name', 'email', 'username'], 'token'])
            // A password nunca é devolvida ao cliente.
            ->assertJsonMissingPath('user.password');

        $this->assertNotNull(User::where('email', 'maria@example.com')->first());
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@example.com']);

        $res = $this->postJson('/api/register', [
            'name'     => 'Outro',
            'email'    => 'dup@example.com',
            'username' => 'outro',
            'password' => 'secret123',
        ]);

        $res->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_register_requires_minimum_password_length(): void
    {
        $res = $this->postJson('/api/register', [
            'name'     => 'Curta',
            'email'    => 'curta@example.com',
            'username' => 'curta',
            'password' => '123',
        ]);

        $res->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_login_succeeds_with_correct_credentials(): void
    {
        User::factory()->create([
            'email'    => 'joao@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $res = $this->postJson('/api/login', [
            'email'    => 'joao@example.com',
            'password' => 'secret123',
        ]);

        $res->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'joao@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $res = $this->postJson('/api/login', [
            'email'    => 'joao@example.com',
            'password' => 'errada',
        ]);

        $res->assertStatus(401);
    }
}
