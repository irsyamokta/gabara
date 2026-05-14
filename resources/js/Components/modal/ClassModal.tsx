import { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

interface ClassForm {
    thumbnail: File | null;
    name: string;
    description: string;
    enrollment_code: string;
    academic_year_tag: string;
    visibility: boolean;
}

interface ModalClassProps {
    isOpen: boolean;
    onClose: () => void;
    classData?: any | null;
}

export const ModalClass = ({ isOpen, onClose, classData }: ModalClassProps) => {
    const { auth } = usePage().props as any;
    const role = auth.user.role;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>(
        {},
    );
    const [copied, setCopied] = useState(false);

    const initialFormData: ClassForm = {
        thumbnail: null,
        name: "",
        description: "",
        enrollment_code: "",
        academic_year_tag: "",
        visibility: true,
    };

    const { data, setData, reset } = useForm<ClassForm>(initialFormData);

    const generateEnrollmentCode = () => {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < 10; i++) {
            code += characters.charAt(
                Math.floor(Math.random() * characters.length),
            );
        }
        setData("enrollment_code", code);
    };

    const copyToClipboard = () => {
        if (data.enrollment_code) {
            navigator.clipboard.writeText(data.enrollment_code).then(
                () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                },
                () => {
                    setCopied(false);
                },
            );
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (classData) {
                setData({
                    thumbnail: null,
                    name: classData.name || "",
                    description: classData.description || "",
                    enrollment_code: classData.enrollment_code || "",
                    academic_year_tag: classData.academic_year_tag || "",
                    visibility: classData.visibility ?? true,
                });
                setImageFile(null);
                setImagePreview(classData.thumbnail || null);
            } else {
                reset();
                setImageFile(null);
                setImagePreview(null);
                if (role === "mentor" || role === "admin") {
                    generateEnrollmentCode();
                }
            }
            setServerErrors({});
        } else {
            reset();
            setImageFile(null);
            setImagePreview(null);
        }
    }, [isOpen, classData, reset, role]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setData("thumbnail", file || null);
        setImageFile(file || null);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (role === "student") {
            router.post(
                route("enrollments.store"),
                { enrollment_code: data.enrollment_code },
                {
                    onSuccess: (page: any) => {
                        if (page.props.flash?.error) return;
                        reset();
                        onClose();
                    },
                    onError: (errors) => {
                        setServerErrors(errors);
                    },
                    onFinish: () => setLoading(false),
                },
            );
            return;
        }

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "thumbnail" && value instanceof File) {
                formData.append(key, value);
            } else if (key === "visibility") {
                formData.append(key, value ? "1" : "0");
            } else if (value !== null && value !== undefined) {
                formData.append(key, value as string);
            }
        });

        if (classData) {
            formData.append("_method", "PATCH");
            router.post(route("classes.update", classData.id), formData, {
                forceFormData: true,
                onSuccess: (page: any) => {
                    if (page.props.flash?.error) return;
                    reset();
                    setImageFile(null);
                    setImagePreview(null);
                    onClose();
                },
                onError: (errors) => {
                    setServerErrors(errors);
                },
                onFinish: () => setLoading(false),
            });
        } else {
            router.post(route("classes.store"), formData, {
                forceFormData: true,
                onSuccess: (page: any) => {
                    if (page.props.flash?.error) return;
                    reset();
                    setImageFile(null);
                    setImagePreview(null);
                    onClose();
                },
                onError: (errors) => {
                    setServerErrors(errors);
                },
                onFinish: () => setLoading(false),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[330px] 2xsm:max-w-[350px] md:max-w-[700px] m-4"
        >
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <h4 className="text-2xl font-semibold mb-4">
                    {role === "student"
                        ? "Bergabung ke Kelas"
                        : classData
                          ? "Edit Kelas"
                          : "Tambah Kelas"}
                </h4>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        if (
                            e.key === "Enter" &&
                            (e.target as HTMLElement).tagName !== "TEXTAREA"
                        ) {
                            e.preventDefault();
                        }
                    }}
                >
                    {role === "student" ? (
                        <div>
                            <Label required={true}>Kode Enrollment</Label>
                            <Input
                                value={data.enrollment_code}
                                onChange={(e) =>
                                    setData("enrollment_code", e.target.value)
                                }
                                placeholder="Masukkan kode kelas"
                            />
                            {serverErrors.enrollment_code && (
                                <p className="text-xs text-red-500 mt-1">
                                    {serverErrors.enrollment_code}
                                </p>
                            )}
                        </div>
                    ) : (
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
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.thumbnail}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <Label required={true}>Nama Kelas</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Masukkan nama kelas"
                                    required
                                />
                                {serverErrors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label required={true}>Deskripsi</Label>
                                <RichTextEditor
                                    value={data.description ?? ""}
                                    onChange={(v: string) =>
                                        setData("description", v ?? "")
                                    }
                                />
                                {serverErrors.description && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.description}
                                    </p>
                                )}
                            </div>

                            {/* Enrollment Code */}
                            <div>
                                <Label required={true}>Kode Enrollment</Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            value={data.enrollment_code}
                                            onChange={(e) =>
                                                setData(
                                                    "enrollment_code",
                                                    e.target.value,
                                                )
                                            }
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
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.enrollment_code}
                                    </p>
                                )}
                            </div>

                            {/* Academic Year */}
                            <div>
                                <Label required={true}>Tahun Akademik</Label>
                                <Select
                                    value={data.academic_year_tag}
                                    onChange={(value) =>
                                        setData("academic_year_tag", value)
                                    }
                                    options={[
                                        {
                                            value: "2025/2026",
                                            label: "2025/2026",
                                        },
                                        {
                                            value: "2026/2027",
                                            label: "2026/2027",
                                        },
                                        {
                                            value: "2027/2028",
                                            label: "2027/2028",
                                        },
                                        {
                                            value: "2028/2029",
                                            label: "2028/2029",
                                        },
                                        {
                                            value: "2029/2030",
                                            label: "2029/2030",
                                        },
                                    ]}
                                />
                                {serverErrors.academic_year_tag && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.academic_year_tag}
                                    </p>
                                )}
                            </div>

                            {/* Visibility */}
                            <div>
                                <Label required={true}>Visibilitas</Label>
                                <Select
                                    value={data.visibility ? "1" : "0"}
                                    onChange={(value) =>
                                        setData("visibility", value === "1")
                                    }
                                    options={[
                                        { value: "1", label: "Publik" },
                                        { value: "0", label: "Privat" },
                                    ]}
                                />
                                {serverErrors.visibility && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {serverErrors.visibility}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                    Memproses...
                                </>
                            ) : role === "student" ? (
                                "Bergabung"
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
