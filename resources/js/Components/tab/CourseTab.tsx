import { useState, useCallback, useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";

import CourseDescriptionCard from "./course/CourseDescriptionCard";
import QuizSection from "./course/QuizSection";
import MeetingItem from "./course/MeetingItem";
import MeetingForm from "./course/MeetingForm";

import { confirmDialog } from "@/utils/confirmationDialog";

import {
    Meeting,
    AssignmentForm,
    MaterialForm,
    PageProps,
    CourseTabProps,
    MeetingForm as MeetingFormData
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

    const { data: meetingData, setData: setMeetingData, reset: resetMeeting } = useForm<MeetingFormData>({
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
    }, [resetMeeting]);

    const handleEditMeeting = useCallback((meeting: Meeting) => {
        setIsAdding(false);
        setEditingMeeting(meeting);
        setServerErrors({});
    }, []);

    const handleCancel = useCallback(() => {
        setIsAdding(false);
        setEditingMeeting(null);
        setShowAddMaterial(false);
        setShowAddAssignment(false);
        resetMeeting();
        setServerErrors({});
    }, [resetMeeting]);

    const handleSubmitMeeting = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const validMaterials = materialLinks
            .filter((m) => m.link.trim() !== "")
            .map((m) => ({ link: m.link, id: m.id }));

        const validAssignments = showAddAssignment
            ? [{ ...meetingAssignmentData, time_open: meetingAssignmentData.time_open || "00:00", time_close: meetingAssignmentData.time_close || "00:00" }]
            : [];

        const formData = new FormData();
        formData.append("class_id", String(classData.id));
        formData.append("title", meetingData.title);
        formData.append("description", meetingData.description);
        
        validMaterials.forEach((material, index) => {
            formData.append(`materials[${index}][link]`, material.link);
            if (material.id) formData.append(`materials[${index}][id]`, String(material.id));
        });
        
        validAssignments.forEach((assignment, index) => {
            formData.append(`assignments[${index}][title]`, assignment.title);
            formData.append(`assignments[${index}][description]`, assignment.description);
            formData.append(`assignments[${index}][date_open]`, assignment.date_open);
            formData.append(`assignments[${index}][time_open]`, assignment.time_open);
            formData.append(`assignments[${index}][date_close]`, assignment.date_close);
            formData.append(`assignments[${index}][time_close]`, assignment.time_close);
            if (assignment.file_link) formData.append(`assignments[${index}][file_link]`, assignment.file_link);
            if (assignment.id) formData.append(`assignments[${index}][id]`, String(assignment.id));
        });

        const url = editingMeeting 
            ? route("meetings.update", { class: classData.id, meeting: editingMeeting.id })
            : route("meetings.store", { class: classData.id });

        if (editingMeeting) formData.append("_method", "PATCH");

        router.post(url, formData, {
            forceFormData: true,
            onSuccess: () => {
                handleCancel();
            },
            onError: (errors) => {
                setServerErrors(errors);
            },
            onFinish: () => setLoading(false),
        });
    }, [meetingData, classData.id, editingMeeting, materialLinks, showAddAssignment, meetingAssignmentData, handleCancel]);

    const handleDeleteMeeting = useCallback(async (id: string) => {
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
    }, [classData.id]);

    const handleDeleteMaterial = useCallback(async (materialId: string) => {
        if (await confirmDialog({
            title: "Hapus Berkas?",
            text: "Berkas yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        })) {
            router.delete(route("materials.destroy", materialId), {
                onSuccess: () => router.reload({ only: ['class'] }),
            });
        }
    }, []);

    const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
        if (await confirmDialog({
            title: "Hapus Tugas?",
            text: "Tugas yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        })) {
            router.delete(route("assignments.destroy", { class: classData.id, assignment: assignmentId }), {
                onSuccess: () => router.reload({ only: ['class'] }),
            });
        }
    }, [classData.id]);

    return (
        <>
            <CourseDescriptionCard description={classData.description || ""} />

            <QuizSection 
                classId={classData.id} 
                quizzes={classData.quizzes || []} 
                userRole={userRole} 
            />

            {meetings.map((meeting, index) => (
                <div key={meeting.id}>
                    {editingMeeting?.id === meeting.id ? (
                        <div className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
                            <MeetingForm
                                meetingData={meetingData}
                                setMeetingData={setMeetingData}
                                materialLinks={materialLinks}
                                setMaterialLinks={setMaterialLinks}
                                meetingAssignmentData={meetingAssignmentData}
                                setMeetingAssignmentData={setMeetingAssignmentData}
                                showAddMaterial={showAddMaterial}
                                setShowAddMaterial={setShowAddMaterial}
                                showAddAssignment={showAddAssignment}
                                setShowAddAssignment={setShowAddAssignment}
                                serverErrors={serverErrors}
                                loading={loading}
                                onSubmit={handleSubmitMeeting}
                                onCancel={handleCancel}
                                isEditing={true}
                            />
                        </div>
                    ) : (
                        <MeetingItem
                            meeting={meeting}
                            index={index}
                            userRole={userRole}
                            onEdit={handleEditMeeting}
                            onDelete={handleDeleteMeeting}
                            onDeleteMaterial={handleDeleteMaterial}
                            onDeleteAssignment={handleDeleteAssignment}
                            classId={classData.id}
                        />
                    )}
                </div>
            ))}

            {isAdding && (
                <div className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
                    <MeetingForm
                        meetingData={meetingData}
                        setMeetingData={setMeetingData}
                        materialLinks={materialLinks}
                        setMaterialLinks={setMaterialLinks}
                        meetingAssignmentData={meetingAssignmentData}
                        setMeetingAssignmentData={setMeetingAssignmentData}
                        showAddMaterial={showAddMaterial}
                        setShowAddMaterial={setShowAddMaterial}
                        showAddAssignment={showAddAssignment}
                        setShowAddAssignment={setShowAddAssignment}
                        serverErrors={serverErrors}
                        loading={loading}
                        onSubmit={handleSubmitMeeting}
                        onCancel={handleCancel}
                        isEditing={false}
                    />
                </div>
            )}

            {(userRole === "admin" || userRole === "mentor") && !isAdding && !editingMeeting && (
                <div className="w-full mt-6">
                    <Button variant="outlineDash" size="md" className="w-full text-primary" onClick={handleAddMeeting}>
                        + Tambah Pertemuan
                    </Button>
                </div>
            )}
        </>
    );
}
