<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    /** -----------------------------
     *  SHOW - Ambil detail 1 pertanyaan
     *  -----------------------------*/
    public function show(Question $question)
    {
        return response()->json($question);
    }

    /** -----------------------------
     *  STORE - Tambahkan pertanyaan ke quiz
     *  -----------------------------*/
    public function store(Request $request, Quiz $quiz)
    {
        if (!Auth::check()) {
            abort(401, 'Unauthenticated');
        }

        $data = $request->validate([
            'question_text' => 'required|string',
            'type'          => 'required|in:pilihan_ganda,benar_salah,esai',
            'options'       => 'nullable|array',
            'options.*.text'       => 'nullable|string',
            'options.*.is_correct' => 'nullable|boolean',
        ]);

        $question = $quiz->questions()->create([
            'question_text' => $data['question_text'],
            'type'          => $data['type'],
            'options'       => $data['options'] ?? [],
        ]);

        return response()->json(['question' => $question], 201);
    }

    /** -----------------------------
     *  UPDATE - Perbarui pertanyaan
     *  -----------------------------*/
    public function update(Request $request, Question $question)
    {
        if (!Auth::check()) {
            abort(401, 'Unauthenticated');
        }

        // validasi input
        $data = $request->validate([
            'question_text' => 'required|string',
            'type'          => 'required|in:pilihan_ganda,benar_salah,esai',
            'options'       => 'nullable|array',
            'options.*.text'       => 'nullable|string',
            'options.*.is_correct' => 'nullable|boolean',
        ]);

        $question->update([
            'question_text' => $data['question_text'],
            'type'          => $data['type'],
            'options'       => $data['options'] ?? [],
        ]);

        return response()->json(['question' => $question]);
    }

    /** -----------------------------
     *  DESTROY - Hapus pertanyaan
     *  -----------------------------*/
    public function destroy(Question $question)
    {
        if (!Auth::check()) {
            abort(401, 'Unauthenticated');
        }

        $question->delete();

        return response()->json(['deleted' => true]);
    }
}
