import React from "react";
import { MdOutlineQuiz } from "react-icons/md";
import Button from "@/Components/ui/button/Button";
import { router } from "@inertiajs/react";

interface QuizSectionProps {
    classId: number | string;
    quizzes: any[];
    userRole: string;
}

const QuizSection = ({ classId, quizzes, userRole }: QuizSectionProps) => {
    return (
        <div className="mt-6 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-amber-500 rounded-lg">
                        <MdOutlineQuiz size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Kuis</h2>
                        <p className="text-sm text-gray-500 mt-1">Kumpulan kuis yang terkait dengan kelas ini</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                {quizzes && quizzes.length > 0 ? (
                    quizzes.map((quiz: any) => (
                        <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border gap-4">
                            <div className="flex-grow">
                                <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {quiz.description || "Tidak ada deskripsi."}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded-full font-medium ${quiz.status === 'Diterbitkan' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {quiz.status ?? "Draf"}
                                    </span>
                                    <span className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">{quiz.time_limit_minutes ?? 0} menit</span>
                                    <span className="px-2 py-1 rounded-full font-medium bg-indigo-100 text-indigo-800">{quiz.questions_count ?? 0} soal</span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center sm:justify-end gap-4">
                                {userRole === "student" && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => router.visit(route("classes.quizzes.show", { class: classId, quiz: quiz.id }))}
                                    >
                                        Lihat Detail
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-3 rounded border bg-gray-50 italic text-sm text-gray-500">
                        Belum ada kuis di kelas ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizSection;
