<?php
namespace App\Http\Controllers;

use App\Models\User;
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
}
