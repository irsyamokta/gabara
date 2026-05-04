// resources/js/Components/card/QuizBuilderCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import Button from "@/Components/ui/button/Button";
import InputField from "@/Components/form/input/InputField";
import TextArea from "@/Components/form/input/TextArea";
import Radio from "@/Components/form/input/Radio";
import FileInput from "@/Components/form/input/FileInput";
import DatePicker from "@/Components/form/date-picker";
import TimeSelect from "@/Components/form/TimeSelect";
import Label from "@/Components/form/Label";

/* Inline small Select */
type SelectOption = { value: string; label: string };
function SelectInline({
  options,
  value,
  onChange,
  placeholder = "Pilih Opsi",
  className = "",
  hideChevron = false,
}: {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  hideChevron?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        {!hideChevron && <span className="text-gray-500">▾</span>}
      </button>

      {open && (
        <ul className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 ${opt.value === value ? "bg-gray-100 font-medium" : ""
                }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Types */
type QuestionType = "pilihan_ganda" | "benar_salah" | "esai";
type OptionLocal = { id?: number | string; text: string; is_correct?: boolean };
type QuestionLocal = {
  id: number;
  question_text: string;
  type: QuestionType;
  options?: OptionLocal[];
  image?: any;
};

type QuestionPayload = {
  question_text: string;
  type: QuestionType;
  options: { text: string; is_correct: boolean }[];
};

type QuizFormData = {
  title: string;
  description: string;
  date_open: string;
  time_open: string;
  date_close: string;
  time_close: string;
  time_limit_minutes: number;
  status: string;
  attempts_allowed: number;
  class_id: number | string;
  questions: QuestionPayload[];
};

interface ClassItem {
  id: number | string;
  name: string;
}
interface Props {
  classes?: ClassItem[];
  quiz?: any;
  mode?: "create" | "edit";
}

let tempQuestionId = 1;

export default function QuizBuilderCard({ classes = [], quiz, mode }: Props) {
  const form = useForm<QuizFormData>({
    title: quiz?.title ?? "",
    description: quiz?.description ?? "",
    date_open: quiz?.date_open ?? "",
    time_open: quiz?.time_open ?? "00:00",
    date_close: quiz?.date_close ?? "",
    time_close: quiz?.time_close ?? "00:00",
    time_limit_minutes: quiz?.time_limit_minutes ?? 10,
    status: quiz?.status ?? "Draf",
    attempts_allowed: quiz?.attempts_allowed ?? 1,
    class_id: quiz?.class_id ?? classes[0]?.id ?? "",
    questions: quiz?.questions ?? [],
  });

  const [questions, setQuestions] = useState<QuestionLocal[]>(() => {
    const safeQuestions = Array.isArray(quiz?.questions) ? quiz.questions : [];
    if (safeQuestions.length === 0) {
      return [
        {
          id: tempQuestionId++,
          question_text: "",
          type: "pilihan_ganda",
          options: [
            { text: "", is_correct: false },
            { text: "", is_correct: false },
          ],
        },
      ];
    }

    return safeQuestions.map((q: any) => ({
      id: q.id ?? tempQuestionId++,
      question_text: q.question_text ?? "",
      type: (q.type ?? "pilihan_ganda") as QuestionType,
      options: Array.isArray(q.options)
        ? q.options.map((o: any) => ({
          text: o.text ?? "",
          is_correct: !!o.is_correct,
        }))
        : [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
    }));
  });

  const [submitFlag, setSubmitFlag] = useState(false);

  useEffect(() => {
    if (submitFlag) {
      if (quiz?.id) {
        form.patch(route("quizzes.update", { quiz: quiz.id }));
      } else {
        form.post(route("quizzes.store"));
      }
      setSubmitFlag(false);
    }
  }, [submitFlag]);

  /* --- Sync edit mode --- */
  useEffect(() => {
    if (mode === "edit" && quiz) {
      form.setData({
        title: quiz.title ?? "",
        description: quiz.description ?? "",
        date_open: quiz.date_open ?? "",
        time_open: quiz.time_open ?? "00:00",
        date_close: quiz.date_close ?? "",
        time_close: quiz.time_close ?? "00:00",
        time_limit_minutes: quiz.time_limit_minutes ?? 10,
        status: quiz.status ?? "Draf",
        attempts_allowed: quiz.attempts_allowed ?? 1,
        class_id: quiz.class_id ?? classes[0]?.id ?? "",
        questions: quiz.questions ?? [],
      });

      const safeQuestions = Array.isArray(quiz.questions) ? quiz.questions : [];
      setQuestions(
        safeQuestions.map((q: any) => ({
          id: q.id ?? tempQuestionId++,
          question_text: q.question_text ?? "",
          type: (q.type ?? "pilihan_ganda") as QuestionType,
          options: Array.isArray(q.options)
            ? q.options.map((o: any) => ({
              text: o.text ?? "",
              is_correct: !!o.is_correct,
            }))
            : [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ],
        }))
      );
    }
  }, [mode, quiz]);

  /* helpers */
  const updateQuestion = (id: number, patch: Partial<QuestionLocal>) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        id: tempQuestionId++,
        question_text: "",
        type: "pilihan_ganda",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);

  const removeQuestion = (id: number) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addOption = (questionId: number) =>
    updateQuestion(questionId, {
      options: [
        ...(questions.find((qq) => qq.id === questionId)?.options ?? []),
        { text: "" },
      ],
    });

  const updateOption = (questionId: number, idx: number, text: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options?.map((o, i) =>
              i === idx ? { ...o, text } : o
            ),
          }
          : q
      )
    );

  const removeOption = (questionId: number, idx: number) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options?.filter((_, i) => i !== idx),
          }
          : q
      )
    );

  const markOptionCorrect = (questionId: number, optIndex: number) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options?.map((o, i) => ({
              ...o,
              is_correct: i === optIndex,
            })),
          }
          : q
      )
    );

  const setTrueFalseCorrect = (questionId: number, value: boolean) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: [
              { text: "true", is_correct: value },
              { text: "false", is_correct: !value },
            ],
          }
          : q
      )
    );

  const buildPayloadQuestions = (): any[] =>
    questions.map((q) => {
      const payload: any = { question_text: q.question_text, type: q.type };
      if (q.type === "pilihan_ganda")
        payload.options = (q.options ?? []).map((o) => ({
          text: o.text ?? "",
          is_correct: !!o.is_correct,
        }));
      else if (q.type === "benar_salah") {
        const opts = q.options ?? [];
        payload.options =
          opts.length >= 2
            ? [
              { text: "benar", is_correct: !!opts[0].is_correct },
              { text: "salah", is_correct: !!opts[1].is_correct },
            ]
            : [
              { text: "benar", is_correct: false },
              { text: "salah", is_correct: true },
            ];
      } else {
        payload.options = [];
      }
      return payload;
    });

  const isValid = useMemo(() => {
    if (!form.data.title?.trim()) return false;
    for (const q of questions) {
      if (!q.question_text?.trim()) return false;
      if (["pilihan_ganda", "benar_salah"].includes(q.type)) {
        if (!q.options || q.options.length < 2) return false;
        if (!q.options.some((o) => !!o.is_correct)) return false;
      }
    }
    return true;
  }, [form.data.title, questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.setData((prev) => ({
      ...prev,
      questions: buildPayloadQuestions(),
    }));
    setSubmitFlag(true);
  };

  /* render options */
  const renderOptionsEditor = (q: QuestionLocal) => {
    if (q.type === "esai")
      return (
        <div className="text-sm text-gray-500">Esai — tidak ada opsi.</div>
      );

    if (q.type === "benar_salah") {
      const currentTrue =
        (q.options && q.options[0] && !!q.options[0].is_correct) ?? false;
      const name = `tf_${q.id}`;
      return (
        <div className="flex items-center gap-4">
          <Radio
            id={`${name}_true`}
            name={name}
            value={"true"}
            label="Benar"
            checked={currentTrue === true}
            onChange={() => setTrueFalseCorrect(q.id, true)}
          />
          <Radio
            id={`${name}_false`}
            name={name}
            value={"false"}
            label="Salah"
            checked={currentTrue === false}
            onChange={() => setTrueFalseCorrect(q.id, false)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {(q.options ?? []).map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name={`mc_${q.id}`}
              checked={!!opt.is_correct}
              onChange={() => markOptionCorrect(q.id, idx)}
            />
            <InputField
              value={opt.text}
              onChange={(e: any) =>
                updateOption(q.id, idx, e.target.value)
              }
              placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeOption(q.id, idx)}
              className="text-red-500 px-2"
            >
              ×
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            onClick={() => addOption(q.id)}
            className="text-sm text-blue-600"
          >
            + Tambah opsi
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <PageBreadcrumb
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Kuis", href: "/quizzes" },
            { label: quiz?.title ?? "Buat Quiz" },
          ]}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-lg p-6 space-y-6"
      >
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Judul Quiz
              </label>
              <InputField
                value={form.data.title}
                onChange={(e: any) =>
                  form.setData("title", e.target.value)
                }
                placeholder="Masukkan judul quiz"
              />
              {form.errors.title && (
                <div className="text-red-500 text-sm">
                  {form.errors.title}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi
              </label>
              <TextArea
                value={form.data.description}
                disabled={false}
                onChange={(e: any) =>
                  form.setData("description", e.target.value)
                }
                placeholder="Deskripsi"
              />
              {form.errors.description && (
                <div className="text-red-500 text-sm">
                  {form.errors.description}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Kelas</label>
              <SelectInline
                value={String(form.data.class_id ?? "")}
                onChange={(val) => form.setData("class_id", val)}
                options={[
                  { value: "", label: "Pilih kelas" },
                  ...classes.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  })),
                ]}
              />
              {form.errors.class_id && (
                <div className="text-red-500 text-sm">
                  {form.errors.class_id}
                </div>
              )}
            </div>

            <div>
              <DatePicker
                id="date_open"
                label="Tanggal Dibuka"
                mode="single"
                value={form.data.date_open}
                onChange={(dateStr) =>
                  form.setData("date_open", dateStr)
                }
                placeholder="Pilih tanggal mulai"
              />
              {form.errors.date_open && (
                <div className="text-red-500 text-sm">
                  {form.errors.date_open}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time_open">Waktu Dibuka</Label>
              <TimeSelect
                value={form.data.time_open}
                onChange={(val) => form.setData("time_open", val)}
              />
              {form.errors.time_open && (
                <div className="text-red-500 text-sm">
                  {form.errors.time_open}
                </div>
              )}
            </div>

            <div>
              <DatePicker
                id="date_close"
                label="Tanggal Ditutup"
                mode="single"
                value={form.data.date_close}
                onChange={(dateStr) =>
                  form.setData("date_close", dateStr)
                }
                placeholder="Pilih tanggal tutup"
              />
              {form.errors.date_close && (
                <div className="text-red-500 text-sm">
                  {form.errors.date_close}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time_close">Waktu Ditutup</Label>
              <TimeSelect
                value={form.data.time_close}
                onChange={(val) => form.setData("time_close", val)}
              />
              {form.errors.time_close && (
                <div className="text-red-500 text-sm">
                  {form.errors.time_close}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Durasi (menit)
              </label>
              <InputField
                type="number"
                min={1} // batas bawah
                value={String(form.data.time_limit_minutes ?? 1)}
                onChange={(e: any) =>
                  form.setData(
                    "time_limit_minutes",
                    Math.max(1, Number(e.target.value)) // pastikan minimal 1
                  )
                }
              />
              {form.errors.time_limit_minutes && (
                <div className="text-red-500 text-sm">
                  {form.errors.time_limit_minutes}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <SelectInline
                value={form.data.status ?? "Draf"}
                onChange={(v) => form.setData("status", v)}
                options={[
                  { value: "Draf", label: "Draf" },
                  { value: "Diterbitkan", label: "Diterbitkan" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Kesempatan Mengerjakan
              </label>
              <InputField
                type="number"
                min={1} // batas bawah
                value={String(form.data.attempts_allowed ?? 1)}
                onChange={(e: any) =>
                  form.setData(
                    "attempts_allowed",
                    Math.max(1, Number(e.target.value)) // pastikan minimal 1
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 bg-gray-50 border-b">
                {/* Bagian kiri */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                  <div className="text-lg font-semibold text-gray-800">
                    Pertanyaan {idx + 1}
                  </div>

                  <SelectInline
                    value={q.type}
                    onChange={(val) =>
                      updateQuestion(q.id, {
                        type: val as QuestionType,
                        options:
                          val === "pilihan_ganda"
                            ? q.options && q.options.length
                              ? q.options
                              : [
                                { text: "" },
                                { text: "" },
                              ]
                            : val === "benar_salah"
                              ? [
                                { text: "benar", is_correct: false },
                                { text: "salah", is_correct: true },
                              ]
                              : [],
                      })
                    }
                    options={[
                      { value: "pilihan_ganda", label: "Pilihan Ganda" },
                      { value: "benar_salah", label: "Benar/Salah" },
                      { value: "esai", label: "Esai" },
                    ]}
                    className="sm:w-48 w-full"
                  />
                </div>

                {/* Tombol hapus di bawah di mobile, kanan di desktop */}
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-sm text-red-600 hover:text-red-700 sm:self-auto self-end"
                >
                  Hapus
                </button>
              </div>


              <div className="p-4 space-y-3">
                <label className="block text-sm font-medium mb-1">
                  Pertanyaan
                </label>
                <InputField
                  value={q.question_text}
                  onChange={(e: any) =>
                    updateQuestion(q.id, { question_text: e.target.value })
                  }
                />

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Opsi / Jawaban
                  </label>
                  {renderOptionsEditor(q)}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addQuestion()}
            className="text-sm text-blue-600"
          >
            + Tambah Pertanyaan
          </button>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={() => (window.location.href = route("quizzes.index"))}
            variant="default"
          >
            Batal
          </Button>
          <Button type="submit" disabled={form.processing || !isValid}>
            {form.processing
              ? "Menyimpan..."
              : quiz
                ? "Simpan Perubahan"
                : "Simpan Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}
