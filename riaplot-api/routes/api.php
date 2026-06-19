<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoatController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\PoiController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Api\DockController;
use App\Http\Controllers\Api\TideController;
use App\Http\Controllers\SimulacaoController;
use App\Http\Controllers\Api\HidromodController;

// Auth (público) — com rate-limiting para travar brute-force de passwords e
// criação de contas em massa. Passado o limite, o Laravel responde 429.
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1');

// Cais, Rotas e POIs (públicos — o mapa não precisa de login)
Route::get('/docks',       [DockController::class, 'index']);
Route::get('/docks/{id}',  [DockController::class, 'show']);
Route::get('/routes',          [RouteController::class, 'index']);
Route::get('/routes/map',      [RouteController::class, 'mapIndex']);
Route::get('/routes/{id}',     [RouteController::class, 'show']);
Route::get('/pois',        [PoiController::class, 'index']);

// Feed social — leitura pública (visitantes veem o feed). A autenticação é
// opcional: se vier um token válido, o feed é personalizado (privados/bloqueios).
Route::get('/posts',       [PostController::class, 'index']);
Route::get('/posts/{id}',  [PostController::class, 'show']);

// Marés (pública), todas do modelo Valida4D. /local varia com a coordenada;
// /current e /tides usam o ponto de referência de Aveiro.
Route::get('/tides/current', [TideController::class, 'current']);
Route::get('/tides/local',   [TideController::class, 'local']);
Route::get('/tides',         [TideController::class, 'index']);

// Tudo o resto precisa de autenticação
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Perfil
    Route::get('/user',    fn(\Illuminate\Http\Request $r) => $r->user());
    Route::patch('/user',  [AuthController::class, 'update']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    // Upload de imagens — guardado no disk configurado por UPLOADS_DISK
    // (s3 em produção, local em dev). A URL devolvida é pública e direta
    // ao storage; não passa pelo Laravel, por isso aguenta tráfego sem custo.
    Route::post('/upload', function(\Illuminate\Http\Request $request) {
        // Restringe a formatos de imagem rasterizada seguros. SVG é
        // deliberadamente excluído porque permite JavaScript embebido (XSS).
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);
        // A extensão é derivada do conteúdo real do ficheiro (MIME), nunca do
        // nome enviado pelo cliente — evita guardar ficheiros executáveis.
        $ext      = $request->file('image')->extension() ?: 'jpg';
        $filename = 'uploads/' . uniqid('img_', true) . '.' . $ext;

        $disk = \Illuminate\Support\Facades\Storage::disk(env('UPLOADS_DISK', 'public'));
        $disk->put($filename, file_get_contents($request->file('image')->getRealPath()), 'public');

        return response()->json(['url' => $disk->url($filename)]);
    });

    // Upload de ficheiro GPX (rota percorrida)
    Route::post('/upload-gpx', function(\Illuminate\Http\Request $request) {
        // O MIME de ficheiros .gpx varia muito entre browsers (xml, octet-stream…),
        // por isso validamos a extensão manualmente em vez de usar `mimetypes`.
        $request->validate([
            'gpx' => 'required|file|max:10240',
        ]);
        $ext = strtolower($request->file('gpx')->getClientOriginalExtension());
        if ($ext !== 'gpx') {
            return response()->json(['message' => 'O ficheiro tem de ter a extensão .gpx'], 422);
        }
        $filename = 'uploads/' . uniqid('gpx_', true) . '.gpx';

        $disk = \Illuminate\Support\Facades\Storage::disk(env('UPLOADS_DISK', 'public'));
        $disk->put($filename, file_get_contents($request->file('gpx')->getRealPath()), 'public');

        return response()->json(['url' => $disk->url($filename)]);
    });

    // Embarcações
    Route::apiResource('boats', BoatController::class);

    // Posts / Social (index e show são públicos — ver acima)
    Route::apiResource('posts', PostController::class)->except(['index', 'show']);
    Route::post('/posts/{id}/like',    [PostController::class, 'like']);
    Route::post('/posts/{id}/comment', [PostController::class, 'comment']);
    Route::patch('/posts/{id}/comment/{commentId}',  [PostController::class, 'updateComment']);
    Route::delete('/posts/{id}/comment/{commentId}', [PostController::class, 'deleteComment']);
    Route::post('/posts/{id}/comment/{commentId}/like', [PostController::class, 'likeComment']);

    // Utilizadores (perfil público) + seguir / deixar de seguir
    Route::get('/users',                  [UserController::class, 'index']);
    Route::get('/users/{id}',             [UserController::class, 'show']);
    Route::get('/users/{id}/followers',   [UserController::class, 'followers']);
    Route::get('/users/{id}/following',   [UserController::class, 'following']);
    Route::post('/users/{id}/follow',     [UserController::class, 'follow']);
    Route::post('/users/{id}/block',      [UserController::class, 'block']);

    // Privacidade: pedidos de seguidor (conta privada) e bloqueados
    Route::get('/follow-requests',                 [UserController::class, 'followRequests']);
    Route::post('/follow-requests/{id}/accept',    [UserController::class, 'acceptRequest']);
    Route::post('/follow-requests/{id}/reject',    [UserController::class, 'rejectRequest']);
    Route::get('/blocked',                         [UserController::class, 'blockedList']);

    // Denúncias (moderação). A criação é limitada para evitar abuso; a listagem
    // e resolução são reservadas a administradores (verificado no controller).
    Route::post('/reports',        [ReportController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/reports',         [ReportController::class, 'index']);
    Route::patch('/reports/{id}',  [ReportController::class, 'resolve']);

    // Rotas guardadas
    Route::post('/routes/{id}/save',   [RouteController::class, 'save']);

    // Notificações
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all',   [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{id}/read',  [NotificationController::class, 'markRead']);
});

Route::middleware('auth:sanctum')->prefix('simulacao')->group(function () {
    Route::post('calcular', [SimulacaoController::class, 'calcular']);
});

Route::middleware('auth:sanctum')->prefix('hidromod')->group(function () {
    Route::get('routes',              [HidromodController::class, 'index']);
    Route::get('routes/process-gpx',  [HidromodController::class, 'processGpxFiles']);
    Route::get('routes/{id}',         [HidromodController::class, 'show']);
    Route::get('routes/{id}/dados',   [HidromodController::class, 'dados']);
});
