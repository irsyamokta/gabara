// resources/js/Pages/Quizzes/QuizHistory.tsx
import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import EmptyState from "@/Components/empty/EmptyState";

export default function QuizHistory() {
  const { props }: any = usePage();
  const classData = props.classData ?? null;
  const quiz = props.quiz ?? null;
  const attemptsRaw = props.attempts ?? [];
  const attempts = Array.isArray(attemptsRaw) ? attemptsRaw : attemptsRaw?.data ?? [];

  // --- Helpers ---
  const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

  const formatDuration = (started?: string, finished?: string) => {
    if (!started || !finished) return "-";
    const s = new Date(started).getTime();
    const f = new Date(finished).getTime();
    if (isNaN(s) || isNaN(f) || f < s) return "-";
    const diff = Math.floor((f - s) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins} mins ${secs} secs`;
  };

  const getAnswerForQuestion = (attempt: any, questionId: string) => {
    if (!attempt || !attempt.answers) return "";
    const found = (attempt.answers || []).find(
      (a: any) => String(a.question_id) === String(questionId)
    );
    return found ? found.answer_text ?? "" : "";
  };

  const getCorrectText = (question: any) => {
    if (!question || !question.options) return "";
    const correct = (question.options || []).find((o: any) => !!o.is_correct);
    return correct ? correct.text ?? "" : "";
  };

  return (
    <div className="max-w-(--breakpoint-2xl) mx-auto space-y-6">
      <Head title="Riwayat Kuis" />

      {/* Breadcrumb */}
      <div className="flex flex-wrap gap-2 items-center justify-between text-sm text-gray-600 break-words">
        <PageBreadcrumb
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Kelasku", href: "/classes" },
            { label: classData?.name ?? "Class", href: classData ? `/classes/${classData.id}` : undefined },
            { label: quiz?.title ?? "Quiz", href: quiz?.id ? `/classes/${classData?.id}/quizzes/${quiz?.id}` : "#" },
            { label: "Riwayat Attempt" },
          ]}
        />
      </div>

      {/* Main Content */}
      
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Riwayat Attempt</h1>
        </div>

        {attempts.length === 0 ? (
          <EmptyState
            title="Belum ada attempt"
            description="Kamu belum pernah mengikuti quiz. Setelah mengikuti, hasil attempt akan muncul di sini."
          />
        ) : (
          <div className="space-y-6">
            {attempts.map((a: any, idx: number) => (
              <div
                key={a.id ?? `a-${idx}`}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
              >
                {/* Header Attempt Summary */}
                <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="text-sm text-gray-500 w-6 text-center">{idx + 1}</div>
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{a.quiz?.title ?? "-"}</div>
                      <div className="text-sm text-gray-500 mt-1">Mulai Mengerjakan: {fmt(a.started_at)}</div>
                      <div className="text-sm text-gray-500">Selesai Mengerjakan: {fmt(a.finished_at)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600 text-right">
                      <div className="text-xs uppercase tracking-wide">Score</div>
                      <div className="text-lg font-bold text-gray-800">{a.score ?? "-"}</div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${a.status === "finished"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {a.status ?? "-"}
                    </span>
                  </div>
                </div>

                {/* Attempt Detail */}
                <div className="px-6 py-6 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Meta */}
                    <div className="lg:col-span-3">
                      <div className="bg-gray-50 border rounded p-4 space-y-3">
                        <div>
                          <div className="text-xs text-gray-500">Mulai Mengerjakan</div>
                          <div className="font-medium text-sm">{fmt(a.started_at)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <div className="font-medium text-sm">{a.status ?? "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Selesai Mengerjakan</div>
                          <div className="font-medium text-sm">{fmt(a.finished_at)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Waktu Pengerjaan</div>
                          <div className="font-medium text-sm">{formatDuration(a.started_at, a.finished_at)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Questions */}
                    <div className="lg:col-span-9 space-y-4">
                      {(a.quiz?.questions ?? []).length === 0 ? (
                        <div className="text-sm text-gray-500">Tidak ada soal pada quiz ini.</div>
                      ) : (
                        (a.quiz.questions ?? []).map((q: any, qi: number) => {
                          const studentAns = getAnswerForQuestion(a, q.id);
                          const correctText = getCorrectText(q);
                          const isCorrect =
                            q.type === "esai"
                              ? null
                              : String(studentAns ?? "").trim() === String(correctText ?? "").trim();

                          const cardBg =
                            isCorrect === true
                              ? "bg-green-50 border-green-200"
                              : isCorrect === false
                                ? "bg-red-50 border-red-200"
                                : "bg-white border-gray-100";

                          return (
                            <div key={q.id ?? `q-${qi}`} className={`border rounded p-4 ${cardBg}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-medium">Soal {qi + 1}</div>
                                  <div className="text-base text-gray-800 mt-2">{q.question_text ?? "-"}</div>
                                </div>
                                <div className="text-sm text-gray-500">{q.type ?? "-"}</div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Jawaban</div>
                                  <div
                                    className={`mt-1 p-3 rounded ${isCorrect === true
                                        ? "bg-green-50 text-green-800"
                                        : isCorrect === false
                                          ? "bg-red-50 text-red-800"
                                          : "bg-gray-50 text-gray-700"
                                      }`}
                                  >
                                    {studentAns === "" ? <em className="text-gray-500">Belum dijawab</em> : studentAns}
                                  </div>
                                </div>

                                <div>
                                  {q.type !== "esai" ? (
                                    <>
                                      <div className="text-xs text-gray-500">Kunci Jawaban</div>
                                      <div className="mt-1 p-2 rounded bg-blue-50 text-blue-800">
                                        {correctText || <em>-</em>}
                                      </div>

                                      {q.type === "pilihan_ganda" && q.options && (
                                        <div className="mt-3">
                                          <div className="text-xs text-gray-500">Opsi</div>
                                          <div className="mt-2 space-y-2">
                                            {(q.options || []).map((opt: any, oi: number) => {
                                              const label = String.fromCharCode(65 + oi);
                                              const isChosen = String(opt.text ?? "") === String(studentAns ?? "");
                                              const isOptCorrect = !!opt.is_correct || false;
                                              return (
                                                <div
                                                  key={oi}
                                                  className={`flex items-center justify-between p-2 rounded ${isChosen ? "bg-gray-100" : ""}`}
                                                >
                                                  <div>
                                                    <div className="font-medium">{label}. {opt.text ?? "-"}</div>
                                                    {isOptCorrect && <div className="text-xs text-green-700">Benar</div>}
                                                  </div>
                                                  {isChosen && (
                                                    <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs">Dipilih</span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="mt-2 text-sm text-gray-500">
                                      <em>Esai — tidak dievaluasi otomatis.</em>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {props.attempts && props.attempts.links && (
              <div className="px-4 py-3 bg-white rounded-lg border flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Menampilkan {props.attempts.from} - {props.attempts.to} dari {props.attempts.total}
                </div>
                <div className="flex items-center space-x-2">
                  {props.attempts.prev_page_url && (
                    <Button size="sm" onClick={() => router.visit(props.attempts.prev_page_url)}>Prev</Button>
                  )}
                  {props.attempts.next_page_url && (
                    <Button size="sm" onClick={() => router.visit(props.attempts.next_page_url)}>Next</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
