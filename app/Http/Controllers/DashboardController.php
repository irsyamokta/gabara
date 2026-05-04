<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\ClassModel;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\Quiz;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->role;
        $data = [
            'auth' => ['user' => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role]],
            'announcements' => $this->getAnnouncements($role),
            'calendarEvents' => $this->getCalendarEvents($user, $role),
        ];

        if ($role === 'student') {
            $data['numClasses'] = Enrollment::where('student_id', $user->id)->count();
            $data['deadlines'] = $this->getStudentDeadlines($user->id);
            $data['progress'] = $this->calculateStudentProgress($user->id);
            $data['ongoingTasks'] = $this->getStudentOngoingTasks($user->id);
            return Inertia::render('Student/Dashboard', $data);
        } elseif ($role === 'mentor') {
            $data['numClasses'] = ClassModel::where('mentor_id', $user->id)->count();
            $data['numStudents'] = Enrollment::whereHas('class', function ($query) use ($user) {
                $query->where('mentor_id', $user->id);
            })->distinct('student_id')->count();
            $data['reminders'] = $this->getMentorReminders($user->id);
            return Inertia::render('Mentor/Dashboard', $data);
        } elseif ($role === 'admin') {
            $data['numStudents'] = User::where('role', 'student')->count();
            $data['numMentors'] = User::where('role', 'mentor')->count();
            $data['numClasses'] = ClassModel::count();
            return Inertia::render('Admin/Dashboard', $data);
        } else {
            abort(403, 'Akses tidak diizinkan');
        }
    }

    private function getAnnouncements($role)
    {
        $query = Announcement::select([
            'id',
            'title',
            'thumbnail',
            'public_id',
            'content',
            'admin_id',
            'posted_at',
        ])
            ->with(['admin' => function ($query) {
                $query->select('id', 'name', 'avatar');
            }])
            ->orderBy('posted_at', 'desc')
            ->limit(5);

        if ($role !== 'admin') {
            $query->where('posted_at', '<=', now());
        }

        return $query->get()->map(function ($announcement) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'thumbnail' => $announcement->thumbnail,
                'public_id' => $announcement->public_id,
                'content' => $announcement->content,
                'admin' => [
                    'id' => $announcement->admin->id,
                    'name' => $announcement->admin->name,
                    'avatar' => $announcement->admin->avatar,
                ],
                'posted_at' => $announcement->posted_at->toDateTimeString(),
            ];
        })->toArray();
    }

    private function getCalendarEvents($user, $role)
    {
        $events = [];

        $assignmentsQuery = Assignment::select([
            'id',
            'title',
            'date_close',
            'time_close',
            'meeting_id',
        ])
            ->with(['meeting' => function ($query) {
                $query->select('id', 'class_id')->with(['class' => function ($q) {
                    $q->select('id', 'mentor_id');
                }]);
            }]);

        if ($role === 'student') {
            $assignmentsQuery->whereHas('meeting.class.enrollments', function ($q) use ($user) {
                $q->where('student_id', $user->id);
            });
        } elseif ($role === 'mentor') {
            $assignmentsQuery->whereHas('meeting.class', function ($q) use ($user) {
                $q->where('mentor_id', $user->id);
            });
        } elseif ($role === 'admin') {
            // All assignments for admin
        }

        $assignments = $assignmentsQuery->get();

        foreach ($assignments as $assignment) {
            try {
                $datetime = Carbon::parse($assignment->date_close)
                    ->setTimeFromTimeString($assignment->time_close);

                $events[] = [
                    'id' => $assignment->id,
                    'title' => $assignment->title . ' Deadline',
                    'start' => $datetime->toDateTimeString(),
                    'end' => $datetime->toDateTimeString(),
                    'type' => 'assignment',
                ];
            } catch (\Exception $e) {
                $events[] = [
                    'id' => $assignment->id,
                    'title' => $assignment->title . ' Deadline (Invalid Date)',
                    'start' => Carbon::now()->toDateTimeString(),
                    'end' => Carbon::now()->toDateTimeString(),
                    'type' => 'assignment',
                ];
            }
        }

        $announcements = $this->getAnnouncements($role);
        foreach ($announcements as $announcement) {
            $datetime = Carbon::parse($announcement['posted_at']);
            $events[] = [
                'id' => $announcement['id'],
                'title' => $announcement['title'] . ' Announcement',
                'start' => $datetime->toDateTimeString(),
                'end' => $datetime->toDateTimeString(),
                'type' => 'announcement',
            ];
        }

        return $events;
    }

    private function getStudentDeadlines($studentId)
    {
        $assignments = Assignment::select([
            'id',
            'title',
            'date_close',
            'time_close',
            'meeting_id',
        ])
            ->whereHas('meeting.class.enrollments', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->whereRaw("CONCAT(date_close, ' ', time_close) > NOW()")
            ->whereDoesntHave('submissions', function ($q) use ($studentId) {
                $q->where('student_id', $studentId)->whereNotNull('submitted_at');
            })
            ->orderBy('date_close')
            ->orderBy('time_close')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => Carbon::parse($assignment->date_close)
                        ->setTimeFromTimeString($assignment->time_close),
                    'type' => 'assignment',
                ];
            });

        $quizzes = Quiz::select([
            'id',
            'title',
            'close_datetime',
            'class_id',
        ])
            ->whereHas('class.enrollments', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->where('close_datetime', '>', now())
            ->whereDoesntHave('quizAttempts', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->orderBy('close_datetime')
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'deadline' => $quiz->close_datetime,
                    'type' => 'quiz',
                ];
            });

        $deadlines = $assignments->concat($quizzes)->sortBy('deadline')->values();

        return $deadlines->toArray();
    }

    private function calculateStudentProgress($studentId)
    {
        $totalAssignments = Assignment::whereHas('meeting.class.enrollments', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->count();

        $completedAssignments = Assignment::whereHas('meeting.class.enrollments', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->whereHas('submissions', function ($q) use ($studentId) {
            $q->where('student_id', $studentId)->whereNotNull('submitted_at');
        })->count();

        return $totalAssignments > 0 ? round(($completedAssignments / $totalAssignments) * 100, 2) : 0;
    }

    private function getStudentOngoingTasks($studentId)
    {
        return Assignment::whereHas('meeting.class.enrollments', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->whereDoesntHave('submissions', function ($q) use ($studentId) {
            $q->where('student_id', $studentId)->whereNotNull('submitted_at');
        })->count();
    }

    private function getMentorReminders($mentorId)
    {
        return Assignment::select([
            'id',
            'title',
            'date_close',
            'time_close',
            'meeting_id',
        ])
            ->whereHas('meeting.class', function ($q) use ($mentorId) {
                $q->where('mentor_id', $mentorId);
            })
            ->whereRaw("CONCAT(date_close, ' ', time_close) > NOW()")
            ->orderBy('date_close')
            ->orderBy('time_close')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'deadline' => Carbon::parse($assignment->date_close)
                        ->setTimeFromTimeString($assignment->time_close)
                        ->format('Y-m-d H:i'),
                ];
            })->toArray();
    }
}
