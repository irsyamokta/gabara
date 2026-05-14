import React from "react";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Label from "@/Components/form/Label";
import DatePicker from "@/Components/form/date-picker";
import TimeSelect from "@/Components/form/TimeSelect";
import RichTextEditor from "@/Components/form/RichTextEditor";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AssignmentForm, MaterialForm } from "@/types/types";

interface MeetingFormProps {
    meetingData: any;
    setMeetingData: (key: string, value: any) => void;
    materialLinks: MaterialForm[];
    setMaterialLinks: React.Dispatch<React.SetStateAction<MaterialForm[]>>;
    meetingAssignmentData: AssignmentForm;
    setMeetingAssignmentData: React.Dispatch<React.SetStateAction<AssignmentForm>>;
    showAddMaterial: boolean;
    setShowAddMaterial: (show: boolean) => void;
    showAddAssignment: boolean;
    setShowAddAssignment: (show: boolean) => void;
    serverErrors: Record<string, string>;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing: boolean;
}

const MeetingForm = ({
    meetingData,
    setMeetingData,
    materialLinks,
    setMaterialLinks,
    meetingAssignmentData,
    setMeetingAssignmentData,
    showAddMaterial,
    setShowAddMaterial,
    showAddAssignment,
    setShowAddAssignment,
    serverErrors,
    loading,
    onSubmit,
    onCancel,
    isEditing
}: MeetingFormProps) => {
    return (
        <form
            onSubmit={onSubmit}
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
                        className="w-full text-lg md:text-xl border-b border-gray-300 pb-1 ring-0 focus:outline-none dark:bg-transparent dark:text-white"
                        placeholder="Judul Pertemuan"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                {isEditing ? "Perbarui" : "Simpan"}
                            </>
                        ) : isEditing ? "Perbarui" : "Simpan"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                        Batal
                    </Button>
                </div>
            </div>

            <Label required={true}>Deskripsi Pertemuan</Label>
            <RichTextEditor
                value={meetingData.description}
                onChange={(v) => setMeetingData("description", v ?? "")}
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
                        onClick={() => setShowAddMaterial(true)}
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
                        onClick={() => setShowAddAssignment(true)}
                        disabled={showAddAssignment}
                    >
                        {showAddAssignment ? "Tugas Ditambahkan" : "+ Tambah Tugas"}
                    </Button>
                </div>
            </div>

            {showAddMaterial && (
                <div className="mt-6 w-full">
                    <Label>Berkas</Label>
                    <div className="p-4 border w-full rounded-lg space-y-2 dark:border-gray-700">
                        {materialLinks.map((material, index) => (
                            <div key={index} className="flex gap-2 w-full items-center">
                                <div className="w-full">
                                    <Input
                                        type="url"
                                        value={material.link}
                                        onChange={(e) => {
                                            const newLinks = [...materialLinks];
                                            newLinks[index] = { ...newLinks[index], link: e.target.value };
                                            setMaterialLinks(newLinks);
                                        }}
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
                                        onClick={() => setMaterialLinks(prev => prev.filter((_, i) => i !== index))}
                                        className="px-2 py-1"
                                    >
                                        Hapus
                                    </Button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-sm transition text-primary border border-dashed border-primary bg-transparent px-6 py-2 text-sm"
                            onClick={() => setMaterialLinks(prev => [...prev, { link: "", id: undefined }])}
                        >
                            + Tambah Link Berkas Lain
                        </button>
                    </div>
                </div>
            )}

            {showAddAssignment && (
                <div className="mt-6">
                    <Label required={true}>Tugas</Label>
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label required={true}>Judul Tugas</Label>
                                <Input
                                    type="text"
                                    value={meetingAssignmentData.title}
                                    onChange={(e) => setMeetingAssignmentData(p => ({ ...p, title: e.target.value }))}
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
                                    onChange={(e) => setMeetingAssignmentData(p => ({ ...p, file_link: e.target.value }))}
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
                                    onChange={(v) => setMeetingAssignmentData(p => ({ ...p, date_open: v }))}
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
                                    onChange={(v) => setMeetingAssignmentData(p => ({ ...p, time_open: v }))}
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
                                    onChange={(v) => setMeetingAssignmentData(p => ({ ...p, date_close: v }))}
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
                                    onChange={(v) => setMeetingAssignmentData(p => ({ ...p, time_close: v }))}
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
                                onChange={(v) => setMeetingAssignmentData(p => ({ ...p, description: v ?? "" }))}
                            />
                            {serverErrors["assignments.0.description"] && (
                                <p className="text-xs text-red-500 mt-1">{serverErrors["assignments.0.description"]}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default MeetingForm;
