<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoatController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\PoiController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\DockController;

// Auth (público)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Cais, Rotas e POIs (públicos — o mapa não precisa de login)
Route::get('/docks',       [DockController::class, 'index']);
Route::get('/docks/{id}',  [DockController::class, 'show']);
Route::get('/routes',      [RouteController::class, 'index']);
Route::get('/routes/{id}', [RouteController::class, 'show']);
Route::get('/pois',        [PoiController::class, 'index']);

// Tudo o resto precisa de autenticação
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Perfil
    Route::get('/user',    fn(\Illuminate\Http\Request $r) => $r->user());
    Route::patch('/user',  [AuthController::class, 'update']);

    // Upload de imagens
    Route::post('/upload', function(\Illuminate\Http\Request $request) {
        $request->validate(['image' => 'required|image|max:5120']);
        $dir = public_path('uploads');
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $ext      = $request->file('image')->getClientOriginalExtension();
        $filename = uniqid('img_', true) . '.' . $ext;
        $request->file('image')->move($dir, $filename);
        return response()->json(['url' => url('uploads/' . $filename)]);
    });

    // Embarcações
    Route::apiResource('boats', BoatController::class);

    // Posts / Social
    Route::apiResource('posts', PostController::class);
    Route::post('/posts/{id}/like',    [PostController::class, 'like']);
    Route::post('/posts/{id}/comment', [PostController::class, 'comment']);

    // Rotas guardadas
    Route::post('/routes/{id}/save',   [RouteController::class, 'save']);

    // Notificações
    Route::get('/notifications',          [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});
