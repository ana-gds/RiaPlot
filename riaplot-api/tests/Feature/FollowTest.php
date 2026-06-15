<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FollowTest extends TestCase
{
    public function test_follow_updates_both_sides_and_creates_notification(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create();

        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$target->id}/follow")
            ->assertOk()
            ->assertJsonPath('is_following', true)
            ->assertJsonPath('followers_count', 1);

        $this->assertContains($target->id, $me->fresh()->following);
        $this->assertContains($me->id, $target->fresh()->followers);

        $this->assertSame(
            1,
            Notification::where('user', $target->id)->where('type', 'follow')->count(),
        );
    }

    public function test_follow_is_a_toggle(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create();

        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('is_following', true);
        $this->postJson("/api/users/{$target->id}/follow")->assertJsonPath('is_following', false);

        $this->assertNotContains($target->id, $me->fresh()->following ?? []);
        $this->assertNotContains($me->id, $target->fresh()->followers ?? []);
    }

    public function test_cannot_follow_self(): void
    {
        $me = User::factory()->create();
        Sanctum::actingAs($me);

        $this->postJson("/api/users/{$me->id}/follow")->assertStatus(422);
    }

    public function test_followers_and_following_lists_resolve_users(): void
    {
        $me     = User::factory()->create();
        $target = User::factory()->create();

        Sanctum::actingAs($me);
        $this->postJson("/api/users/{$target->id}/follow")->assertOk();

        // Quem o $me segue inclui o $target.
        $this->getJson("/api/users/{$me->id}/following")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', (string) $target->id)
            ->assertJsonPath('0.username', $target->username);

        // Os seguidores do $target incluem o $me.
        $this->getJson("/api/users/{$target->id}/followers")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', (string) $me->id);
    }
}
