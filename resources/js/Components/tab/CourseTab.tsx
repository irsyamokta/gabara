import { useState, useCallback, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Label from "@/Components/form/Label";
import DatePicker from "@/Components/form/date-picker";
import TimeSelect from "@/Components/form/TimeSelect";
import RichTextEditor from "@/Components/form/RichTextEditor";

import { MdOutlineQuiz } from "react-icons/md";


import { createMarkup } from "@/utils/htmlMarkup";
import { confirmDialog } from "@/utils/confirmationDialog";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaRegFile } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import { LucideTrash2 } from "lucide-react";

import {
    User,
    Meeting,
    Material,
    Assignment,
    Class,
    MeetingForm,
    MaterialForm,
    AssignmentForm,
    PageProps,
    CourseTabProps,
} from "@/types/types";

export default function CourseTab({ classData }: CourseTabProps) {
    const { props } = usePage<PageProps>();
    const userRole = props.auth.user.role || "student";
    const [meetings, setMeetings] = useState<Meeting[]>(() =>
        classData.meetings?.map(meeting => ({
            ...meeting,
            materials: meeting.materials ?? [],
            assignments: meeting.assignments ?? [],
        })) || []
    );
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const { data: meetingData, setData: setMeetingData, reset: resetMeeting } = useForm<MeetingForm>({
        title: "",
        description: "",
        materials: [],
        assignments: [],
    });

    const [materialLinks, setMaterialLinks] = useState<MaterialForm[]>([{ link: "", id: undefined }]);
    const [meetingAssignmentData, setMeetingAssignmentData] = useState<AssignmentForm>({
        title: "",
        description: "",
        date_open: "",
        time_open: "00:00",
        date_close: "",
        time_close: "00:00",
        file_link: "",
        id: undefined,
    });

    useEffect(() => {
        if (props.class?.meetings) {
            setMeetings(props.class.meetings.map(meeting => ({
                ...meeting,
                materials: meeting.materials ?? [],
                assignments: meeting.assignments ?? [],
            })));
        }
    }, [props.class]);

    useEffect(() => {
        if (editingMeeting) {
            setMeetingData({
                title: editingMeeting.title,
                description: editingMeeting.description,
                materials: editingMeeting.materials?.map(m => ({ link: m.link, id: m.id })) ?? [],
                assignments: editingMeeting.assignments?.map(a => ({ ...a, id: a.id })) ?? [],
            });
            setMaterialLinks(editingMeeting.materials?.length > 0
                ? editingMeeting.materials.map(m => ({ link: m.link, id: m.id }))
                : [{ link: "", id: undefined }]);
            setShowAddMaterial(editingMeeting.materials?.length > 0);
            if (editingMeeting.assignments?.length > 0) {
                const firstAssignment = editingMeeting.assignments[0];
                setMeetingAssignmentData({
                    title: firstAssignment.title,
                    description: firstAssignment.description,
                    date_open: firstAssignment.date_open,
                    time_open: firstAssignment.time_open,
                    date_close: firstAssignment.date_close,
                    time_close: firstAssignment.time_close,
                    file_link: firstAssignment.file_link || "",
                    id: firstAssignment.id,
                });
                setShowAddAssignment(true);
            } else {
                setMeetingAssignmentData({
                    title: "",
                    description: "",
                    date_open: "",
                    time_open: "00:00",
                    date_close: "",
                    time_close: "00:00",
                    file_link: "",
                    id: undefined,
                });
                setShowAddAssignment(false);
            }
        }
    }, [editingMeeting, setMeetingData]);

    const handleAddMeeting = useCallback(() => {
        if (userRole === "admin" || userRole === "mentor") {
            setIsAdding(true);
            setShowAddMaterial(false);
            setShowAddAssignment(false);
            setMaterialLinks([{ link: "", id: undefined }]);
            setMeetingAssignmentData({
                title: "",
                description: "",
                date_open: "",
                time_open: "00:00",
                date_close: "",
                time_close: "00:00",
                file_link: "",
                id: undefined,
            });
            resetMeeting();
            setServerErrors({});
        }
    }, [userRole, resetMeeting]);

    const handleEditMeeting = useCallback((meeting: Meeting) => {
        if (userRole === "admin" || userRole === "mentor") {
            setIsAdding(false);
            setEditingMeeting(meeting);
            setServerErrors({});
        }
    }, [userRole]);

    const handleSubmitMeeting = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);

            if (!meetingData.title || !meetingData.description) {
                setLoading(false);
                return;
            }

            const validMaterials = materialLinks
                .filter((m) => m.link.trim() !== "")
                .map((m) => ({ link: m.link, id: m.id }));
            setMeetingData("materials", validMaterials);

            const validAssignments =
                showAddAssignment &&
                    meetingAssignmentData.title &&
                    meetingAssignmentData.description &&
                    meetingAssignmentData.date_open &&
                    meetingAssignmentData.time_open &&
                    meetingAssignmentData.date_close &&
                    meetingAssignmentData.time_close
                    ? [
                        {
                            title: meetingAssignmentData.title,
                            description: meetingAssignmentData.description,
                            date_open: meetingAssignmentData.date_open,
                            time_open: meetingAssignmentData.time_open || "00:00",
                            date_close: meetingAssignmentData.date_close,
                            time_close: meetingAssignmentData.time_close || "00:00",
                            file_link: meetingAssignmentData.file_link || undefined,
                            id: meetingAssignmentData.id,
                        },
                    ]
                    : [];

            if (showAddAssignment && !validAssignments.length) {
                setLoading(false);
                return;
            }

            setMeetingData("assignments", validAssignments);

            const formData = new FormData();
            formData.append("class_id", classData.id);
            formData.append("title", meetingData.title);
            formData.append("description", meetingData.description);
            validMaterials.forEach((material, index) => {
                formData.append(`materials[${index}][link]`, material.link);
                if (material.id) formData.append(`materials[${index}][id]`, material.id);
            });
            validAssignments.forEach((assignment, index) => {
                formData.append(`assignments[${index}][title]`, assignment.title);
                formData.append(`assignments[${index}][description]`, assignment.description);
                formData.append(`assignments[${index}][date_open]`, assignment.date_open);
                formData.append(`assignments[${index}][time_open]`, assignment.time_open);
                formData.append(`assignments[${index}][date_close]`, assignment.date_close);
                formData.append(`assignments[${index}][time_close]`, assignment.time_close);
                if (assignment.file_link)
                    formData.append(`assignments[${index}][file_link]`, assignment.file_link);
                if (assignment.id) formData.append(`assignments[${index}][id]`, assignment.id);
            });

            if (editingMeeting) {
                formData.append("_method", "PATCH");
                router.post(route("meetings.update", { class: classData.id, meeting: editingMeeting.id }), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setEditingMeeting(null);
                        resetMeeting();
                        setServerErrors({});
                    },
                    onError: (errors) => {
                        setServerErrors(errors);
                    },
                    onFinish: () => setLoading(false),
                });
            } else {
                router.post(route("meetings.store", { class: classData.id }), formData, {
                    forceFormData: true,
                    onSuccess: () => {
                        setIsAdding(false);
                        setShowAddMaterial(false);
                        setShowAddAssignment(false);
                        setMaterialLinks([{ link: "", id: undefined }]);
                        setMeetingAssignmentData({
                            title: "",
                            description: "",
                            date_open: "",
                            time_open: "00:00",
                            date_close: "",
                            time_close: "00:00",
                            file_link: "",
                            id: undefined,
                        });
                        resetMeeting();
                        setServerErrors({});
                    },
                    onError: (errors) => {
                        setServerErrors(errors);
                    },
                    onFinish: () => setLoading(false),
                });
            }
        },
        [meetingData, classData.id, editingMeeting, resetMeeting, materialLinks, showAddAssignment, meetingAssignmentData]
    );

    const handleDeleteMeeting = useCallback(async (id: string) => {
        if (userRole === "admin" || userRole === "mentor") {
            if (await confirmDialog({
                title: "Hapus Pertemuan?",
                text: "Pertemuan yang dihapus tidak dapat dikembalikan!",
                confirmButtonText: "Ya, Hapus",
                cancelButtonText: "Batal",
            })) {
                router.delete(route("meetings.destroy", { class: classData.id, meeting: id }), {
                    onSuccess: () => {
                        setMeetings(prev => prev.filter(m => m.id !== id));
                    },
                });
            }
        }
    }, [userRole]);

    const handleAddMaterialInForm = useCallback(() => {
        setShowAddMaterial(true);
    }, []);

    const handleCancelMaterialInForm = useCallback(() => {
        setShowAddMaterial(false);
        if (editingMeeting && editingMeeting.materials?.length > 0) {
            setMaterialLinks(editingMeeting.materials.map(material => ({ link: material.link, id: material.id })));
        } else {
            setMaterialLinks([{ link: "", id: undefined }]);
        }
    }, [editingMeeting]);

    const handleRemoveMaterial = useCallback((index: number) => {
        setMaterialLinks(prev => {
            const newLinks = prev.filter((_, i) => i !== index);
            return newLinks.length > 0 ? newLinks : [{ link: "", id: undefined }];
        });
    }, []);

    const handleDeleteMaterial = useCallback(async (materialId: string) => {
        if (userRole === "admin" || userRole === "mentor") {
            if (await confirmDialog({
                title: "Hapus Berkas?",
                text: "Berkas yang dihapus tidak dapat dikembalikan!",
                confirmButtonText: "Ya, Hapus",
                cancelButtonText: "Batal",
            })) {
                router.delete(route("materials.destroy", materialId), {
                    onSuccess: () => {
                        router.reload({ only: ['meetings'] });
                    },
                });
            }
        }
    }, [userRole]);

    const handleAddAssignmentInForm = useCallback(() => {
        setShowAddAssignment(true);
    }, []);

    const handleCancelAssignmentInForm = useCallback(() => {
        setShowAddAssignment(false);
        if (editingMeeting && editingMeeting.assignments?.length > 0) {
            const firstAssignment = editingMeeting.assignments[0];
            setMeetingAssignmentData({
                title: firstAssignment.title,
                description: firstAssignment.description,
                date_open: firstAssignment.date_open,
                time_open: firstAssignment.time_open,
                date_close: firstAssignment.date_close,
                time_close: firstAssignment.time_close,
                file_link: firstAssignment.file_link || "",
                id: firstAssignment.id,
            });
        } else {
            setMeetingAssignmentData({
                title: "",
                description: "",
                date_open: "",
                time_open: "",
                date_close: "",
                time_close: "",
                file_link: "",
                id: undefined,
            });
        }
    }, [editingMeeting]);

    const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
        if (userRole === "admin" || userRole === "mentor") {
            if (await confirmDialog({
                title: "Hapus Tugas?",
                text: "Tugas yang dihapus tidak dapat dikembalikan!",
                confirmButtonText: "Ya, Hapus",
                cancelButtonText: "Batal",
            })) {
                router.delete(route("assignments.destroy", { class: classData.id, assignment: assignmentId }), {
                    onSuccess: () => {
                        router.reload({ only: ['meetings'] });
                    },
                });
            }
        }
    }, [userRole]);

    const handleCancel = useCallback(() => {
        setIsAdding(false);
        setEditingMeeting(null);
        setShowAddMaterial(false);
        setShowAddAssignment(false);
        setMaterialLinks([{ link: "", id: undefined }]);
        setMeetingAssignmentData({
            title: "",
            description: "",
            date_open: "",
            time_open: "",
            date_close: "",
            time_close: "",
            file_link: "",
            id: undefined,
        });
        resetMeeting();
        setServerErrors({});
    }, [resetMeeting]);

    const handleDescriptionChange = useCallback((value: string) => {
        setMeetingData("description", value ?? "");
    }, [setMeetingData]);

    const handleMeetingAssignmentDescriptionChange = useCallback((value: string) => {
        setMeetingAssignmentData(prev => ({ ...prev, description: value ?? "" }));
    }, []);

    const handleMeetingAssignmentInputChange = useCallback((field: keyof AssignmentForm, value: string) => {
        setMeetingAssignmentData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleMaterialInputChange = useCallback((index: number, value: string) => {
        setMaterialLinks(prev => {
            const newLinks = [...prev];
            newLinks[index] = { ...newLinks[index], link: value };
            return newLinks;
        });
    }, []);

    return (
        <>

            <div className="mt-6 rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Deskripsi Kelas</h2>
                <div
                    className="text-sm text-gray-500 mt-4"
                    dangerouslySetInnerHTML={createMarkup(classData.description || "")}
                />
            </div>

            {meetings.map((meeting, index) => (
                <div key={meeting.id} className="mt-6 rounded-lg border border-gray-200 p-6">
                    {editingMeeting?.id === meeting.id ? (
                        <form
                            onSubmit={handleSubmitMeeting}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <div className="flex flex-col-reverse md:flex-row w-full items-end md:items-center gap-4 mb-6">
                                <div className="flex w-full">
                                    <input
                                        type="text"
                                        value={meetingData.title}
                                        onChange={(e) => setMeetingData("title", e.target.value)}
                                        className="w-full text-lg md:text-xl border-b border-gray-300 pb-1 ring-0 focus:outline-none"
                                        placeholder="Judul Pertemuan"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="default" size="sm" type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                                Perbarui
                                            </>
                                        ) : "Perbarui"}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                                        Batal
                                    </Button>
                                </div>
                            </div>
                            <Label required={true}>Deskripsi Pertemuan</Label>
                            <RichTextEditor
                                value={meetingData.description}
                                onChange={handleDescriptionChange}
                            />
                            {serverErrors.title && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.title}</p>
                            )}
                            {serverErrors.description && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors.description}</p>
                            )}

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center">
                                    <Button
                                        variant="outlineDash"
                                        size="md"
                                        className="w-full text-primary"
                                        onClick={handleAddMaterialInForm}
                                        disabled={showAddMaterial}
                                    >
                                        {showAddMaterial ? "Berkas Ditambahkan" : "+ Tambah Berkas"}
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <Button
                                        variant="outlineDash"
                                        size="md"
                                        className="w-full text-primary"
                                        onClick={handleAddAssignmentInForm}
                                        disabled={showAddAssignment}
                                    >
                                        {showAddAssignment ? "Tugas Ditambahkan" : "+ Tambah Tugas"}
                                    </Button>
                                </div>
                            </div>

                            {showAddMaterial && (
                                <div className="mt-6 w-full">
                                    <Label>Berkas</Label>
                                    <div className="p-4 border w-full rounded-lg space-y-2">
                                        {materialLinks.map((material, index) => (
                                            <div key={index} className="flex gap-2 w-full items-center">
                                                <div className="w-full">
                                                    <Input
                                                        type="url"
                                                        value={material.link}
                                                        onChange={(e) => handleMaterialInputChange(index, e.target.value)}
                                                        placeholder="Masukkan link berkas (URL)"
                                                    />
                                                    {serverErrors[`materials.${index}.link`] && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            {serverErrors[`materials.${index}.link`]}
                                                        </p>
                                                    )}
                                                </div>
                                                {(!editingMeeting || editingMeeting.materials.length === 0) && materialLinks.length > 1 && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRemoveMaterial(index)}
                                                        className="px-2 py-1"
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex gap-2 justify-between items-center">
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center gap-2 rounded-sm transition text-primary border border-dashed border-primary bg-transparent px-6 py-2 text-sm"
                                                onClick={() => setMaterialLinks(prev => [...prev, { link: "", id: undefined }])}
                                            >
                                                + Tambah Link Berkas Lain
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showAddAssignment && (
                                <div className="mt-6">
                                    <Label required={true}>Tugas</Label>
                                    <div className="p-4 border rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label required={true}>Judul Tugas</Label>
                                                <Input
                                                    type="text"
                                                    value={meetingAssignmentData.title}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("title", e.target.value)}
                                                    placeholder="Judul Tugas"
                                                />
                                                {serverErrors["assignments.0.title"] && (
                                                    <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.title"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label>File Pendukung (Opsional)</Label>
                                                <Input
                                                    type="url"
                                                    value={meetingAssignmentData.file_link || ""}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("file_link", e.target.value)}
                                                    placeholder="Link file pendukung"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label required={true}>Tanggal Dibuka</Label>
                                                <DatePicker
                                                    id="date_open"
                                                    value={meetingAssignmentData.date_open}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("date_open", e)}
                                                    placeholder="Tanggal Dibuka"
                                                />
                                                {serverErrors["assignments.0.date_open"] && (
                                                    <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.date_open"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label required={true}>Waktu Dibuka</Label>
                                                <TimeSelect
                                                    value={meetingAssignmentData.time_open}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("time_open", e)}
                                                />
                                                {serverErrors["assignments.0.time_open"] && (
                                                    <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.time_open"]}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label required={true}>Tanggal Ditutup</Label>
                                                <DatePicker
                                                    id="date_close"
                                                    value={meetingAssignmentData.date_close}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("date_close", e)}
                                                    placeholder="Tanggal Ditutup"
                                                />
                                                {serverErrors["assignments.0.date_close"] && (
                                                    <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.date_close"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label required={true}>Waktu Ditutup</Label>
                                                <TimeSelect
                                                    value={meetingAssignmentData.time_close}
                                                    onChange={(e) => handleMeetingAssignmentInputChange("time_close", e)}
                                                />
                                                {serverErrors["assignments.0.time_close"] && (
                                                    <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.time_close"]}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <Label required={true}>Deskripsi Tugas</Label>
                                            <RichTextEditor
                                                value={meetingAssignmentData.description}
                                                onChange={handleMeetingAssignmentDescriptionChange}
                                            />
                                            {serverErrors["assignments.0.description"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.description"]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        <>
                            <div className="flex flex-col-reverse md:flex-row w-full gap-4">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 text-left">
                                    Pertemuan {index + 1} - {meeting.title}
                                </h2>
                                {(userRole === "admin" || userRole === "mentor") && (
                                    <div className="flex gap-2 self-end md:self-center md:ml-auto">
                                        <Button variant="default" size="sm" onClick={() => handleEditMeeting(meeting)}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteMeeting(meeting.id)}>
                                            Hapus
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500 mt-2" dangerouslySetInnerHTML={createMarkup(meeting.description || "")} />
                            </div>

                            <div className="mt-6 space-y-4">
                                {meeting.materials?.length > 0 ? (
                                    meeting.materials.map((material) => (
                                        <div
                                            key={material.id}
                                            className="flex gap-3 border-t-2 border-gray-200 pt-4 w-full"
                                        >
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
                                                            href={material.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-primary hover:underline text-sm"
                                                        >
                                                            Lihat
                                                        </a>
                                                        {(userRole === "admin" || userRole === "mentor") && (
                                                            <Button
                                                                variant="danger"
                                                                size="icon"
                                                                className="w-8 h-8 flex items-center justify-center"
                                                                onClick={() => handleDeleteMaterial(material.id)}
                                                            >
                                                                <LucideTrash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex gap-3 border-t-2 border-gray-200 pt-4 w-full">
                                        <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-lg">
                                            <FaRegFile size={24} className="text-white" />
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <h3 className="font-medium text-gray-800">Berkas</h3>
                                            <p className="text-sm text-gray-500 italic">Belum ada berkas</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <div className="flex gap-3 border-t-2 border-gray-200 pt-4 w-full">
                                    {/* Icon */}
                                    <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-lg">
                                        <MdOutlineAssignment size={24} className="text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-800">Tugas</h3>
                                        </div>

                                        <div className="mt-1 space-y-1">
                                            {meeting.assignments?.length > 0 ? (
                                                meeting.assignments.map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="flex justify-between items-center rounded-lg"
                                                    >
                                                        <h4 className="font-medium text-primary hover:underline text-sm">
                                                            <Link href={route("assignments.show", { class: classData.id, assignment: assignment.id })}>
                                                                {assignment.title}
                                                            </Link>
                                                        </h4>
                                                        {(userRole === "admin" || userRole === "mentor") && (
                                                            <Button
                                                                variant="danger"
                                                                size="icon"
                                                                className="w-8 h-8 flex items-center justify-center"
                                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                                            >
                                                                <LucideTrash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">Belum ada tugas</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {/* =========================
   INGAT!!! MASUKKAN QUIZ SECTION DISINI!!!
   ========================= */}
            {/* =========================
   QUIZ SECTION - class-scoped, tampilkan setelah daftar pertemuan
   ========================= */}
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
                    {classData.quizzes && classData.quizzes.length > 0 ? (
                        classData.quizzes.map((quiz: any) => (
                            <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border gap-4">
                                {/* Konten Kiri (Info Kuis) */}
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

                                {/* Konten Kanan (Tombol Aksi) */}
                                <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center sm:justify-end gap-4">
                                    {userRole === "student" && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => router.visit(route("classes.quizzes.show", { class: classData.id, quiz: quiz.id }))}
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


            {(userRole === "admin" || userRole === "mentor") && !isAdding && !editingMeeting && (
                <div className="w-full mt-6">
                    <Button variant="outlineDash" size="md" className="w-full text-primary" onClick={handleAddMeeting}>
                        + Tambah Pertemuan
                    </Button>
                </div>
            )}

            {isAdding && (
                <div className="mt-6 rounded-lg border border-gray-200 p-6">
                    <form
                        onSubmit={handleSubmitMeeting}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="flex flex-col-reverse md:flex-row w-full items-end md:items-center gap-4 mb-6">
                            <div className="flex w-full">
                                <input
                                    type="text"
                                    value={meetingData.title}
                                    onChange={(e) => setMeetingData("title", e.target.value)}
                                    className="w-full text-lg md:text-xl border-b border-gray-300 pb-1 ring-0 focus:outline-none"
                                    placeholder="Judul Pertemuan"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="default" size="sm" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                            Simpan
                                        </>
                                    ) : "Simpan"}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                                    Batal
                                </Button>
                            </div>
                        </div>

                        <Label required={true}>Deskripsi Pertemuan</Label>
                        <RichTextEditor
                            value={meetingData.description}
                            onChange={handleDescriptionChange}
                        />
                        {serverErrors.title && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.title}</p>
                        )}
                        {serverErrors.description && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.description}</p>
                        )}

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="outlineDash"
                                    size="md"
                                    className="w-full text-primary"
                                    onClick={handleAddMaterialInForm}
                                    disabled={showAddMaterial}
                                >
                                    {showAddMaterial ? "Berkas Ditambahkan" : "+ Tambah Berkas"}
                                </Button>
                            </div>
                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="outlineDash"
                                    size="md"
                                    className="w-full text-primary"
                                    onClick={handleAddAssignmentInForm}
                                    disabled={showAddAssignment}
                                >
                                    {showAddAssignment ? "Tugas Ditambahkan" : "+ Tambah Tugas"}
                                </Button>
                            </div>
                        </div>

                        {showAddMaterial && (
                            <div className="mt-6 w-full">
                                <Label>Berkas</Label>
                                <div className="p-4 border w-full rounded-lg space-y-2">
                                    {materialLinks.map((material, index) => (
                                        <div key={index} className="flex gap-2 w-full items-center">
                                            <div className="w-full">
                                                <Input
                                                    type="url"
                                                    value={material.link}
                                                    onChange={(e) => handleMaterialInputChange(index, e.target.value)}
                                                    placeholder="Masukkan link berkas (URL)"
                                                />
                                                {serverErrors[`materials.${index}.link`] && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {serverErrors[`materials.${index}.link`]}
                                                    </p>
                                                )}
                                            </div>
                                            {materialLinks.length > 1 && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveMaterial(index)}
                                                    className="px-2 py-1"
                                                >
                                                    Hapus
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex gap-2 justify-between items-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center gap-2 rounded-sm transition text-primary border border-dashed border-primary bg-transparent px-6 py-2 text-sm"
                                            onClick={() => setMaterialLinks(prev => [...prev, { link: "", id: undefined }])}
                                        >
                                            + Tambah Link Berkas Lain
                                        </button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelMaterialInForm}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showAddAssignment && (
                            <div className="mt-6">
                                <Label required={true}>Tugas</Label>
                                <div className="p-4 border rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label required={true}>Judul Tugas</Label>
                                            <Input
                                                type="text"
                                                value={meetingAssignmentData.title}
                                                onChange={(e) => handleMeetingAssignmentInputChange("title", e.target.value)}
                                                placeholder="Judul Tugas"
                                            />
                                            {serverErrors["assignments.0.title"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.title"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label>File Pendukung (Opsional)</Label>
                                            <Input
                                                type="url"
                                                value={meetingAssignmentData.file_link || ""}
                                                onChange={(e) => handleMeetingAssignmentInputChange("file_link", e.target.value)}
                                                placeholder="Link file pendukung"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label required={true}>Tanggal Dibuka</Label>
                                            <DatePicker
                                                id="date_open"
                                                value={meetingAssignmentData.date_open}
                                                onChange={(e) => handleMeetingAssignmentInputChange("date_open", e)}
                                                placeholder="Tanggal Dibuka"
                                            />
                                            {serverErrors["assignments.0.date_open"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.date_open"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label required={true}>Waktu Dibuka</Label>
                                            <TimeSelect
                                                value={meetingAssignmentData.time_open}
                                                onChange={(e) => handleMeetingAssignmentInputChange("time_open", e)}
                                            />
                                            {serverErrors["assignments.0.time_open"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.time_open"]}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label required={true}>Tanggal Ditutup</Label>
                                            <DatePicker
                                                id="date_close"
                                                value={meetingAssignmentData.date_close}
                                                onChange={(e) => handleMeetingAssignmentInputChange("date_close", e)}
                                                placeholder="Tanggal Ditutup"
                                            />
                                            {serverErrors["assignments.0.date_close"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.date_close"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label required={true}>Waktu Ditutup</Label>
                                            <TimeSelect
                                                value={meetingAssignmentData.time_close}
                                                onChange={(e) => handleMeetingAssignmentInputChange("time_close", e)}
                                            />
                                            {serverErrors["assignments.0.time_close"] && (
                                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.time_close"]}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <Label required={true}>Deskripsi Tugas</Label>
                                        <RichTextEditor
                                            value={meetingAssignmentData.description}
                                            onChange={handleMeetingAssignmentDescriptionChange}
                                        />
                                        {serverErrors["assignments.0.description"] && (
                                            <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.description"]}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelAssignmentInForm}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </>
    );
}
