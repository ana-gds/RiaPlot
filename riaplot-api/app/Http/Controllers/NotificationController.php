<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function markRead($id)
    {
        $notification = Notification::find($id);
        if (!$notification) return response()->json(['message' => 'Não encontrado'], 404);

        $notification->update(['read' => true]);
        return response()->json(['message' => 'Marcado como lido']);
    }
}
