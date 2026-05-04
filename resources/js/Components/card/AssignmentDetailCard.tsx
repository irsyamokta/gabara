import { usePage } from "@inertiajs/react";
import { PageProps as InertiaPageProps } from "@inertiajs/core";
import { useState, useCallback } from "react";
import { router } from "@inertiajs/react";

import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import CurrencyInput from "@/Components/form/input/CurrencyInput";
import Label from "@/Components/form/Label";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import { Modal } from "@/Components/ui/modal";

import { formatCalendarDate, formatDateTime, formatTime } from "@/utils/formatDate";
import { createMarkup } from "@/utils/htmlMarkup";
import { confirmDialog } from "@/utils/confirmationDialog";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaRegFile } from "react-icons/fa";

interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    student_name: string;
    submitted_at?: string;
    submission_content?: string;
    grade?: number;
    feedback?: string;
}

interface Assignment {
    id: string;
    class_id: string;
    meeting_id: string;
    class_name: string;
    title: string;
    description: string;
    date_open: string;
    time_open: string;
    date_close: string;
    time_close: string;
    file_link?: string;
    created_at: string;
}

interface PageProps extends InertiaPageProps {
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

export default function AssignmentDetailCard() {
    const { props } = usePage<PageProps>();
    const { auth, assignment, submissions } = props;
    const userRole = auth.user.role || "student";
    const isStudent = userRole === "student";
    const isMentorOrAdmin = userRole === "admin" || userRole === "mentor";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number | "">("");
    const [feedback, setFeedback] = useState<string>("");

    console.log('submissions', submissions);

    const openModal = (submission: Submission) => {
        setSelectedSubmission(submission);
        setGrade(submission.grade || "");
        setFeedback(submission.feedback || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubmission(null);
        setGrade("");
        setFeedback("");
    };

    const handleFileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const file = formData.get("file") as File;
        const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (file && !allowedTypes.includes(file.type)) {
            return;
        }

        if (studentSubmission && studentSubmission.id) {
            formData.append('_method', 'PATCH');
            router.post(
                route("submissions.update", { class: assignment.class_id, assignment: assignment.id, submission: studentSubmission.id }),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        // Keep modal open until finish
                    },
                    onFinish: () => {
                        setLoading(false);
                        closeModal();
                    },
                }
            );
        } else {
            router.post(
                route("submissions.store", { class: assignment.class_id, assignment: assignment.id }),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        // Keep modal open until finish
                    },
                    onFinish: () => {
                        setLoading(false);
                        closeModal();
                    },
                }
            );
        }
    };

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (selectedSubmission && grade !== "") {
            router.post(
                route("submissions.updateGrade", { class: assignment.class_id, assignment: assignment.id, submission: selectedSubmission.id }),
                { grade, feedback },
                {
                    onSuccess: () => {
                        closeModal();
                    },
                    onFinish: () => setLoading(false),
                }
            );
        }
    };

    const parseDateTime = (dateStr?: string, timeStr?: string) => {
        if (!dateStr || !timeStr) return null;

        const base = new Date(dateStr);
        if (isNaN(base.getTime())) return null;

        const [hours, minutes, seconds] = timeStr.trim().split(":").map(Number);

        base.setHours(hours || 0, minutes || 0, seconds || 0, 0);

        return base;
    };

    const calculateTimeRemaining = () => {
        if (!assignment?.date_close || !assignment?.time_close) {
            return "-";
        }

        const now = new Date();
        const closeDate = parseDateTime(assignment.date_close, assignment.time_close);

        if (!closeDate) return "-";

        const diffMs = closeDate.getTime() - now.getTime();
        const studentSubmission = submissions?.find(s => s.student_id === auth.user.id);

        if (studentSubmission?.submitted_at) {
            const submittedDate = new Date(studentSubmission.submitted_at);

            if (!isNaN(submittedDate.getTime()) && submittedDate <= closeDate) {
                return "Mengumpulkan tepat waktu";
            }
        }

        if (diffMs <= 0) return "Waktu habis";

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${days} hari ${hours} jam ${minutes} menit`;
    };

    const studentSubmission = submissions?.find(s => s.student_id === auth.user.id);
    const now = new Date();
    const openDate = parseDateTime(assignment.date_open, assignment.time_open);
    const closeDate = parseDateTime(assignment.date_close, assignment.time_close);
    const isBeforeOpen = openDate ? now < openDate : false;
    const isPastDeadline = closeDate ? now > closeDate : true;

    const handleDelete = useCallback(async () => {
        if (!studentSubmission) return;

        const confirmed = await confirmDialog({
            title: "Hapus Pengajuan?",
            text: "Pengajuan yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (confirmed) {
            router.delete(route("submissions.destroy", { class: assignment.class_id, assignment: assignment.id, submission: studentSubmission.id }));
        }
    }, [studentSubmission]);

    return (
        <>
            <PageBreadcrumb
                crumbs={[
                    { label: "Home", href: "/dashboard" },
                    { label: "Kelasku", href: "/classes" },
                    { label: assignment.class_name, href: `/classes/${assignment.class_id}` },
                    { label: assignment.title },
                ]}
            />

            <div className="mt-6 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">{assignment.title}</h2>
                <div className="mt-6">
                    <div className="grid grid-cols-1 text-sm text-gray-600">
                        <div className="flex gap-1">
                            <Label>Tanggal Dibuka:</Label>
                            {`${formatCalendarDate(assignment.date_open)} | ${formatTime(assignment.time_open)} WIB`}
                        </div>
                        <div className="flex gap-1">
                            <Label>Tanggal Ditutup:</Label>
                            {`${formatCalendarDate(assignment.date_close)} | ${formatTime(assignment.time_close)} WIB`}
                        </div>
                    </div>
                </div>
                <div className="mt-4 border-t-2 border-gray-200 pt-4 text-sm text-gray-500 mb-3" dangerouslySetInnerHTML={createMarkup(assignment.description || "")} />

                {assignment.file_link && (
                    <div className="flex gap-3 border-t-2 border-gray-200 pt-4 w-full mt-2">
                        {/* Icon */}
                        <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-lg">
                            <FaRegFile size={24} className="text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-800">Berkas</h3>
                            </div>

                            <div className="mt-1">
                                <div className="flex justify-between items-center rounded-lg">
                                    <a
                                        href={assignment.file_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline text-sm cursor-pointer"
                                    >
                                        Lihat
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isStudent && (
                    <div className="mt-6">
                        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-xs xsm:max-w-sm md:max-w-md mt-4">
                            <div className="p-6 bg-white rounded-lg">
                                <h4 className="text-lg font-semibold mb-4">{studentSubmission?.submitted_at ? "Edit Pengajuan" : "Kirim Pengajuan"}</h4>
                                <form onSubmit={handleFileSubmit} className="space-y-4">
                                    <div>
                                        <Label>Pengajuan Berkas</Label>
                                        <input
                                            type="file"
                                            name="file"
                                            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={closeModal}>
                                            Batal
                                        </Button>
                                        <Button variant="default" type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                                    {studentSubmission?.submitted_at ? "Memperbarui..." : "Memproses..."}
                                                </>
                                            ) : studentSubmission?.submitted_at ? "Simpan Perubahan" : "Kirim"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        <div className="mt-6 border-t-2 border-gray-200 pt-4">
                            <h3 className="font-medium text-gray-800">Status Pengajuan Tugas</h3>
                            <table className="mt-3 w-full text-sm text-gray-600 border border-gray-300 border-collapse">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 px-3 border-r">Status pengajuan</td>
                                        <td className="py-2 px-3">
                                            {studentSubmission?.submitted_at ? (
                                                <p className="text-green-600">Sudah dikirim</p>
                                            ) : (
                                                <p className="text-red-600">Belum ada pengajuan</p>
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-3 border-r">Status penilaian</td>
                                        <td className="py-2 px-3">{studentSubmission?.grade ? studentSubmission.grade : "Belum dinilai"}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 px-3 border-r">Waktu tersisa</td>
                                        <td className="py-2 px-3">{calculateTimeRemaining()}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-3 border-r">Terakhir diubah</td>
                                        <td className="py-2 px-3">{studentSubmission?.submitted_at ? formatDateTime(studentSubmission.submitted_at) : "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex flex-col md:flex-row gap-2">
                            {studentSubmission?.submitted_at && !isPastDeadline && studentSubmission.grade === null && (
                                <>
                                    <Button
                                        variant="default"
                                        size="md"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Edit Pengajuan
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="md"
                                        onClick={handleDelete}
                                    >
                                        Hapus Pengajuan
                                    </Button>
                                </>
                            )}

                            {!studentSubmission?.submitted_at && !isPastDeadline && !isBeforeOpen && (
                                <Button
                                    variant="default"
                                    size="md"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Kirim Pengajuan
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {isMentorOrAdmin && submissions && (
                    <div className="mt-6 border-t-2 border-gray-200 pt-4">
                        <h3 className="font-medium text-gray-800">Daftar Pengumpulan</h3>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full text-sm text-gray-600 border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border whitespace-nowrap">Nama Siswa</th>
                                        <th className="py-2 px-4 border whitespace-nowrap">Status</th>
                                        <th className="py-2 px-4 border whitespace-nowrap">Waktu Pengumpulan</th>
                                        <th className="py-2 px-4 border whitespace-nowrap">File</th>
                                        <th className="py-2 px-4 border whitespace-nowrap">Nilai</th>
                                        <th className="py-2 px-4 border whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="border-t">
                                            <td className="py-2 px-4 whitespace-nowrap">{submission.student_name}</td>
                                            <td className="py-2 px-4 text-center whitespace-nowrap">
                                                {submission.submitted_at ? (
                                                    <p className="text-green-600">Sudah dikumpulkan</p>
                                                ) : (
                                                    <p className="text-red-600">Belum dikumpulan</p>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 text-center whitespace-nowrap">{submission.submitted_at ? formatDateTime(submission.submitted_at) : "-"}</td>
                                            <td className="py-2 px-4 text-center whitespace-nowrap">
                                                {submission.submission_content ? (
                                                    <a href={submission.submission_content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                        Lihat File
                                                    </a>
                                                ) : "-"}
                                            </td>
                                            <td className="py-2 px-4 text-center whitespace-nowrap">{submission.grade ? submission.grade : "-"}</td>
                                            <td className="py-2 px-4 text-center whitespace-nowrap">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => openModal(submission)}
                                                    disabled={!submission.submitted_at}
                                                >
                                                    Beri Nilai
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-md m-4">
                            <div className="p-6 bg-white rounded-lg">
                                <h4 className="text-lg font-semibold mb-4">Beri Nilai</h4>
                                <form onSubmit={handleGradeSubmit} className="space-y-4">
                                    <div>
                                        <Label>Nama Siswa</Label>
                                        <Input value={selectedSubmission?.student_name || ""} readOnly />
                                    </div>
                                    <div>
                                        <Label required={true}>Nilai</Label>
                                        <CurrencyInput
                                            value={Number(grade ?? (selectedSubmission?.grade || 0))}
                                            onChange={(e) => setGrade(e)}
                                            placeholder="Masukkan nilai (0-100)"
                                        />
                                    </div>
                                    <div>
                                        <Label>Umpan Balik</Label>
                                        <Input
                                            value={feedback ?? (selectedSubmission?.feedback || "")}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Masukkan umpan balik"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={closeModal}>
                                            Batal
                                        </Button>
                                        <Button variant="default" type="submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                                    Menyimpan...
                                                </>
                                            ) : "Simpan"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    </div>
                )}
            </div>
        </>
    );
}
