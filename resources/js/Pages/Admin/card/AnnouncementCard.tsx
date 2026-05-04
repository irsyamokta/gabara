import { useState, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";

import { ModalAnnouncement } from "../modal/ModalAnnouncement";
import Button from "@/Components/ui/button/Button";
import HeaderSection from "@/Components/card/HeaderSectionCard";
import EmptyState from "@/Components/empty/EmptyState";
import ImageFallback from "@/Components/ui/images/ImageFallback";

import { confirmDialog } from "@/utils/confirmationDialog";
import { createMarkup } from "@/utils/htmlMarkup";

import { LuPencil, LuTrash2 } from "react-icons/lu";

export default function AnnouncementCard() {
    const { props }: any = usePage();
    const announcements = props.announcements || [];
    const role = props.auth?.user?.role;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editAnnouncement, setEditAnnouncement] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = useCallback(() => {
        setEditAnnouncement(null);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus Pengumuman?",
            text: "Pengumuman yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("announcements.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
            
                setDeletingId(null);
            },
            onError: () => {
             
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((item: any) => {
        setEditAnnouncement(item);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditAnnouncement(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="Pengumuman"
                buttonLabel="Tambah"
                onButtonClick={handleCreate}
                showButton={role === "admin"}
            />

            {/* Modal */}
            <ModalAnnouncement
                isOpen={isModalOpen}
                onClose={handleClose}
                announcementData={editAnnouncement}
            />

            {/* Cards */}
            {announcements.length === 0 && <EmptyState title="Belum ada pengumuman" />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                    >
                        {/* Thumbnail + Admin Avatar */}
                        <div
                            onClick={() => router.visit(route("announcements.show", item.id))}
                        >
                            <div className="relative">
                                <ImageFallback
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-40 object-cover"
                                    fallbackClassName="w-full h-40 object-cover bg-gray-200"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1">
                                <div className="flex flex-col items-start gap-2">
                                    <h1 className="text-lg font-bold text-gray-800 line-clamp-1">
                                        {item.title}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Diposting: {new Date(item.posted_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                {/* Description */}
                                <div
                                    className="text-sm text-gray-500 mt-2 line-clamp-3"
                                    dangerouslySetInnerHTML={createMarkup(item.content || "")}
                                />
                                <p className="text-sm text-gray-700 mt-3">
                                    Author: <span className="font-medium">{item.admin?.name}</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {role === "admin" && (
                            <div className="p-4 flex gap-2 mt-auto">
                                <Button
                                    type="button"
                                    size="md"
                                    variant="default"
                                    onClick={() => handleEdit(item)}
                                    aria-label="Edit pengumuman"
                                    disabled={deletingId === item.id}
                                >
                                    <LuPencil />
                                </Button>
                                <Button
                                    type="button"
                                    size="md"
                                    variant="danger"
                                    onClick={() => handleDelete(item.id)}
                                    aria-label="Hapus pengumuman"
                                    disabled={deletingId === item.id}
                                >
                                    {deletingId === item.id ? (
                                        <LuTrash2 className="animate-spin" />
                                    ) : (
                                        <LuTrash2 />
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
