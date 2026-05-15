import React from "react";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import { MdContentCopy } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

interface ClassFieldsSectionProps {
    data: any;
    setData: any;
    serverErrors: any;
    imagePreview: string | null;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    generateEnrollmentCode: () => void;
    copyToClipboard: () => void;
    copied: boolean;
}

const ClassFieldsSection = ({
    data,
    setData,
    serverErrors,
    imagePreview,
    handleImageChange,
    generateEnrollmentCode,
    copyToClipboard,
    copied,
}: ClassFieldsSectionProps) => {
    return (
        <>
            {/* Thumbnail */}
            <div>
                <Label required={false}>Thumbnail</Label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                />
                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Thumbnail Preview"
                        className="mt-2 h-24 w-24 object-cover rounded"
                    />
                )}
                {serverErrors.thumbnail && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.thumbnail}</p>
                )}
            </div>

            {/* Name */}
            <div>
                <Label required={true}>Nama Kelas</Label>
                <Input
                    value={data.name}
                    onChange={(e: any) => setData("name", e.target.value)}
                    placeholder="Masukkan nama kelas"
                    required
                />
                {serverErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.name}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <Label required={true}>Deskripsi</Label>
                <RichTextEditor
                    value={data.description ?? ""}
                    onChange={(v: string) => setData("description", v ?? "")}
                />
                {serverErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.description}</p>
                )}
            </div>

            {/* Enrollment Code */}
            <div>
                <Label required={true}>Kode Enrollment</Label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={data.enrollment_code}
                            onChange={(e: any) => setData("enrollment_code", e.target.value)}
                            placeholder="Masukkan kode kelas"
                            className="pr-10"
                            readOnly
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <MdContentCopy className="h-5 w-5" />
                                {copied && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow">
                                        Disalin!
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={generateEnrollmentCode}
                        className="whitespace-nowrap border border-gray-300 px-3.5 py-3.5 rounded-md"
                    >
                        <FiRefreshCw />
                    </button>
                </div>
                {serverErrors.enrollment_code && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.enrollment_code}</p>
                )}
            </div>

            {/* Academic Year */}
            <div>
                <Label required={true}>Tahun Akademik</Label>
                <Select
                    value={data.academic_year_tag}
                    onChange={(value: any) => setData("academic_year_tag", value)}
                    options={[
                        { value: "2025/2026", label: "2025/2026" },
                        { value: "2026/2027", label: "2026/2027" },
                        { value: "2027/2028", label: "2027/2028" },
                        { value: "2028/2029", label: "2028/2029" },
                        { value: "2029/2030", label: "2029/2030" },
                    ]}
                />
                {serverErrors.academic_year_tag && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.academic_year_tag}</p>
                )}
            </div>

            {/* Visibility */}
            <div>
                <Label required={true}>Visibilitas</Label>
                <Select
                    value={data.visibility ? "1" : "0"}
                    onChange={(value: any) => setData("visibility", value === "1")}
                    options={[
                        { value: "1", label: "Publik" },
                        { value: "0", label: "Privat" },
                    ]}
                />
                {serverErrors.visibility && (
                    <p className="text-xs text-red-500 mt-1">{serverErrors.visibility}</p>
                )}
            </div>
        </>
    );
};

export default ClassFieldsSection;
