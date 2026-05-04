<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function show($classId, $assignmentId)
    {
        $assignment = Assignment::with(['meeting.class', 'submissions.student'])
            ->findOrFail($assignmentId);

        $user = auth()->user();

        if ($user->role === 'student') {
            $classId = $assignment->meeting->class->id;
            $isEnrolled = Enrollment::where('class_id', $classId)
                ->where('student_id', $user->id)
                ->exists();

            if (!$isEnrolled) {
                return redirect()->back()->withErrors(['error' => 'Anda tidak terdaftar di kelas ini.']);
            }
        }

        $classId = $assignment->meeting->class->id;
        $classStudents = Enrollment::where('class_id', $classId)
            ->with('student')
            ->get()
            ->pluck('student');

        $submissions = $assignment->submissions()->with('student')->get();

        $submissionData = $classStudents->map(function ($student) use ($assignment, $submissions) {
            $submission = $submissions->firstWhere('student_id', $student->id);

            return [
                'id' => $submission ? $submission->id : null,
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
                'student_name' => $student->name,
                'feedback' => $submission ? $submission->feedback : null,
                'grade' => $submission ? $submission->grade : null,
                'submitted_at' => $submission ? $submission->submitted_at : null,
                'submission_content' => $submission ? $submission->submission_content : null,
            ];
        });

        return Inertia::render('Assignment/AssignmentDetail', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                ],
            ],
            'assignment' => [
                'id'          => $assignment->id,
                'meeting_id'  => $assignment->meeting_id,
                'class_id'    => $assignment->meeting->class->id ?? null,
                'class_name'  => $assignment->meeting->class->name ?? null,
                'title'       => $assignment->title,
                'description' => $assignment->description,
                'date_open'   => $assignment->date_open,
                'time_open'   => $assignment->time_open,
                'date_close'  => $assignment->date_close,
                'time_close'  => $assignment->time_close,
                'file_link'   => $assignment->file_link,
                'created_at'  => $assignment->created_at,
            ],
            'submissions' => $submissionData,
        ]);
    }

    public function destroy($classId, $assignmentId)
    {
        $assignment = Assignment::findOrFail($assignmentId);

        // Optional: Ensure the assignment belongs to the class
        if ($assignment->meeting->class_id !== $classId) {
            abort(404);
        }

        $assignment->delete();

        return redirect()->back()->with('success', 'Tugas berhasil dihapus.');
    }
}
