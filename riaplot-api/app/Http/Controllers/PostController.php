<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        return response()->json(
            Post::orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'description' => 'required|string',
            'location'    => 'nullable|string',
            'route_doc'   => 'nullable|string',
            'post_url'    => 'nullable|array',
        ]);

        $post = Post::create([
            ...$data,
            'user_id'  => $request->user()->id,
            'username' => $request->user()->username,
            'likes'    => [],
            'comments' => [],
        ]);

        return response()->json($post, 201);
    }

    public function show($id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);
        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $post = Post::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $post->update($request->all());
        return response()->json($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::where('_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $post->delete();
        return response()->json(['message' => 'Post removido']);
    }

    public function like(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $userId = $request->user()->id;
        $likes  = $post->likes ?? [];

        if (in_array($userId, $likes)) {
            $likes = array_filter($likes, fn($l) => $l !== $userId);
        } else {
            $likes[] = $userId;
        }

        $post->update(['likes' => array_values($likes)]);
        return response()->json(['likes' => count($post->likes)]);
    }

    public function comment(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['message' => 'Não encontrado'], 404);

        $data = $request->validate(['comment' => 'required|string']);

        $comments   = $post->comments ?? [];
        $comments[] = [
            'id'      => (string) new \MongoDB\BSON\ObjectId(),
            'user_id' => $request->user()->id,
            'comment' => $data['comment'],
        ];

        $post->update(['comments' => $comments]);
        return response()->json(['message' => 'Comentário adicionado']);
    }
}
