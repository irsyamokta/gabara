import { PageProps as InertiaPageProps } from "@inertiajs/core";

export interface User {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    email?: string;
    phone?: string;
    gender?: string;
    birthdate?: string;
}

export interface Student {
    id: string;
    name: string;
    avatar?: string;
}

export interface Enrollment {
    id?: string;
    student: Student;
}

export interface Meeting {
    id: string;
    class_id: string;
    title: string;
    description: string;
    created_at: string;
    materials: Material[];
    assignments: Assignment[];
}

export interface Material {
    id: string;
    meeting_id: string;
    link: string;
    created_at: string;
}

export interface Assignment {
    id: string;
    meeting_id: string;
    title: string;
    description: string;
    date_open: string;
    time_open: string;
    date_close: string;
    time_close: string;
    file_link?: string;
    created_at: string;
    class_id?: string;
    class_name?: string;
    submissions: Submission[];
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    student_name: string;
    submitted_at?: string;
    submission_content?: string;
    grade?: number;
    feedback?: string;
    created_at: string;
}

export interface Discussion {
    id: string;
    class_id: string;
    title: string;
    content: string;
    created_at: string;
    user_id: string;
    status: "open" | "closed";
}

export interface Class {
    quizzes: any;
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    visibility: boolean;
    academic_year_tag: string;
    mentor_id: string;
    public_id?: string;
    created_at: string;
    updated_at: string;
    mentor: User;
    meetings: Meeting[];
    materials: Material[];
    discussions: Discussion[];
    enrollments: Enrollment[];
}

export interface Grade {
    item: string;
    student_name?: string;
    score?: number;
    feedback?: string;
    status: string;
}

export interface ChartData {
    series: { name: string; data: number[] }[];
    categories: string[];
}

export interface MeetingForm {
    title: string;
    description: string;
    materials: MaterialForm[];
    assignments: AssignmentForm[];
}

export interface MaterialForm {
    link: string;
    id?: string;
}

export interface AssignmentForm {
    title: string;
    description: string;
    date_open: string;
    time_open: string;
    date_close: string;
    time_close: string;
    file_link?: string;
    id?: string;
}

export interface PageProps extends InertiaPageProps {
    class?: Class;
    auth: {
        user: User;
    };
    userRole?: string;
    errors?: Record<string, string>;
    announcements?: Announcement[];
    calendarEvents?: { id: string; title: string; start: string; end: string; type: "assignment" | "announcement" }[];
    numClasses?: number;
    deadlines?: Deadline[];
    progress?: number;
    ongoingTasks?: number;
    numStudents?: number;
    reminders?: Deadline[];
    numMentors?: number;
}

export interface AnnouncementPageProps extends InertiaPageProps {
    auth: {
        user: User;
    };
    announcement: Announcement;
    userRole: string;
}

export interface ClassDetailPageProps extends InertiaPageProps {
    auth: {
        user: User;
    };
    class: Class;
    userRole: string;
}

export interface QuizInfoPageProps extends InertiaPageProps {
  auth: {
    user: User;
  };

  classData?: {
    id: string;
    name: string;
  };


  quiz?: {
    id: string;
    title: string;
    description?: string;       
    status: string;             
    open_datetime?: string;     
    close_datetime?: string;
    time_limit_minutes?: number;
    attempts_allowed?: number;
    questions_count?: number;
    questions?: {
      id: string;
      question_text: string;
      type?: "pilihan_ganda" | "benar_salah" | "esai";
      options?: {
        text: string;
        is_correct: boolean;
      }[];
    }[];
    created_at?: string;
    updated_at?: string;
  };

  attempt?: {
    id: string;
    quiz_id: string;
    user_id: string;
    started_at: string;
    completed_at?: string;
    score?: number;
    total_questions?: number;
    correct_answers?: number;
    incorrect_answers?: number;
    questions_attempted?: number;
    finished_at?: string;
    status: "in_progress" | "finished" | "not_started";
  };

    attempts?: QuizAttemptType[];
    

  can_attempt: boolean;
  message?: string;
}

export interface QuizAttemptType {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  finished_at?: string;
  score?: number;
  status: "in_progress" | "finished" | "not_started";
  answers?: any[];
}

export interface AssignmentPageProps extends InertiaPageProps {
    auth: {
        user: {
            id: string;
            name: string;
            role?: string;
        };
    };
    assignment: Assignment;
    submissions?: Submission[];
}

export interface CourseTabProps {
    classData: Class;
}

export interface DiscussionTabProps {
    classData: Class;
}

export interface ParticipantsTabProps {
    classData: Class;
}

export interface ClassDetailCardProps {
    classData: Class;
    userRole: string;
}

export interface Deadline {
    id: string;
    title: string;
    deadline: string;
}

export interface Announcement {
    id: string;
    title: string;
    thumbnail: string | null;
    public_id: string | null;
    content: string;
    admin: {
        id: string;
        name: string;
        avatar: string | null;
    };
    posted_at: string;
}
