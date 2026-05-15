import React from "react";
import { Link } from "@inertiajs/react";
import Button from "@/Components/ui/button/Button";
import { FaRegFile } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import { LucideTrash2 } from "lucide-react";
import { createMarkup } from "@/utils/htmlMarkup";
import { Meeting } from "@/types/types";

interface MeetingItemProps {
    meeting: Meeting;
    index: number;
    userRole: string;
    onEdit: (meeting: Meeting) => void;
    onDelete: (id: string) => void;
    onDeleteMaterial: (id: string) => void;
    onDeleteAssignment: (id: string) => void;
    classId: number | string;
}

const MeetingItem = ({
    meeting,
    index,
    userRole,
    onEdit,
    onDelete,
    onDeleteMaterial,
    onDeleteAssignment,
    classId
}: MeetingItemProps) => {
    const isMentorOrAdmin = userRole === "admin" || userRole === "mentor";

    return (
        <div className="mt-6 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <div className="flex flex-col-reverse md:flex-row w-full gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white text-left">
                    Pertemuan {index + 1} - {meeting.title}
                </h2>
                {isMentorOrAdmin && (
                    <div className="flex gap-2 self-end md:self-center md:ml-auto">
                        <Button variant="default" size="sm" onClick={() => onEdit(meeting)}>
                            Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onDelete(meeting.id)}>
                            Hapus
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <div
                    className="text-sm text-gray-500 mt-2 prose max-w-none"
                    dangerouslySetInnerHTML={createMarkup(meeting.description || "")}
                />
            </div>

            {/* Materials */}
            <div className="mt-6 space-y-4">
                {meeting.materials && meeting.materials.length > 0 ? (
                    meeting.materials.map((material) => (
                        <div key={material.id} className="flex gap-3 border-t-2 border-gray-200 dark:border-gray-700 pt-4 w-full">
                            <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-lg shrink-0">
                                <FaRegFile size={24} className="text-white" />
                            </div>
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-800 dark:text-white">Berkas</h3>
                                </div>
                                <div className="mt-1">
                                    <div className="flex justify-between items-center">
                                        <a
                                            href={material.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary hover:underline text-sm"
                                        >
                                            Lihat
                                        </a>
                                        {isMentorOrAdmin && (
                                            <Button
                                                variant="danger"
                                                size="icon"
                                                className="w-8 h-8 flex items-center justify-center"
                                                onClick={() => onDeleteMaterial(material.id)}
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
                    <div className="flex gap-3 border-t-2 border-gray-200 dark:border-gray-700 pt-4 w-full">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-lg shrink-0">
                            <FaRegFile size={24} className="text-white" />
                        </div>
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">Berkas</h3>
                            <p className="text-sm text-gray-500 italic">Belum ada berkas</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Assignments */}
            <div className="mt-6">
                <div className="flex gap-3 border-t-2 border-gray-200 dark:border-gray-700 pt-4 w-full">
                    <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-lg shrink-0">
                        <MdOutlineAssignment size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-800 dark:text-white">Tugas</h3>
                        </div>
                        <div className="mt-1 space-y-1">
                            {meeting.assignments && meeting.assignments.length > 0 ? (
                                meeting.assignments.map((assignment) => (
                                    <div key={assignment.id} className="flex justify-between items-center">
                                        <h4 className="font-medium text-primary hover:underline text-sm">
                                            <Link href={route("assignments.show", { class: classId, assignment: assignment.id })}>
                                                {assignment.title}
                                            </Link>
                                        </h4>
                                        {isMentorOrAdmin && (
                                            <Button
                                                variant="danger"
                                                size="icon"
                                                className="w-8 h-8 flex items-center justify-center"
                                                onClick={() => onDeleteAssignment(assignment.id)}
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
        </div>
    );
};

export default MeetingItem;
