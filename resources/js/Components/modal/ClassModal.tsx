import { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { Modal } from "@/Components/ui/modal";
import Button from "@/Components/ui/button/Button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import EnrollmentSection from "./class/EnrollmentSection";
import ClassFieldsSection from "./class/ClassFieldsSection";

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
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
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
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < 10; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
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
                        <EnrollmentSection
                            value={data.enrollment_code}
                            onChange={(v) => setData("enrollment_code", v)}
                            error={serverErrors.enrollment_code}
                        />
                    ) : (
                        <ClassFieldsSection
                            data={data}
                            setData={setData}
                            serverErrors={serverErrors}
                            imagePreview={imagePreview}
                            handleImageChange={handleImageChange}
                            generateEnrollmentCode={generateEnrollmentCode}
                            copyToClipboard={copyToClipboard}
                            copied={copied}
                        />
                    )}

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
