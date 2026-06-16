<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /** Motivos de denúncia aceites (alinhados com o frontend). */
    private const REASONS = ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'];

    /**
     * Cria uma denúncia de um post ou utilizador. Qualquer utilizador
     * autenticado pode denunciar; cada um só pode ter uma denúncia pendente
     * por alvo (evita spam de denúncias).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'target_type' => 'required|in:post,user',
            'target_id'   => 'required|string',
            'reason'      => 'required|in:' . implode(',', self::REASONS),
            'details'     => 'nullable|string|max:500',
        ]);

        $me = $request->user();

        // Confirma que o alvo existe e não é o próprio utilizador.
        if ($data['target_type'] === 'post') {
            $target = Post::find($data['target_id']);
        } else {
            $target = User::find($data['target_id']);
            if ($target && (string) $target->_id === $me->id) {
                return response()->json(['message' => 'Não te podes denunciar a ti próprio.'], 422);
            }
        }

        if (!$target) {
            return response()->json(['message' => 'Conteúdo não encontrado.'], 404);
        }

        // Já existe uma denúncia pendente deste utilizador para este alvo?
        $existing = Report::where('reporter_id', $me->id)
            ->where('target_type', $data['target_type'])
            ->where('target_id', $data['target_id'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Já denunciaste este conteúdo.', 'already' => true], 200);
        }

        Report::create([
            ...$data,
            'reporter_id' => $me->id,
            'status'      => 'pending',
        ]);

        return response()->json(['message' => 'Denúncia enviada. Obrigado por ajudares a manter a comunidade segura.'], 201);
    }

    /**
     * Lista as denúncias (moderação). Reservado a administradores — o campo
     * `is_admin` não é mass-assignable, por isso só pode ser definido na BD.
     */
    public function index(Request $request)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Sem permissão'], 403);
        }

        $status = $request->query('status', 'pending');
        $reports = Report::where('status', $status)
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get()
            ->map(fn ($r) => [
                'id'          => (string) $r->_id,
                'reporter_id' => $r->reporter_id,
                'target_type' => $r->target_type,
                'target_id'   => $r->target_id,
                'reason'      => $r->reason,
                'details'     => $r->details ?? null,
                'status'      => $r->status,
                'created_at'  => $r->created_at,
            ]);

        return response()->json($reports);
    }

    /**
     * Resolve uma denúncia (moderação): marca como revista ou descartada e,
     * opcionalmente, remove o conteúdo denunciado.
     */
    public function resolve(Request $request, $id)
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json(['message' => 'Sem permissão'], 403);
        }

        $data = $request->validate([
            'status'        => 'required|in:reviewed,dismissed',
            'delete_target' => 'sometimes|boolean',
        ]);

        $report = Report::find($id);
        if (!$report) {
            return response()->json(['message' => 'Denúncia não encontrada'], 404);
        }

        if (($data['delete_target'] ?? false) && $report->target_type === 'post') {
            Post::where('_id', $report->target_id)->delete();
        }

        $report->update(['status' => $data['status']]);

        return response()->json(['message' => 'Denúncia atualizada', 'status' => $data['status']]);
    }

    private function isAdmin($user): bool
    {
        return (bool) ($user->is_admin ?? false);
    }
}
