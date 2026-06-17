<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrivacyTest extends TestCase
{
    // ── Bloqueio ─────────────────────────────────────────────────────────

    public function test_blocking_removes_follow_relations_and_hides_profile(): void
    {
        $me    = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($me);
        $this->postJson("/api/users/{$other->id}/follow")->assertOk();

        $this->postJson("/api/users/{$other->id}/block")
            ->assertOk()
            ->assertJsonPath('blocked', true);

        $me    = $me->fresh();
        $other = $other->fresh();
        $this->assertContains($other->id, $me->blocked ?? []);
        $this->assertNotContains($other->id, $me->following ?? []);
        $this->assertNotContains($me->id, $other->followers ?? []);

        // O perfil do bloqueado fica indisponível.
        $this->getJson("/api/users/{$other->id}")
            ->assertStatus(403)
            ->assertJsonPath('unavailable', true);
    }

    public function test_block_is_a_toggle_and_lists_blocked(): void
    {
        $me    = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$other->id}/block")->assertJsonPath('blocked', true);
        $this->getJson("/api/blocked")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', (string) $other->id);

        $this->postJson("/api/users/{$other->id}/block")->assertJsonPath('blocked', false);
        $this->getJson("/api/blocked")->assertOk()->assertJsonCount(0);
    }

    public function test_blocked_user_excluded_from_search(): void
    {
        $me    = User::factory()->create();
        $other = User::factory()->create(['username' => 'targetuser', 'name' => 'Target']);
        Sanctum::actingAs($me);

        $this->getJson('/api/users?q=target')->assertOk()->assertJsonCount(1);

        $this->postJson("/api/users/{$other->id}/block");
        $this->getJson('/api/users?q=target')->assertOk()->assertJsonCount(0);
    }

    public function test_blocked_author_posts_hidden_from_feed(): void
    {
        $me    = User::factory()->create();
        $other = User::factory()->create();
        Post::create([
            'user_id' => $other->id, 'username' => $other->username,
            'title' => 'Olá', 'likes' => [], 'comments' => [],
        ]);

        Sanctum::actingAs($me);
        $this->getJson('/api/posts')->assertOk()->assertJsonCount(1, 'data');

        $this->postJson("/api/users/{$other->id}/block");
        $this->getJson('/api/posts')->assertOk()->assertJsonCount(0, 'data');
    }

    // ── Conta privada ────────────────────────────────────────────────────

    public function test_private_account_follow_creates_request(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create(['is_private' => true]);
        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$target->id}/follow")
            ->assertOk()
            ->assertJsonPath('status', 'requested')
            ->assertJsonPath('requested', true)
            ->assertJsonPath('is_following', false);

        $this->assertContains($me->id, $target->fresh()->follow_requests ?? []);
        $this->assertNotContains($target->id, $me->fresh()->following ?? []);
        $this->assertSame(
            1,
            Notification::where('user', $target->id)->where('type', 'follow_request')->count(),
        );
    }

    public function test_follow_request_is_cancellable(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create(['is_private' => true]);
        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('status', 'requested');
        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('status', 'cancelled');

        $this->assertNotContains($me->id, $target->fresh()->follow_requests ?? []);
    }

    public function test_accept_follow_request(): void
    {
        $requester = User::factory()->create();
        $target    = User::factory()->create(['is_private' => true]);

        Sanctum::actingAs($requester);
        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('status', 'requested');

        // `actingAs` congela a instância em memória; recarrega para refletir o
        // pedido gravado na BD (em produção o user é recarregado por token).
        Sanctum::actingAs($target->fresh());
        $this->getJson('/api/follow-requests')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', (string) $requester->id);

        $this->postJson("/api/follow-requests/{$requester->id}/accept")
            ->assertOk()
            ->assertJsonPath('accepted', true);

        $this->assertContains($requester->id, $target->fresh()->followers ?? []);
        $this->assertContains($target->id, $requester->fresh()->following ?? []);
        $this->assertNotContains($requester->id, $target->fresh()->follow_requests ?? []);
    }

    public function test_reject_follow_request(): void
    {
        $requester = User::factory()->create();
        $target    = User::factory()->create(['is_private' => true]);

        Sanctum::actingAs($requester);
        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('status', 'requested');

        Sanctum::actingAs($target->fresh());
        $this->postJson("/api/follow-requests/{$requester->id}/reject")
            ->assertOk()
            ->assertJsonPath('rejected', true);

        $this->assertNotContains($requester->id, $target->fresh()->follow_requests ?? []);
        $this->assertNotContains($requester->id, $target->fresh()->followers ?? []);
    }

    public function test_private_posts_hidden_until_following(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create(['is_private' => true]);
        Post::create([
            'user_id' => $target->id, 'username' => $target->username,
            'title' => 'Privado', 'likes' => [], 'comments' => [],
        ]);

        Sanctum::actingAs($me);
        // Nem no feed nem no perfil enquanto não seguir.
        $this->getJson('/api/posts')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/posts?user={$target->id}")->assertOk()->assertJsonCount(0, 'data');

        // Pede para seguir e o target aceita.
        $this->postJson("/api/users/{$target->id}/follow");
        Sanctum::actingAs($target->fresh());
        $this->postJson("/api/follow-requests/{$me->id}/accept");

        // Agora vê as publicações.
        Sanctum::actingAs($me->fresh());
        $this->getJson("/api/posts?user={$target->id}")->assertOk()->assertJsonCount(1, 'data');
    }

    // ── Visitante (sem sessão) ───────────────────────────────────────────

    public function test_guest_sees_public_feed_without_private_accounts(): void
    {
        $publicUser  = User::factory()->create();
        $privateUser = User::factory()->create(['is_private' => true]);
        Post::create([
            'user_id' => $publicUser->id, 'username' => $publicUser->username,
            'title' => 'Público', 'likes' => [], 'comments' => [],
        ]);
        Post::create([
            'user_id' => $privateUser->id, 'username' => $privateUser->username,
            'title' => 'Privado', 'likes' => [], 'comments' => [],
        ]);

        // Sem autenticação: o feed responde 200 e esconde as contas privadas.
        $this->getJson('/api/posts')->assertOk()->assertJsonCount(1, 'data');
    }
}
