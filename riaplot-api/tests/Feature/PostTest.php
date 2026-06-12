<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostTest extends TestCase
{
    public function test_posts_index_requires_authentication(): void
    {
        $this->getJson('/api/posts')->assertStatus(401);
    }

    public function test_authenticated_user_can_create_post(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $res = $this->postJson('/api/posts', [
            'title'       => 'A minha rota',
            'description' => 'Um belo passeio na ria',
        ]);

        $res->assertCreated();
        $this->assertSame(1, Post::count());
    }

    public function test_index_returns_paginated_envelope(): void
    {
        Sanctum::actingAs(User::factory()->create());

        foreach (range(1, 3) as $i) {
            $this->postJson('/api/posts', ['title' => "Post {$i}"])->assertCreated();
        }

        $this->getJson('/api/posts?page=1&per_page=2')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total'])
            ->assertJsonPath('total', 3)
            ->assertJsonPath('last_page', 2)
            ->assertJsonCount(2, 'data');
    }

    public function test_index_can_filter_by_author(): void
    {
        $author = User::factory()->create();
        $other  = User::factory()->create();

        Sanctum::actingAs($author);
        $this->postJson('/api/posts', ['title' => 'Do autor'])->assertCreated();

        Sanctum::actingAs($other);
        $this->postJson('/api/posts', ['title' => 'De outro'])->assertCreated();

        $this->getJson("/api/posts?user={$author->id}")
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.title', 'Do autor');
    }

    public function test_like_toggles_on_and_off(): void
    {
        $author = User::factory()->create();
        Sanctum::actingAs($author);
        $create = $this->postJson('/api/posts', ['title' => 'Para gostar'])->assertCreated();
        $postId = $create->json('id') ?? $create->json('_id');

        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/posts/{$postId}/like")
            ->assertOk()
            ->assertJsonPath('likes', 1)
            ->assertJsonPath('liked', true);

        $this->postJson("/api/posts/{$postId}/like")
            ->assertOk()
            ->assertJsonPath('likes', 0)
            ->assertJsonPath('liked', false);
    }
}
