<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommentTest extends TestCase
{
    /**
     * Cria um post (de $owner) e um comentário (de $commenter) e devolve
     * [postId, commentId].
     */
    private function makePostWithComment(User $owner, User $commenter): array
    {
        Sanctum::actingAs($owner);
        $post = $this->postJson('/api/posts', ['title' => 'Post'])->assertCreated();
        $postId = $post->json('id') ?? $post->json('_id');

        Sanctum::actingAs($commenter);
        $comment = $this->postJson("/api/posts/{$postId}/comment", ['comment' => 'Original'])
            ->assertCreated();

        return [$postId, $comment->json('id')];
    }

    public function test_author_can_edit_own_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        Sanctum::actingAs($commenter);
        $this->patchJson("/api/posts/{$postId}/comment/{$commentId}", ['comment' => 'Editado'])
            ->assertOk()
            ->assertJsonPath('comment', 'Editado');

        $comments = Post::find($postId)->comments;
        $this->assertSame('Editado', $comments[0]['comment']);
    }

    public function test_non_author_cannot_edit_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        // O dono do post não é o autor do comentário — não pode editar.
        Sanctum::actingAs($owner);
        $this->patchJson("/api/posts/{$postId}/comment/{$commentId}", ['comment' => 'Hack'])
            ->assertStatus(403);
    }

    public function test_author_can_delete_own_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        Sanctum::actingAs($commenter);
        $this->deleteJson("/api/posts/{$postId}/comment/{$commentId}")->assertOk();

        $this->assertCount(0, Post::find($postId)->comments);
    }

    public function test_post_owner_can_delete_any_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        // O dono do post pode moderar comentários de outros.
        Sanctum::actingAs($owner);
        $this->deleteJson("/api/posts/{$postId}/comment/{$commentId}")->assertOk();

        $this->assertCount(0, Post::find($postId)->comments);
    }

    public function test_unrelated_user_cannot_delete_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        $stranger  = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        Sanctum::actingAs($stranger);
        $this->deleteJson("/api/posts/{$postId}/comment/{$commentId}")->assertStatus(403);

        $this->assertCount(1, Post::find($postId)->comments);
    }

    public function test_can_like_and_unlike_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        Sanctum::actingAs($owner);

        $this->postJson("/api/posts/{$postId}/comment/{$commentId}/like")
            ->assertOk()
            ->assertJsonPath('likes', 1)
            ->assertJsonPath('liked', true);

        $this->postJson("/api/posts/{$postId}/comment/{$commentId}/like")
            ->assertOk()
            ->assertJsonPath('likes', 0)
            ->assertJsonPath('liked', false);
    }

    public function test_can_reply_to_comment(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        Sanctum::actingAs($owner);
        $this->postJson("/api/posts/{$postId}/comment", [
            'comment'   => 'Uma resposta',
            'parent_id' => $commentId,
        ])->assertCreated()
          ->assertJsonPath('parent_id', $commentId);

        $comments = Post::find($postId)->comments;
        $this->assertCount(2, $comments);
    }

    public function test_deleting_parent_comment_removes_its_replies(): void
    {
        $owner     = User::factory()->create();
        $commenter = User::factory()->create();
        [$postId, $commentId] = $this->makePostWithComment($owner, $commenter);

        // Adiciona uma resposta ao comentário.
        Sanctum::actingAs($owner);
        $this->postJson("/api/posts/{$postId}/comment", [
            'comment'   => 'Resposta',
            'parent_id' => $commentId,
        ])->assertCreated();
        $this->assertCount(2, Post::find($postId)->comments);

        // Apagar o comentário pai remove também a resposta (cascata).
        $this->deleteJson("/api/posts/{$postId}/comment/{$commentId}")->assertOk();
        $this->assertCount(0, Post::find($postId)->comments);
    }
}
