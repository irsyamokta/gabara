<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\ClassModel;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class QuizController extends Controller
{
    // =========================================================================
    // ===== BAGIAN UNTUK MENTOR (ROUTE GLOBAL /quizzes) =====
    // =========================================================================

    /**
     * Menampilkan daftar semua kuis yang dibuat oleh mentor yang sedang login, atau semua kuis jika admin.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            // Admin dapat melihat semua kuis
            $quizzes = Quiz::with('class:id,name')
                ->withCount('questions')
                ->orderByDesc('created_at')
                ->get();
            // Admin dapat melihat semua kelas untuk dropdown modal
            $classes = ClassModel::select('id', 'name')->get();
        } else {
            // Mentor hanya melihat kuis miliknya
            $quizzes = Quiz::whereHas('class.mentor', function ($query) use ($user) {
                $query->where('id', $user->id);
            })
                ->with('class:id,name')
                ->withCount('questions')
                ->orderByDesc('created_at')
                ->get();
            // Mentor hanya melihat kelas miliknya
            $classes = ClassModel::where('mentor_id', $user->id)->select('id', 'name')->get();
        }

        return Inertia::render('Quizzes/Quiz', [
            'quizzes' => $quizzes,
            'classes' => $classes,
        ]);
    }

    /**
     * Menampilkan halaman form untuk membuat kuis baru.
     */
    public function create()
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            // Admin dapat melihat semua kelas
            $classes = ClassModel::select('id', 'name')->get();
        } else {
            // Mentor hanya melihat kelas miliknya
            $classes = ClassModel::where('mentor_id', $user->id)->select('id', 'name')->get();
        }

        return Inertia::render('Quizzes/QuizBuilder', [
            'classes' => $classes,
            'quiz' => null,
        ]);
    }

    /**
     * Menyimpan kuis baru ke database.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validasi, pastikan class_id yang dipilih adalah milik mentor atau admin dapat memilih semua
        $classRule = [
            'required',
            'uuid',
            Rule::exists('classes', 'id'),
        ];
        if ($user->role !== 'admin') {
            $classRule[] = Rule::exists('classes', 'id')->where(function ($query) use ($user) {
                $query->where('mentor_id', $user->id);
            });
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_open' => 'nullable|date',
            'time_open' => 'nullable|date_format:H:i',
            'date_close' => 'nullable|date',
            'time_close' => 'nullable|date_format:H:i',
            'time_limit_minutes' => 'required|integer|min:1',
            'status' => 'required|string|in:Draf,Diterbitkan',
            'attempts_allowed' => 'required|integer|min:1',
            'class_id' => $classRule,
            'questions' => 'present|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.type' => 'required|string|in:pilihan_ganda,benar_salah,esai',
            'questions.*.options' => 'present|array',
            'questions.*.options.*.text' => ['exclude_if:questions.*.type,esai', 'required', 'string'],
            'questions.*.options.*.is_correct' => ['exclude_if:questions.*.type,esai', 'required', 'boolean'],
        ]);

        // Gabung date dan time menjadi datetime untuk database
        $openDatetime = null;
        $closeDatetime = null;

        if ($validated['date_open'] && $validated['time_open']) {
            $openDatetime = $validated['date_open'] . ' ' . $validated['time_open'] . ':00';
        } elseif ($validated['date_open']) {
            $openDatetime = $validated['date_open'] . ' 00:00:00';
        }

        if ($validated['date_close'] && $validated['time_close']) {
            $closeDatetime = $validated['date_close'] . ' ' . $validated['time_close'] . ':00';
        } elseif ($validated['date_close']) {
            $closeDatetime = $validated['date_close'] . ' 23:59:59';
        }

        // Validasi bahwa close datetime setelah open datetime jika keduanya ada
        if ($openDatetime && $closeDatetime && strtotime($closeDatetime) <= strtotime($openDatetime)) {
            return back()->withErrors(['date_close' => 'Tanggal dan waktu tutup harus setelah tanggal dan waktu buka.']);
        }

        $quizData = collect($validated)->except(['questions', 'date_open', 'time_open', 'date_close', 'time_close'])->toArray();
        $quizData['open_datetime'] = $openDatetime;
        $quizData['close_datetime'] = $closeDatetime;

        DB::transaction(function () use ($quizData, $validated) {
            $quiz = Quiz::create($quizData);
            foreach ($validated['questions'] ?? [] as $questionData) {
                $quiz->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? [],
                ]);
            }
        });

        return redirect()->route('quizzes.index')->with('success', 'Quiz berhasil dibuat');
    }

    /**
     * Menampilkan detail kuis (untuk preview mentor atau admin).
     */
    public function show(Quiz $quiz)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            $this->authorizeMentorAction($quiz);
        }

        $quiz->load(['questions', 'class:id,name'])->loadCount('questions');

        $quiz->questions->transform(function ($question) {
            if (is_string($question->options)) {
                $decoded = json_decode($question->options, true);
                $question->options = is_array($decoded) ? $decoded : [];
            } elseif (is_array($question->options)) {
                // biarkan apa adanya
            } elseif ($question->options === null) {
                $question->options = [];
            } else {
                $question->options = [];
            }
            return $question;
        });

        return Inertia::render('Quizzes/QuizDetail', [
            'quiz' => $quiz,
        ]);
    }

    public function edit(Quiz $quiz)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            $this->authorizeMentorAction($quiz);
        }

        $quiz->load(['questions', 'class:id,name'])->loadCount('questions');

        $quiz->questions->transform(function ($question) {
            if (is_string($question->options)) {
                $decoded = json_decode($question->options, true);
                $question->options = is_array($decoded) ? $decoded : [];
            } elseif (is_array($question->options)) {
                // biarkan apa adanya
            } else {
                $question->options = [];
            }
            return $question;
        });

        // Split datetime menjadi date dan time untuk frontend
        $quizData = $quiz->toArray();
        if ($quiz->open_datetime) {
            $openDateTime = \Carbon\Carbon::parse($quiz->open_datetime);
            $quizData['date_open'] = $openDateTime->format('Y-m-d');
            $quizData['time_open'] = $openDateTime->format('H:i');
        } else {
            $quizData['date_open'] = '';
            $quizData['time_open'] = '00:00';
        }

        if ($quiz->close_datetime) {
            $closeDateTime = \Carbon\Carbon::parse($quiz->close_datetime);
            $quizData['date_close'] = $closeDateTime->format('Y-m-d');
            $quizData['time_close'] = $closeDateTime->format('H:i');
        } else {
            $quizData['date_close'] = '';
            $quizData['time_close'] = '00:00';
        }

        if ($user->role === 'admin') {
            $classes = ClassModel::select('id', 'name')->get();
        } else {
            $classes = ClassModel::where('mentor_id', $user->id)->select('id', 'name')->get();
        }

        return Inertia::render('Quizzes/QuizBuilder', [
            'quiz' => $quizData,
            'classes' => $classes,
        ]);
    }

    /**
     * Memperbarui kuis di database.
     */
    public function update(Request $request, Quiz $quiz)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            $this->authorizeMentorAction($quiz); // Keamanan
        }

        // Validasi, pastikan class_id yang dipilih adalah milik mentor atau admin dapat memilih semua
        $classRule = [
            'required',
            'uuid',
            Rule::exists('classes', 'id'),
        ];
        if ($user->role !== 'admin') {
            $classRule[] = Rule::exists('classes', 'id')->where(function ($query) use ($user) {
                $query->where('mentor_id', $user->id);
            });
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_open' => 'nullable|date',
            'time_open' => 'nullable|date_format:H:i',
            'date_close' => 'nullable|date',
            'time_close' => 'nullable|date_format:H:i',
            'time_limit_minutes' => 'required|integer|min:1',
            'status' => 'required|string|in:Draf,Diterbitkan',
            'attempts_allowed' => 'required|integer|min:1',
            'class_id' => $classRule,
            'questions' => 'present|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.type' => 'required|string|in:pilihan_ganda,benar_salah,esai',
            'questions.*.options' => 'present|array',
            'questions.*.options.*.text' => ['exclude_if:questions.*.type,esai', 'required', 'string'],
            'questions.*.options.*.is_correct' => ['exclude_if:questions.*.type,esai', 'required', 'boolean'],
        ]);

        // Gabung date dan time menjadi datetime untuk database
        $openDatetime = null;
        $closeDatetime = null;

        if ($validated['date_open'] && $validated['time_open']) {
            $openDatetime = $validated['date_open'] . ' ' . $validated['time_open'] . ':00';
        } elseif ($validated['date_open']) {
            $openDatetime = $validated['date_open'] . ' 00:00:00';
        }

        if ($validated['date_close'] && $validated['time_close']) {
            $closeDatetime = $validated['date_close'] . ' ' . $validated['time_close'] . ':00';
        } elseif ($validated['date_close']) {
            $closeDatetime = $validated['date_close'] . ' 23:59:59';
        }

        // Validasi bahwa close datetime setelah open datetime jika keduanya ada
        if ($openDatetime && $closeDatetime && strtotime($closeDatetime) <= strtotime($openDatetime)) {
            return back()->withErrors(['date_close' => 'Tanggal dan waktu tutup harus setelah tanggal dan waktu buka.']);
        }

        $quizData = collect($validated)->except(['questions', 'date_open', 'time_open', 'date_close', 'time_close'])->toArray();
        $quizData['open_datetime'] = $openDatetime;
        $quizData['close_datetime'] = $closeDatetime;

        DB::transaction(function () use ($quiz, $quizData, $validated) {
            $quiz->update($quizData);
            $quiz->questions()->delete();
            foreach ($validated['questions'] ?? [] as $questionData) {
                $quiz->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? [],
                ]);
            }
        });

        return redirect()->route('quizzes.index')->with('success', 'Quiz berhasil diperbarui');
    }

    /**
     * Menghapus kuis.
     */
    public function destroy(Quiz $quiz)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            $this->authorizeMentorAction($quiz); // Keamanan
        }
        $quiz->delete();
        return redirect()->route('quizzes.index')->with('success', 'Quiz berhasil dihapus');
    }

    public function data(Quiz $quiz)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            $this->authorizeMentorAction($quiz);
        }
        $quiz->load(['class:id,name', 'questions']);
        foreach ($quiz->questions as $question) {
            if (is_string($question->options)) {
                $decoded = json_decode($question->options, true);
                $question->options = is_array($decoded) ? $decoded : [];
            }
        }

        // Split datetime menjadi date dan time untuk frontend
        $quizData = $quiz->toArray();
        if ($quiz->open_datetime) {
            $openDateTime = \Carbon\Carbon::parse($quiz->open_datetime);
            $quizData['date_open'] = $openDateTime->format('Y-m-d');
            $quizData['time_open'] = $openDateTime->format('H:i');
        } else {
            $quizData['date_open'] = '';
            $quizData['time_open'] = '00:00';
        }

        if ($quiz->close_datetime) {
            $closeDateTime = \Carbon\Carbon::parse($quiz->close_datetime);
            $quizData['date_close'] = $closeDateTime->format('Y-m-d');
            $quizData['time_close'] = $closeDateTime->format('H:i');
        } else {
            $quizData['date_close'] = '';
            $quizData['time_close'] = '00:00';
        }

        return response()->json($quizData);
    }

    // =========================================================================
    // ===== BAGIAN UNTUK SISWA (ROUTE NESTED /classes/{class}/quizzes/{quiz}) =====
    // =========================================================================

    /**
     * Menampilkan detail kuis untuk siswa di dalam kelas tertentu.
     */
   public function showForStudent(ClassModel $class, Quiz $quiz)
{
    $user = Auth::user();

    // 🔒 Pastikan siswa terdaftar di kelas & kuis sesuai kelas
    if (
        !$class->enrollments()->where('student_id', $user->id)->exists() ||
        $quiz->class_id !== $class->id
    ) {
        abort(403, 'Akses tidak diizinkan.');
    }

    // 🚫 Jika belum dipublikasikan, jangan tampilkan ke siswa
    if ($quiz->status !== 'Diterbitkan' && $user->role === 'student') {
        abort(403, 'Kuis ini belum tersedia.');
    }

    // 📦 Load relasi dasar
    $quiz->load('class:id,name')->loadCount('questions');

    // 🧭 Ambil semua attempt milik user untuk kuis ini (beserta jawaban dan soal)
    $allAttempts = $quiz->quizAttempts()
        ->with(['answers', 'quiz.questions'])
        ->where('student_id', $user->id)
        ->orderByDesc('created_at')
        ->get()
        ->map(function ($attempt) {
            $totalQuestions = $attempt->quiz->questions->count();
            $answeredCount = $attempt->answers->count();

            $correctCount = 0;
            foreach ($attempt->quiz->questions as $q) {
                if ($q->type !== 'esai' && !empty($q->options)) {
                    $options = is_array($q->options)
                        ? $q->options
                        : json_decode($q->options, true);

                    $correctOption = collect($options)->firstWhere('is_correct', true);
                    $answer = $attempt->answers->firstWhere('question_id', $q->id);

                    if ($correctOption && $answer) {
                        if (strtolower(trim($correctOption['text'])) === strtolower(trim($answer->answer_text))) {
                            $correctCount++;
                        }
                    }
                }
            }

            // 💡 Tambahkan field dinamis agar bisa dipakai langsung di frontend
            $attempt->answered_count = $answeredCount;
            $attempt->correct_count = $correctCount;
            $attempt->total_questions = $totalQuestions;

            return $attempt;
        });

    // 🔄 Temukan attempt yang sedang berlangsung
    $latestAttempt = $allAttempts->firstWhere('status', 'in_progress');

    // ✅ Jika tidak ada in_progress, ambil attempt terakhir (entah selesai atau belum)
    if (!$latestAttempt && $allAttempts->isNotEmpty()) {
        $latestAttempt = $allAttempts->first();
    }

    // 🧮 Hitung jumlah attempt yang sudah selesai
    $finishedAttemptCount = $allAttempts->where('status', 'finished')->count();

    // ⚙️ Tentukan apakah siswa boleh memulai attempt baru
    $canAttempt = true;
    $message = null;
    $now = now();

    // 🚫 Cegah jika di luar jadwal
    if ($quiz->open_datetime && $now->isBefore($quiz->open_datetime)) {
        $canAttempt = false;
        $message = 'Kuis belum dibuka.';
    } elseif ($quiz->close_datetime && $now->isAfter($quiz->close_datetime)) {
        $canAttempt = false;
        $message = 'Waktu pengerjaan kuis sudah berakhir.';
    } else {
        // 🔁 Jika ada attempt in_progress, tetap boleh lanjut
        if ($latestAttempt && $latestAttempt->status === 'in_progress') {
            $canAttempt = true;
        }
        // 🚧 Kalau tidak ada yang in_progress dan sudah capai limit → dilarang
        elseif ($quiz->attempts_allowed > 0 && $finishedAttemptCount >= $quiz->attempts_allowed) {
            $canAttempt = false;
            $message = 'Anda sudah mencapai batas attempt yang diperbolehkan.';
        } else {
            $canAttempt = true; // masih boleh mulai attempt baru
        }
    }

    // 📤 Kirim data ke Inertia
    return Inertia::render('Quizzes/QuizInfo', [
        'quiz' => $quiz,
        'attempt' => $latestAttempt,
        'attempts' => $allAttempts,
        'can_attempt' => $canAttempt,
        'message' => $message,
        'classData' => $class->only(['id', 'name']),
    ]);
}




    // =========================================================================
    // ===== HELPER UNTUK KEAMANAN =====
    // =========================================================================

    /**
     * Helper untuk memastikan mentor hanya bisa mengakses kuis miliknya.
     */
    private function authorizeMentorAction(Quiz $quiz)
    {
        $user = Auth::user();
        // Cek apakah mentor_id di kelas yang berelasi dengan kuis ini
        // sama dengan id user yang sedang login.
        if ($quiz->class->mentor_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kuis ini.');
        }
    }
}
