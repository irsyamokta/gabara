<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Discussion;
use App\Models\DiscussionReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiscussionReplyController extends Controller
{
    public function store(Request $request, $classId, Discussion $discussion)
    {
        $payload = $request->all();

        // Map description -> reply_text (kalau frontend kirim field berbeda)
        if (isset($payload['description']) && ! isset($payload['reply_text'])) {
            $payload['reply_text'] = $payload['description'];
        }

        $validated = validator($payload, [
            'reply_text' => 'required|string',
            'parent_id'  => 'nullable|uuid',
        ])->validate();

        // Pastikan discussion sesuai class
        if ((string) $discussion->class_id !== (string) $classId) {
            abort(404, 'Diskusi tidak ditemukan di kelas ini.');
        }

        $class = ClassModel::findOrFail($classId);

        // Hanya student terdaftar boleh reply (mentor dan admin di-bypass)
        $user = Auth::user();
        if ($user->role === 'student' && ! $class->enrollments()->where('student_id', $user->id)->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        // Prevent replies on closed discussions
        if ($discussion->status === 'closed') {
            abort(403, 'Diskusi ini sudah ditutup dan tidak dapat menerima balasan baru.');
        }

        $parentId = $validated['parent_id'] ?? null;
        if ($parentId) {
            $parent = DiscussionReply::find($parentId);
            if (! $parent || (string) $parent->discussion_id !== (string) $discussion->id) {
                return back()->withErrors(['parent_id' => 'Parent reply invalid']);
            }
        }

        // Assign authenticated user
        $user = Auth::user();

        // ANTI-SPAM: minimal jeda 2 menit per user per discussion untuk BALASAN (nested)
        if ($parentId) {
            $lastReply = DiscussionReply::where('discussion_id', $discussion->id)
                ->where('user_id', $user->id)
                ->whereNotNull('parent_id') // Hanya cek balasan nested sebelumnya
                ->latest('created_at')
                ->first();

            if ($lastReply && $lastReply->created_at->gt(now()->subMinutes(2))) {
                // return back with friendly message (Inertia will show flash)
                return back()->withErrors(['reply_text' => 'Anda hanya bisa membalas komentar setiap 2 menit sekali.']);
            }
        }

        // Simpan reply baru
        DiscussionReply::create([
            'discussion_id' => $discussion->id,
            'user_id'       => Auth::id(),
            'reply_text'    => $validated['reply_text'],
            'parent_id'     => $parentId,
            'posted_at'     => now(),
        ]);

        // 🔑 Kunci penting: reload ulang halaman dengan data nested reply
        return redirect()
            ->route('discussions.show', [
                'class'      => $classId,
                'discussion' => $discussion->id,
            ])
            ->with('success', 'Balasan berhasil ditambahkan.');
    }

    public function index($classId, Discussion $discussion)
    {
        if ((string) $discussion->class_id !== (string) $classId) {
            abort(404, 'Diskusi tidak ditemukan di kelas ini.');
        }

        // Ambil top-level replies + anak-anaknya
        $replies = $discussion->discussionReplies()
            ->whereNull('parent_id')
            ->with(['user:id,name,avatar', 'children'])
            ->orderBy('posted_at', 'asc')
            ->get();

        return response()->json($replies);
    }
}
