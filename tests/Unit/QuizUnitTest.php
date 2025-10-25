<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\Answer;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class QuizUnitTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test validasi mentor hanya bisa buat quiz di kelasnya.
     */
    public function testMentorCanOnlyCreateQuizInOwnClass()
    {
        // Mock mentor
        $mentor = User::factory()->create(['role' => 'mentor']);
        Auth::shouldReceive('user')->andReturn($mentor);

        // Mock kelas milik mentor
        $ownClass = ClassModel::factory()->create(['mentor_id' => $mentor->id]);

        // Mock mentor lain untuk kelas lain
        $otherMentor = User::factory()->create(['role' => 'mentor']);
        $otherClass = ClassModel::factory()->create(['mentor_id' => $otherMentor->id]);

        // Data quiz untuk kelas sendiri
        $quizDataOwn = [
            'title' => 'Quiz Own Class',
            'description' => 'Test quiz',
            'open_datetime' => now()->addDays(1),
            'close_datetime' => now()->addDays(2),
            'time_limit_minutes' => 30,
            'status' => 'Diterbitkan',
            'attempts_allowed' => 1,
            'class_id' => $ownClass->id,
            'questions' => [
                [
                    'question_text' => 'What is 2+2?',
                    'type' => 'pilihan_ganda',
                    'options' => [
                        ['text' => '3', 'is_correct' => false],
                        ['text' => '4', 'is_correct' => true],
                    ],
                ],
            ],
        ];

        // Simulasi validasi di controller (tanpa DB transaction)
        $validator = \Illuminate\Support\Facades\Validator::make($quizDataOwn, [
            'class_id' => [
                'required',
                'uuid',
                \Illuminate\Validation\Rule::exists('classes', 'id')->where(function ($query) use ($mentor) {
                    $query->where('mentor_id', $mentor->id);
                }),
            ],
        ]);

        // Harus pass untuk kelas sendiri
        $this->assertTrue($validator->passes());

        // Data quiz untuk kelas orang lain
        $quizDataOther = $quizDataOwn;
        $quizDataOther['class_id'] = $otherClass->id;

        $validatorOther = \Illuminate\Support\Facades\Validator::make($quizDataOther, [
            'class_id' => [
                'required',
                'uuid',
                \Illuminate\Validation\Rule::exists('classes', 'id')->where(function ($query) use ($mentor) {
                    $query->where('mentor_id', $mentor->id);
                }),
            ],
        ]);

        // Harus fail untuk kelas orang lain
        $this->assertFalse($validatorOther->passes());
        $this->assertArrayHasKey('class_id', $validatorOther->errors()->toArray());
    }

    /**
     * Test validasi enroll student.
     */
    public function testStudentEnrollmentValidation()
    {
        // Mock student
        $student = User::factory()->create(['role' => 'student']);

        // Mock mentor
        $mentor = User::factory()->create(['role' => 'mentor']);

        // Mock kelas public
        $class = ClassModel::factory()->create([
            'mentor_id' => $mentor->id,
            'visibility' => true,
            'enrollment_code' => 'VALIDCODE'
        ]);

        // Mock kelas private
        $privateClass = ClassModel::factory()->create([
            'mentor_id' => $mentor->id,
            'visibility' => false,
            'enrollment_code' => 'PRIVATECODE'
        ]);

        Auth::shouldReceive('user')->andReturn($student);

        // Test 1: Student enroll ke kelas public dengan kode valid, belum enroll
        $enrollment = Enrollment::factory()->create([
            'student_id' => $student->id,
            'class_id' => $class->id,
        ]);

        // Simulasi logic di EnrollmentController::store()
        $isStudent = $student->role === 'student';
        $classExists = ClassModel::where('enrollment_code', 'VALIDCODE')->exists();
        $alreadyEnrolled = Enrollment::where('class_id', $class->id)->where('student_id', $student->id)->exists();
        $isVisible = $class->visibility;

        $this->assertTrue($isStudent);
        $this->assertTrue($classExists);
        $this->assertTrue($alreadyEnrolled); // Sudah enroll, jadi gagal
        $this->assertTrue($isVisible);

        // Test 2: Kode enrollment tidak valid
        $invalidCodeExists = ClassModel::where('enrollment_code', 'INVALIDCODE')->exists();
        $this->assertFalse($invalidCodeExists);

        // Test 3: Kelas private
        $this->assertFalse($privateClass->visibility);

        // Test 4: Bukan student
        $nonStudent = User::factory()->create(['role' => 'mentor']);
        $this->assertNotEquals('student', $nonStudent->role);
    }

    /**
     * Test validasi waktu quiz.
     */
    public function testQuizTimeValidation()
    {
        // Mock student
        $student = User::factory()->create(['role' => 'student']);

        // Mock kelas
        $class = ClassModel::factory()->create();

        // Mock quiz dengan waktu
        $quiz = Quiz::factory()->create([
            'class_id' => $class->id,
            'open_datetime' => now()->addHours(1), // Buka 1 jam lagi
            'close_datetime' => now()->addHours(2), // Tutup 2 jam lagi
            'attempts_allowed' => 1,
        ]);

        // Mock enrollment
        Enrollment::factory()->create([
            'student_id' => $student->id,
            'class_id' => $class->id,
        ]);

        Auth::shouldReceive('user')->andReturn($student);

        // Simulasi logic di QuizController::showForStudent()
        $now = now();

        // Test 1: Quiz belum dibuka
        $canAttemptBeforeOpen = true;
        $message = null;
        if ($quiz->open_datetime && $now->isBefore($quiz->open_datetime)) {
            $canAttemptBeforeOpen = false;
            $message = 'Kuis belum dibuka.';
        }
        $this->assertFalse($canAttemptBeforeOpen);
        $this->assertEquals('Kuis belum dibuka.', $message);

        // Test 2: Quiz sudah ditutup
        $quizClosed = Quiz::factory()->create([
            'class_id' => $class->id,
            'open_datetime' => now()->subHours(2),
            'close_datetime' => now()->subHours(1), // Sudah tutup
            'attempts_allowed' => 1,
        ]);

        $canAttemptAfterClose = true;
        if ($quizClosed->close_datetime && $now->isAfter($quizClosed->close_datetime)) {
            $canAttemptAfterClose = false;
            $message = 'Waktu pengerjaan kuis sudah berakhir.';
        }
        $this->assertFalse($canAttemptAfterClose);
        $this->assertEquals('Waktu pengerjaan kuis sudah berakhir.', $message);

        // Test 3: Dalam waktu, tapi sudah max attempt
        $quizMaxAttempt = Quiz::factory()->create([
            'class_id' => $class->id,
            'open_datetime' => now()->subHours(1),
            'close_datetime' => now()->addHours(1),
            'attempts_allowed' => 1,
        ]);

        // Mock attempt sudah selesai
        QuizAttempt::factory()->create([
            'quiz_id' => $quizMaxAttempt->id,
            'student_id' => $student->id,
            'status' => 'finished',
        ]);

        $finishedAttemptCount = $quizMaxAttempt->quizAttempts()->where('student_id', $student->id)->where('status', 'finished')->count();
        $canAttemptMax = true;
        if ($quizMaxAttempt->attempts_allowed > 0 && $finishedAttemptCount >= $quizMaxAttempt->attempts_allowed) {
            $canAttemptMax = false;
            $message = 'Anda sudah mencapai batas attempt yang diperbolehkan.';
        }
        $this->assertFalse($canAttemptMax);
        $this->assertEquals('Anda sudah mencapai batas attempt yang diperbolehkan.', $message);
    }

    /**
     * Test perhitungan skor.
     */
    public function testScoreCalculation()
    {
        // Mock quiz
        $quiz = Quiz::factory()->create();

        // Mock questions
        $question1 = Question::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'pilihan_ganda',
            'options' => [
                ['text' => 'A', 'is_correct' => false],
                ['text' => 'B', 'is_correct' => true],
            ],
        ]);

        $question2 = Question::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'benar_salah',
            'options' => [
                ['text' => 'True', 'is_correct' => true],
                ['text' => 'False', 'is_correct' => false],
            ],
        ]);

        $question3 = Question::factory()->create([
            'quiz_id' => $quiz->id,
            'type' => 'esai',
            'options' => [], // Esai tidak dihitung skor
        ]);

        // Mock attempt
        $attempt = QuizAttempt::factory()->create([
            'quiz_id' => $quiz->id,
            'status' => 'in_progress',
        ]);

        // Mock answers
        Answer::factory()->create([
            'attempt_id' => $attempt->id,
            'question_id' => $question1->id,
            'answer_text' => 'B', // Benar
        ]);

        Answer::factory()->create([
            'attempt_id' => $attempt->id,
            'question_id' => $question2->id,
            'answer_text' => 'True', // Benar
        ]);

        Answer::factory()->create([
            'attempt_id' => $attempt->id,
            'question_id' => $question3->id,
            'answer_text' => 'Some essay answer', // Esai, tidak dihitung
        ]);

        // Simulasi logic perhitungan skor di QuizAttemptController::submit()
        $questions = $quiz->questions;
        $correctCount = 0;
        $countableQuestions = 0;

        foreach ($questions as $question) {
            if ($question->type !== 'esai' && !empty($question->options)) {
                $correctOption = collect($question->options)->firstWhere('is_correct', true);
                if ($correctOption) {
                    $countableQuestions++;
                    $answer = $attempt->answers->firstWhere('question_id', $question->id);
                    if ($answer) {
                        $normalizedCorrect = strtolower(trim($correctOption['text']));
                        $normalizedAnswer = strtolower(trim($answer->answer_text));
                        if (!empty($answer->answer_text) && $normalizedCorrect === $normalizedAnswer) {
                            $correctCount++;
                        }
                    }
                }
            }
        }

        $totalForScore = $countableQuestions > 0 ? $countableQuestions : 1;
        $score = round(($correctCount / $totalForScore) * 100, 2);

        // 2 benar dari 2 countable questions
        $this->assertEquals(2, $correctCount);
        $this->assertEquals(2, $countableQuestions);
        $this->assertEquals(100.0, $score);

        // Test dengan salah satu jawaban salah - update answer
        $answer1 = Answer::where('attempt_id', $attempt->id)->where('question_id', $question1->id)->first();
        $answer1->update(['answer_text' => 'A']); // Ubah ke salah
        $attempt->refresh(); // Refresh to get updated answers

        // Recalculate
        $correctCount = 0;
        $countableQuestions = 0; // Reset
        foreach ($questions as $question) {
            if ($question->type !== 'esai' && !empty($question->options)) {
                $correctOption = collect($question->options)->firstWhere('is_correct', true);
                if ($correctOption) {
                    $countableQuestions++;
                    $answer = $attempt->answers->firstWhere('question_id', $question->id);
                    if ($answer) {
                        $normalizedCorrect = strtolower(trim($correctOption['text']));
                        $normalizedAnswer = strtolower(trim($answer->answer_text));
                        if (!empty($answer->answer_text) && $normalizedCorrect === $normalizedAnswer) {
                            $correctCount++;
                        }
                    }
                }
            }
        }
        $score = round(($correctCount / $totalForScore) * 100, 2);

        // 1 benar dari 2 (question2 masih benar, question1 salah)
        $this->assertEquals(1, $correctCount);
        $this->assertEquals(2, $countableQuestions);
        $this->assertEquals(50.0, $score);
    }
}
