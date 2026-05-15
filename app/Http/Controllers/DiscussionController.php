<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Discussion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DiscussionController extends Controller
{
    /**
     * Optional: daftar topik (dipakai kalau butuh halaman index terpisah)
     * Route: GET /classes/{class}/discussions  (or similar)
     */
    public function index(ClassModel $class)
    {
        $user = Auth::user();

        // eager load relations yang diperlukan untuk tampilan class detail (sync with ClassController@show)
        $class->load([
            'mentor:id,name,avatar,role',
            'discussions' => function ($q) {
                $q->with('openerStudent:id,name,avatar,role')->orderByDesc('created_at');
            },
            'meetings' => function ($query) {
                $query->select('id', 'class_id', 'title', 'description', 'created_at')
                    ->with([
                        'materials' => function ($query) {
                            $query->select('id', 'meeting_id', 'link', 'created_at');
                        },
                        'assignments' => function ($query) {
                            $query->select(
                                'id',
                                'meeting_id',
                                'title',
                                'description',
                                'date_open',
                                'time_open',
                                'date_close',
                                'time_close',
                                'file_link',
                                'created_at'
                            )->with(['submissions' => function ($query) {
                                $query->select(
                                    'submissions.id',
                                    'submissions.assignment_id',
                                    'submissions.student_id',
                                    'submissions.feedback',
                                    'submissions.submission_content',
                                    'submissions.grade',
                                    'submissions.submitted_at',
                                    'submissions.created_at',
                                    'users.name as student_name'
                                )->join('users', 'submissions.student_id', '=', 'users.id');
                            }]);
                        },
                    ]);
            },
            'enrollments' => function ($query) {
                $query->select('enrollments.id', 'enrollments.class_id', 'enrollments.student_id')
                    ->with(['student:id,name,avatar,role']);
            },
            'quizzes' => function ($query) use ($user) {
                $query->withCount('questions')
                      ->with(['attempts' => function ($q) use ($user) {
                          if ($user->role === 'student') {
                              $q->where('student_id', $user->id);
                          } else {
                              $q->with('student:id,name');
                          }
                      }])
                      ->orderByDesc('created_at');

                if ($user->role === 'student') {
                    $query->where('status', 'Diterbitkan');
                }
            },
        ]);

        // hanya peserta terdaftar yang boleh mengakses forum bila user adalah student
        if ($user->role === 'student' && ! $class->enrollments()->where('student_id', $user->id)->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        return Inertia::render('Classes/ClassDetail', [
            'class' => $class,
            'userRole' => $user->role,
            'auth' => ['user' => $user],
            'activeTab' => 'Diskusi',
        ]);
    }

    /**
     * Store: buat topik baru (nested under classes/{class}/discussions)
     * Route: POST /classes/{class}/discussions
     */
    public function store(Request $request, ClassModel $class)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $user = Auth::user();

        // cek enroll hanya jika user adalah student
        if ($user->role === 'student' && ! $class->enrollments()->where('student_id', $user->id)->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        $discussion = Discussion::create([
            'class_id' => $class->id,
            'user_id' => $user->id,
            // isi opener_student_id hanya jika ada kolom dan cocok (biasanya buat student)
            'opener_student_id' => $user->role === 'student' ? $user->id : null,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'status' => 'open',
        ]);

        return redirect()
            ->route('discussions.show', [
                'class' => $class->id,
                'discussion' => $discussion->id,
            ])
            ->with('success', 'Topik diskusi berhasil dibuat.');
    }

    /**
     * Show: halaman thread (classes/{class}/discussions/{discussion})
     */
    public function show(ClassModel $class, Discussion $discussion)
{
    if ((string) $discussion->class_id !== (string) $class->id) {
        abort(404, 'Diskusi tidak ditemukan di kelas ini.');
    }

    // Load discussion opener + all replies dengan nested children rekursif
    $discussion->load([
        'openerStudent:id,name,avatar,role',
        'discussionReplies' => function ($q) {
            $q->whereNull('parent_id')
              ->with([
                  'user:id,name,avatar,role',
                  // relasi children() di model sudah rekursif, cukup panggil sekali
                  'children'
              ])
              ->orderBy('posted_at', 'asc');
        },
    ]);

    $class->load(['enrollments.student:id,name,avatar']);

    return Inertia::render('Discussions/DiscussionShow', [
        'class' => $class,
        'discussion' => $discussion,
        'auth' => ['user' => Auth::user()],
    ]);
}

    /**
     * Toggle status open/closed (PATCH classes/{class}/discussions/{discussion}/status)
     */
    public function updateStatus(ClassModel $class, Discussion $discussion)
    {
        if ((string) $discussion->class_id !== (string) $class->id) {
            abort(404, 'Diskusi tidak ditemukan di kelas ini.');
        }

        $user = Auth::user();
        $isOpener = $discussion->opener_student_id === $user->id;
        $isMentorOrAdmin = in_array($user->role, ['mentor', 'admin']);

        if (! $isOpener && ! $isMentorOrAdmin) {
            abort(403, 'Anda tidak memiliki izin untuk mengubah status diskusi.');
        }

        $discussion->status = $discussion->status === 'open' ? 'closed' : 'open';
        $discussion->save();

        return redirect()->back()->with('success', 'Status diskusi diperbarui.');
    }
}
