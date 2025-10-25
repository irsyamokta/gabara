import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";
import TextArea from "@/Components/form/input/TextArea";
import SubmitConfirmModal from "@/Components/modal/SubmitConfirmModal";

export default function QuizAttemptCard() {
  const { props }: any = usePage();
  const quiz = props.quiz;
  const attempt = props.attempt;
  const classData = props.classData;

  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const autoSubmitCalled = useRef(false);
  const [isFinished, setIsFinished] = useState<boolean>(!!attempt?.finished_at);

  // === INIT ANSWERS ===
  useEffect(() => {
    if (!attempt?.answers) return;
    const initial: Record<string, string> = {};
    (attempt.answers || []).forEach((a: any) => {
      const qid = String(a.question_id ?? a.qid);
      initial[qid] = a.answer_text ?? "";
    });
    setAnswersMap(initial);
  }, [attempt]);

  const numQuestions = quiz?.questions?.length ?? 0;
  const currentQuestion = quiz?.questions?.[currentIndex];

  // === TIMER ===
  const dueTimestamp = useMemo(() => {
    if (!attempt?.started_at || !quiz?.time_limit_minutes) return null;
    return new Date(attempt.started_at).getTime() + quiz.time_limit_minutes * 60 * 1000;
  }, [attempt?.started_at, quiz?.time_limit_minutes]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => {
    if (!dueTimestamp) return null;
    return Math.max(0, Math.floor((dueTimestamp - Date.now()) / 1000));
  });

  const formatTime = (secs: number | null) => {
    if (secs === null) return "-";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const setAnswer = (qid: string | number, val: string) => {
    if (isFinished || isSubmittingRef.current) return;
    setAnswersMap((prev) => ({ ...prev, [String(qid)]: val }));
  };

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, numQuestions - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const jumpTo = (idx: number) => setCurrentIndex(idx);

  const buildAnswersPayload = () => {
    return (quiz?.questions ?? []).map((q: any) => ({
      question_id: String(q.id),
      answer_text: answersMap[String(q.id)] ?? "",
    }));
  };

  // === SUBMIT ===
  const handleSubmit = useCallback(() => {
    if (!attempt?.id) {
      return;
    }
    if (isSubmittingRef.current || isFinished) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const payloadAnswers = buildAnswersPayload();

    router.post(
      route("quiz.attempts.submit", { attempt: attempt.id }),
      { answers: payloadAnswers },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          setIsFinished(true);

          if (classData?.id && quiz?.id) {
            router.visit(
              route("quiz.attempts.history", { class: classData.id, quiz: quiz.id })
            );
          }
        },
        onError: (err) => {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
        },
      }
    );
  }, [attempt?.id, answersMap, classData?.id, quiz?.id, isFinished]);

  // === AutoSubmit ===
  const autoSubmit = useCallback(() => {
    if (autoSubmitCalled.current || isFinished) return;
    autoSubmitCalled.current = true;

    // Tunggu sebentar untuk pastikan state answers terakhir tersimpan
    setTimeout(() => {
      handleSubmit();
    }, 500);
  }, [handleSubmit, isFinished]);

  useEffect(() => {
    if (!dueTimestamp || isFinished) return;

    const tick = () => {
      const now = Date.now();
      const secs = Math.max(0, Math.floor((dueTimestamp - now) / 1000));
      setRemainingSeconds(secs);

      if (secs <= 0) {
        autoSubmit();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueTimestamp, isFinished, autoSubmit]);

  // === MODAL CONFIRM ===
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const handleOpenConfirmModal = () => setIsSubmitModalOpen(true);

  // === RENDER QUESTION ===
  const renderQuestion = (q: any) => {
    const qid = String(q.id);
    const val = answersMap[qid] ?? "";

    if (q.type === "esai")
      return (
        <>
          <div className="mb-2 text-gray-700">{q.question_text}</div>
          <TextArea
            value={val}
            onChange={(e: any) => setAnswer(qid, e.target.value)}
            rows={8}
            placeholder="Tulis jawabanmu di sini..."
            disabled={isSubmitting || isFinished}
          />
        </>
      );

    if (q.type === "benar_salah") {
      const [trueText, falseText] = q.options?.map((o: any) => o.text) ?? ["True", "False"];
      return (
        <>
          <div className="mb-2 text-gray-700">{q.question_text}</div>
          <div className="flex gap-6 flex-wrap">
            {[trueText, falseText].map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q_${qid}`}
                  value={opt}
                  checked={val === opt}
                  onChange={() => setAnswer(qid, opt)}
                  disabled={isSubmitting || isFinished}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </>
      );
    }

    // pilihan_ganda
    return (
      <>
        <div className="mb-2 text-gray-700">{q.question_text}</div>
        <div className="space-y-2">
          {(q.options ?? []).map((opt: any, i: number) => {
            const optText = opt.text ?? opt.label ?? String(opt);
            return (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`q_${qid}`}
                  value={optText}
                  checked={val === optText}
                  onChange={() => setAnswer(qid, optText)}
                  disabled={isSubmitting || isFinished}
                />
                <div>
                  {String.fromCharCode(65 + i)}. {optText}
                </div>
              </label>
            );
          })}
        </div>
      </>
    );
  };

  if (!quiz || !attempt)
    return <p>Quiz tidak ditemukan atau sudah timeout.</p>;

  const answeredCount = Object.values(answersMap).filter((v) => String(v).trim() !== "").length;

  return (
    <div className="w-full bg-white rounded-lg space-y-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">
          Mengerjakan: {quiz.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Sisa waktu:</span>
          <span className="font-mono text-lg text-gray-800">{formatTime(remainingSeconds)}</span>
        </div>
      </div>

      {/* Grid utama */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 border rounded-lg p-5 space-y-5 shadow-sm">
          <div className="text-sm text-gray-500">
            Soal {currentIndex + 1} dari {numQuestions}
          </div>
          {renderQuestion(currentQuestion)}
          <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
            <Button
              type="button"
              variant="default"
              onClick={goPrev}
              disabled={currentIndex === 0 || isSubmitting || isFinished}
            >
              Sebelumnya
            </Button>
            {currentIndex === numQuestions - 1 ? (
              <Button
                variant="primary"
                onClick={handleOpenConfirmModal}
                disabled={isSubmitting || isFinished}
              >
                {isSubmitting ? "Mengirim..." : "Selesai & Kirim"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                onClick={goNext}
                disabled={isSubmitting || isFinished}
              >
                Berikutnya
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="border rounded-lg p-5 shadow-sm">
          <div className="font-medium mb-2 text-gray-700">Daftar Soal</div>
          <div className="grid grid-cols-5 sm:grid-cols-4 gap-2">
            {(quiz.questions ?? []).map((q: any, i: number) => {
              const answered = answersMap[q.id] && answersMap[q.id].trim() !== "";
              const active = i === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => jumpTo(i)}
                  className={`px-2 py-2 rounded text-sm font-medium transition ${active ? "bg-blue-600 text-white" : answered ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                    }`}
                  disabled={isSubmitting || isFinished}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-600 space-y-1">
            <div>Attempt ID: {attempt.id}</div>
            <div>Started: {new Date(attempt.started_at).toLocaleString()}</div>
            {attempt.finished_at && <div>Finished: {new Date(attempt.finished_at).toLocaleString()}</div>}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
        totalQuestions={numQuestions}
        answeredCount={answeredCount}
      />
    </div>
  );
}
