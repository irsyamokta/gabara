import { useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Button from "@/Components/ui/button/Button";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import EmptyState from "@/Components/empty/EmptyState";
import Badge from "@/Components/ui/badge/Badge";
import { confirmDialog } from "@/utils/confirmationDialog";
import { createMarkup } from "@/utils/htmlMarkup";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import QuizBuilderModal from "@/Components/modal/QuizBuilderModal";
import axios from "axios";

export default function QuizCard() {
  const { props }: any = usePage();
  const quizzes = props.quizzes?.data ?? props.quizzes ?? [];
  const role = props.auth?.user?.role;

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);

  /** ✅ Buat kuis baru */
  const handleCreate = useCallback(() => {
    router.visit(route("quizzes.create"));
  }, []);

  /** ✅ Edit kuis yang ada */
  const handleEdit = async (quiz: any) => {
    try {
      const res = await axios.get(route("quizzes.data", quiz.id));
      setSelectedQuiz(res.data);
      setIsModalOpen(true);
    } catch {
    }
  };

  /** ✅ Hapus kuis */
  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirmDialog({
      title: "Hapus Quiz?",
      text: "Quiz yang dihapus tidak dapat dikembalikan!",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirmed) return;

    setDeletingId(id);
    router.delete(route("quizzes.destroy", id), {
      preserveScroll: true,
      onSuccess: () => {
        setDeletingId(null);
        router.reload({ only: ["quizzes"] });
      },
      onError: () => {
        setDeletingId(null);
      },
    });
  }, []);

  /** 🕓 Helper: format tanggal agar human-readable */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
        locale: idLocale,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative grid grid-cols-1 gap-4 md:gap-6">
      <HeaderSection
        title="Kuis"
        buttonLabel={role === "mentor" || role === "admin" ? "Buat" : undefined}
        onButtonClick={role === "mentor" || role === "admin" ? handleCreate : undefined}
      />


      {quizzes.length === 0 && (
        <EmptyState
          title="Ooopp!! Belum ada kuis"
          description="Kamu harus membuat kuis terlebih dahulu"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz: any) => (
          <div
            key={quiz.id}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={() => router.visit(route("quizzes.show", quiz.id))}
          >
            <div className="p-4 pt-3 flex-1">
              <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
                {quiz.title}
              </h1>

              <p
                className="text-sm text-gray-500 mt-2 line-clamp-3"
                dangerouslySetInnerHTML={createMarkup(quiz.description || "")}
              />

              <div className="mt-3 flex items-center gap-2">
                <Badge color={quiz.status === "Diterbitkan" ? "success" : "warning"}>
                  {quiz.status ?? "Draf"}
                </Badge>
                <Badge color="info">{quiz.time_limit_minutes ?? 0} menit</Badge>
                <Badge color="primary">
                  {(quiz.questions_count ?? quiz.questions?.length) ?? 0} soal
                </Badge>
              </div>

              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Dibuka: <span className="font-medium">{formatDate(quiz.open_datetime)}</span>
                <br />
                Ditutup: <span className="font-medium">{formatDate(quiz.close_datetime)}</span>
              </p>
            </div>

            {(role === "mentor" || role === "admin") && (
              <div
                className="p-4 flex gap-2 mt-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="button"
                  size="md"
                  variant="default"
                  onClick={() => handleEdit(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  <LuPencil />
                </Button>
                <Button
                  type="button"
                  size="md"
                  variant="danger"
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deletingId === quiz.id}
                >
                  {deletingId === quiz.id ? (
                    <LuTrash2 className="animate-spin" />
                  ) : (
                    <LuTrash2 />
                  )}
                </Button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* === ✅ Modal Quiz Builder === */}
      {isModalOpen && (
        <QuizBuilderModal
          quiz={selectedQuiz}
          onClose={() => setIsModalOpen(false)}
          classes={props.classes ?? []}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
}
