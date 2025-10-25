// resources/js/Components/modal/QuizBuilderModal.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Button from "../ui/button/Button";
import InputField from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Radio from "../form/input/Radio";
import DatePicker from "../form/date-picker";
import { Modal } from "../ui/modal";
import Label from "../form/Label";

type QuestionType = "pilihan_ganda" | "benar_salah" | "esai";
type OptionLocal = { id?: string; text: string; is_correct?: boolean };
type QuestionLocal = { id: string; question_text: string; type: QuestionType; options?: OptionLocal[]; image?: File | null };
type PayloadOption = { text: string; is_correct: boolean };
type PayloadQuestion = { question_text: string; type: QuestionType; options: PayloadOption[] };

interface QuizFormData {
  title: string;
  description: string;
  open_datetime: string;
  close_datetime: string;
  time_limit_minutes: number;
  status: "Draf" | "Diterbitkan";
  attempts_allowed: number;
  class_id: string;
  questions: PayloadQuestion[];
}

interface Props {
  quiz?: any | null;
  onClose: () => void;
  classes?: { id: string; name: string }[];
  isOpen?: boolean;
}

function normalizeOptions(input: any): OptionLocal[] {
  if (!input) return [];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input || "[]");
      if (Array.isArray(parsed)) return parsed.map((o: any) => ({ text: o.text ?? "", is_correct: !!o.is_correct }));
      return [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(input)) return input.map((o: any) => ({ text: o.text ?? "", is_correct: !!o.is_correct }));
  return [];
}

export default function QuizBuilderModal({ quiz = null, onClose, classes = [], isOpen = true }: Props) {
  // prepare initial local questions array from quiz (if any)
  const initialLocalQuestions: QuestionLocal[] = (() => {
    const safeQuestions = Array.isArray(quiz?.questions)
      ? quiz.questions.map((q: any) => ({
        ...q,
        options: normalizeOptions(q.options),
      }))
      : [];

    if (safeQuestions.length === 0) {
      return [
        {
          id: crypto.randomUUID(),
          question_text: "",
          type: "pilihan_ganda",
          options: [
            { text: "", is_correct: true },
            { text: "", is_correct: false },
          ],
        },
      ];
    }

    return safeQuestions.map((q: any) => ({
      id: String(q.id ?? crypto.randomUUID()),
      question_text: q.question_text ?? "",
      type: (q.type ?? "pilihan_ganda") as QuestionType,
      options:
        Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o: any) => ({ text: o.text ?? "", is_correct: !!o.is_correct }))
          : [
            { text: "", is_correct: true },
            { text: "", is_correct: false },
          ],
    }));
  })();

  const [questions, setQuestions] = useState<QuestionLocal[]>(initialLocalQuestions);

  // build initial payload questions to seed form
  const buildPayloadQuestions = (qs: QuestionLocal[]): PayloadQuestion[] =>
    qs.map((q) => {
      let optionsPayload: PayloadOption[] = [];
      if (q.type === "pilihan_ganda") {
        optionsPayload = (q.options ?? []).map((o) => ({ text: o.text ?? "", is_correct: !!o.is_correct }));
      } else if (q.type === "benar_salah") {
        const trueIsCorrect =
          q.options?.find((o) => (o.text ?? "").toLowerCase() === "true")?.is_correct ?? q.options?.[0]?.is_correct ?? false;
        optionsPayload = [
          { text: "true", is_correct: !!trueIsCorrect },
          { text: "false", is_correct: !trueIsCorrect },
        ];
      } else {
        optionsPayload = [];
      }
      return { question_text: q.question_text ?? "", type: q.type, options: optionsPayload };
    });

  const initialQuestionsPayload = buildPayloadQuestions(initialLocalQuestions);

  const form = useForm<QuizFormData>({
    title: quiz?.title ?? "",
    description: quiz?.description ?? "",
    open_datetime: quiz?.open_datetime ?? "",
    close_datetime: quiz?.close_datetime ?? "",
    time_limit_minutes: quiz?.time_limit_minutes ?? 10,
    status: quiz?.status ?? "Draf",
    attempts_allowed: quiz?.attempts_allowed ?? 1,
    class_id: quiz?.class_id ?? (classes?.[0]?.id ?? ""),
    questions: initialQuestionsPayload,
  });

  // keep form.questions in sync whenever local questions change
  useEffect(() => {
    form.setData("questions", buildPayloadQuestions(questions));
    // ensure default class selected if none
    if (!form.data.class_id && classes.length > 0) form.setData("class_id", classes[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, classes]);

  const updateQuestion = (id: string, patchData: Partial<QuestionLocal>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patchData } : q)));

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), question_text: "", type: "pilihan_ganda", options: [{ text: "", is_correct: false }, { text: "", is_correct: false }] },
    ]);

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    if (confirm("Hapus pertanyaan ini?")) setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) =>
    updateQuestion(questionId, {
      options: [...(questions.find((q) => q.id === questionId)?.options ?? []), { text: "", is_correct: false }],
    });

  const updateOption = (questionId: string, idx: number, text: string) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: q.options?.map((o, i) => (i === idx ? { ...o, text } : o)) } : q))
    );

  const markOptionCorrect = (questionId: string, optIndex: number) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: q.options?.map((o, i) => ({ ...o, is_correct: i === optIndex })) } : q))
    );

  const setTrueFalseCorrect = (questionId: string, value: boolean) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [{ text: "true", is_correct: value }, { text: "false", is_correct: !value }] } : q))
    );

  const isValid = useMemo(() => {
    if (!form.data.title?.trim() || !form.data.class_id) return false;
    for (const q of questions) {
      if (!q.question_text?.trim()) return false;
      if (q.type === "pilihan_ganda") {
        if (!q.options || q.options.length < 2) return false;
        if (q.options.some((o) => !o.text.trim())) return false;
        if (!q.options.some((o) => !!o.is_correct)) return false;
      }
    }
    return true;
  }, [form.data, questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // ensure form has latest questions payload
    form.setData("questions", buildPayloadQuestions(questions));

    // Use patch for editing (no new resource), post for creating
    if (quiz?.id) {
      form.patch(route("quizzes.update", quiz.id), {
        onSuccess: () => onClose(),
      });
    } else {
      form.post(route("quizzes.store"), {
        onSuccess: () => onClose(),
      });
    }
  };

  const renderOptionsEditor = (q: QuestionLocal) => {
    if (q.type === "esai") return <div className="text-sm text-gray-500">Esai — tidak ada opsi.</div>;
    if (q.type === "benar_salah") {
      const trueIsCorrect = q.options?.find((opt) => (opt.text ?? "").toLowerCase() === "true")?.is_correct ?? (q.options?.[0]?.is_correct ?? false);
      const name = `tf_${q.id}`;
      return (
        <div className="flex items-center gap-4">
          <Radio id={`${name}_true`} name={name} value="true" label="Benar" checked={trueIsCorrect} onChange={() => setTrueFalseCorrect(q.id, true)} />
          <Radio id={`${name}_false`} name={name} value="false" label="Salah" checked={!trueIsCorrect} onChange={() => setTrueFalseCorrect(q.id, false)} />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {q.options?.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input type="radio" name={`mc_${q.id}`} checked={!!opt.is_correct} onChange={() => markOptionCorrect(q.id, idx)} />
            <InputField value={opt.text} onChange={(e) => updateOption(q.id, idx, e.target.value)} placeholder={`Opsi ${String.fromCharCode(65 + idx)}`} className="flex-1" />
          </div>
        ))}
        <button type="button" onClick={() => addOption(q.id)} className="text-sm text-blue-600">+ Tambah opsi</button>
      </div>
    );
  };

  // Helper: ubah UTC ke waktu lokal agar flatpickr tidak tampil mundur 1 hari
  function normalizeDateForPicker(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    // kompensasi perbedaan zona waktu (dalam ms)
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    // format sesuai kebutuhan date picker (Y-m-d)
    return localDate.toISOString().split("T")[0];
  }


  return (
    <Modal isOpen={!!isOpen} onClose={onClose} className="max-w-[330px] 2xsm:max-w-[350px] md:max-w-[1100px] m-4">
      <div className="no-scrollbar relative w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold mb-6">{quiz?.id ? "Edit Quiz" : "Buat Quiz Baru"}</h2>

          {/* Grid utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Judul Quiz</Label>
                <InputField id="title" value={form.data.title} onChange={(e) => form.setData("title", e.target.value)} placeholder="Masukkan judul quiz" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Deskripsi</Label>
                <TextArea value={form.data.description} onChange={(e) => form.setData("description", e.target.value)} placeholder="Deskripsi singkat" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Kelas</Label>
                <select value={form.data.class_id} onChange={(e) => form.setData("class_id", e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">Pilih Kelas</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <DatePicker
                id="open_datetime"
                label="Dibuka"
                value={normalizeDateForPicker(form.data.open_datetime)}
                onChange={(val) => form.setData("open_datetime", val)}
                placeholder="Pilih tanggal buka"
              />
              <DatePicker
                id="close_datetime"
                label="Ditutup"
                value={normalizeDateForPicker(form.data.close_datetime)}
                onChange={(val) => form.setData("close_datetime", val)}
                placeholder="Pilih tanggal tutup"
              />

              <div className="space-y-1.5">
                <Label htmlFor="time_limit_minutes">Durasi (menit)</Label>
                <InputField
                  type="number"
                  min={1} // batas bawah
                  value={String(form.data.time_limit_minutes)}
                  onChange={(e) =>
                    form.setData(
                      "time_limit_minutes",
                      Math.max(1, Number(e.target.value)) // pastikan tidak kurang dari 1
                    )
                  }
                />
              </div>

              <div>
                <Label>Status</Label>
                <select value={form.data.status} onChange={(e) => form.setData("status", e.target.value as "Draf" | "Diterbitkan")} className="w-full border rounded px-3 py-2">
                  <option value="Draf">Draf</option>
                  <option value="Diterbitkan">Diterbitkan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Kesempatan Mengerjakan</Label>
                <InputField
                  type="number"
                  min={1} // batas bawah
                  value={String(form.data.attempts_allowed ?? 1)}
                  onChange={(e) =>
                    form.setData(
                      "attempts_allowed",
                      Math.max(1, Number(e.target.value)) // pastikan tidak kurang dari 1
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Pertanyaan */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">Pertanyaan {idx + 1}</div>
                    <select value={q.type} onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })} className="border rounded px-2 py-1 text-sm">
                      <option value="pilihan_ganda">Pilihan Ganda</option>
                      <option value="benar_salah">Benar / Salah</option>
                      <option value="esai">Esai</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-500 px-3">Hapus</button>
                </div>

                <div className="p-4 space-y-3">
                  <label className="block text-sm font-medium mb-1">Pertanyaan</label>
                  <InputField value={q.question_text} onChange={(e) => updateQuestion(q.id, { question_text: e.target.value })} placeholder="Teks Pertanyaan" />

                  <div>
                    <label className="block text-sm font-medium mb-1">Opsi / Jawaban</label>
                    {renderOptionsEditor(q)}
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="text-sm text-blue-600">+ Tambah Pertanyaan</button>
          </div>

          {/* Button Submit */}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" onClick={onClose} variant="outline">Batal</Button>
            <Button type="submit" variant="default" disabled={!isValid || form.processing}>
              {form.processing ? "Menyimpan..." : quiz?.id ? "Simpan Perubahan" : "Buat Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
