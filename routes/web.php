<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ProfileController,
    HomepageController,
    DashboardController,
    UserController,
    ClassController,
    EnrollmentController,
    MeetingController,
    MaterialController,
    AssignmentController,
    SubmissionController,
    AnnouncementController,
    DiscussionController,
    DiscussionReplyController,
    QuizController,
    QuizAttemptController,
    QuestionController
};

/*
|--------------------------------------------------------------------------
| Public / Guest
|--------------------------------------------------------------------------
*/
Route::get('/', [HomepageController::class, 'index'])->name('homepage');

/*
|--------------------------------------------------------------------------
| Authenticated (Common)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    /** Dashboard */
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | USERS (Admin Only)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::get('/{id}', [UserController::class, 'show'])->name('users.show');
        Route::post('/', [UserController::class, 'store'])->name('users.store');
        Route::put('/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | ANNOUNCEMENTS
    |--------------------------------------------------------------------------
    */
    Route::prefix('announcements')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');

        Route::middleware('role:admin')->group(function () {
            Route::post('/', [AnnouncementController::class, 'store'])->name('announcements.store');
            Route::patch('/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
            Route::delete('/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | CLASSES (with nested resources)
    |--------------------------------------------------------------------------
    */
    Route::prefix('classes')->group(function () {
        Route::get('/', [ClassController::class, 'index'])->name('classes.index');
        Route::get('/{class}', [ClassController::class, 'show'])->name('classes.show');

        Route::middleware('role:admin|mentor')->group(function () {
            Route::post('/', [ClassController::class, 'store'])->name('classes.store');
            Route::patch('/{class}', [ClassController::class, 'update'])->name('classes.update');
            Route::delete('/{class}', [ClassController::class, 'destroy'])->name('classes.destroy');
        });

        /** Enrollments (student only) */
        Route::middleware('role:student')
            ->post('/enrollments', [EnrollmentController::class, 'store'])
            ->name('enrollments.store');

        /** Meetings (mentor/admin) */
        Route::middleware('role:admin|mentor')->prefix('{class}/meetings')->group(function () {
            Route::post('/', [MeetingController::class, 'store'])->name('meetings.store');
            Route::patch('/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
            Route::delete('/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
        });

        /** Materials (mentor/admin) */
        Route::middleware('role:admin|mentor')->prefix('{class}/materials')->group(function () {
            Route::delete('/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');
        });

        /** Assignments & Submissions */
        Route::prefix('{class}/assignments')->group(function () {
            Route::get('/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');

            Route::middleware('role:admin|mentor')->group(function () {
                Route::delete('/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
            });

            Route::middleware('role:student')->group(function () {
                Route::post('/{assignment}/submissions', [SubmissionController::class, 'store'])->name('submissions.store');
                Route::patch('/{assignment}/submissions/{submission}', [SubmissionController::class, 'update'])->name('submissions.update');
                Route::delete('/{assignment}/submissions/{submission}', [SubmissionController::class, 'destroy'])->name('submissions.destroy');
            });

            Route::middleware('role:admin|mentor')
                ->post('/{assignment}/submissions/{submission}/grade', [SubmissionController::class, 'updateGrade'])
                ->name('submissions.updateGrade');
        });

        /** Discussions */
        Route::prefix('{class}/discussions')->group(function () {
            Route::get('/', [DiscussionController::class, 'index'])->name('discussions.index');
            Route::get('/{discussion}', [DiscussionController::class, 'show'])->name('discussions.show');
            Route::patch('/{discussion}/status', [DiscussionController::class, 'updateStatus'])->name('discussions.updateStatus');

            Route::middleware('role:student')->group(function () {
                Route::post('/', [DiscussionController::class, 'store'])->name('discussions.store');
                Route::post('/{discussion}/replies', [DiscussionReplyController::class, 'store'])->name('discussions.discussionReplies.store');
            });
        });
    });

    /*
|--------------------------------------------------------------------------
| QUIZZES (GLOBAL untuk Mentor & Admin)
|--------------------------------------------------------------------------
| URL: /quizzes/...
*/
Route::prefix('quizzes')->middleware('role:mentor|admin')->group(function () {
    Route::get('/', [QuizController::class, 'index'])->name('quizzes.index');
    Route::get('/create', [QuizController::class, 'create'])->name('quizzes.create');
    Route::post('/', [QuizController::class, 'store'])->name('quizzes.store');
    Route::get('/{quiz}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');
    Route::patch('/{quiz}', [QuizController::class, 'update'])->name('quizzes.update');
    Route::get('/{quiz}', [QuizController::class, 'show'])->whereUuid('quiz')->name('quizzes.show');
    Route::get('/quizzes/{quiz}/data', [QuizController::class, 'data'])->name('quizzes.data'); //KHUSUS FETCHING DATA API QUESTIONS + OPTIONS PADA QUIZBUILDER!!!


    Route::delete('/{quiz}', [QuizController::class, 'destroy'])->name('quizzes.destroy');
});

/*
|--------------------------------------------------------------------------
| NESTED: QUIZZES DI DALAM KELAS (UNTUK SISWA)
|--------------------------------------------------------------------------
| URL: /classes/{class}/quizzes/{quiz}
*/
Route::prefix('classes/{class}/quizzes')->middleware('auth')->group(function () {
    // Tampilkan halaman detail quiz untuk siswa
    Route::get('/{quiz}', [QuizController::class, 'showForStudent'])
        ->name('classes.quizzes.show');

    // Mulai attempt quiz (student only)
    Route::post('/{quiz}/start', [QuizAttemptController::class, 'start'])
        ->middleware('role:student')
        ->name('classes.quizzes.start');
});

/*
|--------------------------------------------------------------------------
| QUIZ ATTEMPTS & HISTORY (UNTUK SISWA)
|--------------------------------------------------------------------------
| URL: /quiz-attempts/...
*/
Route::prefix('quiz-attempts')->middleware(['auth', 'role:student'])->group(function () {
    // Riwayat attempt per quiz
Route::get('/classes/{class}/quizzes/{quiz}/history', [QuizAttemptController::class, 'history'])
    ->middleware(['auth', 'role:student'])
    ->name('quiz.attempts.history');


    Route::get('/{attempt}', [QuizAttemptController::class, 'show'])
        ->name('quiz.attempts.show');

    Route::post('/{attempt}/submit', [QuizAttemptController::class, 'submit'])
        ->name('quiz.attempts.submit');
});

    /*
    |--------------------------------------------------------------------------
    | QUESTIONS (Top-Level)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:mentor|admin')->prefix('questions')->group(function () {
        Route::get('/{quiz}', [QuestionController::class, 'index'])->name('questions.index');
        Route::post('/{quiz}', [QuestionController::class, 'store'])->name('questions.store');
        Route::patch('/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
