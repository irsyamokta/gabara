import { useEffect, useState } from "react";
import { useForm, usePage, router } from "@inertiajs/react";

import { Modal } from "@/Components/ui/modal";
import Input from "@/Components/form/input/InputField";
import RichTextEditor from "@/Components/form/RichTextEditor";
import Label from "@/Components/form/Label";
import Button from "@/Components/ui/button/Button";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface AnnouncementForm {
    thumbnail: File | null;
    title: string;
    content: string;
}

interface ModalAnnouncementProps {
    isOpen: boolean;
    onClose: () => void;
    announcementData?: any | null;
}

export const ModalAnnouncement = ({ isOpen, onClose, announcementData }: ModalAnnouncementProps) => {
    const { auth } = usePage().props as any;
    const role = auth.user.role;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const initialFormData: AnnouncementForm = {
        thumbnail: null,
        title: "",
        content: "",
    };

    const { data, setData, reset } = useForm<AnnouncementForm>(initialFormData);

    useEffect(() => {
        if (isOpen) {
            if (announcementData) {
                setData({
                    thumbnail: null,
                    title: announcementData.title || "",
                    content: announcementData.content || "",
                });
                setImageFile(null);
                setImagePreview(announcementData.thumbnail || null);
            } else {
                reset();
                setImageFile(null);
                setImagePreview(null);
            }
            setServerErrors({});
        } else {
            reset();
            setImageFile(null);
            setImagePreview(null);
        }
    }, [isOpen, announcementData, reset]);

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

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === "thumbnail" && value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== undefined) {
                formData.append(key, value as string);
            }
        });

        if (announcementData) {
            formData.append("_method", "PATCH");
            router.post(route("announcements.update", announcementData.id), formData, {
                forceFormData: true,
                onSuccess: () => {
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
            router.post(route("announcements.store"), formData, {
                forceFormData: true,
                onSuccess: () => {
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[330px] 2xsm:max-w-[350px] md:max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <h4 className="text-2xl font-semibold mb-4">
                    {announcementData ? "Edit Pengumuman" : "Tambah Pengumuman"}
                </h4>

                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                            e.preventDefault();
                        }
                    }}
                >
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

                    {/* Title */}
                    <div>
                        <Label required={true}>Judul</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Masukkan judul pengumuman"
                        />
                        {serverErrors.title && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.title}</p>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                        <Label required={true}>Konten</Label>
                        <RichTextEditor
                            value={data.content ?? ""}
                            onChange={(v: string) => setData("content", v ?? "")}
                        />
                        {serverErrors.content && (
                            <p className="text-xs text-red-500 mt-1">{serverErrors.content}</p>
                        )}
                    </div>

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
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                                    Memproses...
                                </>
                            ) : "Simpan"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
