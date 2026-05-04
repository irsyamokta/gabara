import { useState, useMemo, useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { confirmDialog } from "@/utils/confirmationDialog";


import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";

import HeaderSection from "@/Components/card/HeaderSectionCard";
import { EmptyTable } from "@/Components/empty/EmptyTable";
import Button from "@/Components/ui/button/Button";
import Badge from "@/Components/ui/badge/Badge";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import Pagination from "@/Components/ui/pagination/Pagination";
import { ModalUser } from "../modal/ModalUser";

import { formatDateTime, formatCalendarDate } from "@/utils/formatDate";

import { LuTrash2, LuPencil } from "react-icons/lu";

export default function UserTable() {
    const { props }: any = usePage();
    const users = props.users?.data || [];
    const links = props.users?.links || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter((user: any) => {
            const matchesSearch = !search ||
                [user.name, user.email, user.phone].some((field) =>
                    field?.toLowerCase().includes(search.toLowerCase())
                );
            const matchesRole = !roleFilter || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const handleDelete = useCallback(async (id: string) => {
        const confirmed = await confirmDialog({
            title: "Hapus User?",
            text: "User yang dihapus tidak dapat dikembalikan!",
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
        });

        if (!confirmed) return;

        setDeletingId(id);
        router.delete(route("users.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingId(null);
            },
            onError: () => {
                setDeletingId(null);
            },
        });
    }, []);

    const handleEdit = useCallback((user: any) => {
        setEditingUser(user);
        setIsModalOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingUser(null);
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Header */}
            <HeaderSection
                title="User"
                buttonLabel="Tambah"
                onButtonClick={() => {
                    setEditingUser(null);
                    setIsModalOpen(true);
                }}
            />

            {/* Modal */}
            <ModalUser isOpen={isModalOpen} onClose={handleClose} user={editingUser} />

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                {/* Search and Filter Inputs */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-4">
                    <h1 className="text-lg font-semibold text-gray-800">Daftar Pengguna</h1>
                    <div className="flex gap-4">
                        <Select
                            value={roleFilter}
                            onChange={(value) => setRoleFilter(value)}
                            options={[
                                { value: "", label: "Semua Role" },
                                { value: "mentor", label: "Mentor" },
                                { value: "student", label: "Student" },
                            ]}
                            placeholder="Pilih Role"
                            className="w-full max-w-xs"
                        />
                        <div className="w-full">
                            <Input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Foto Profil
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Nama Lengkap
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Email
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Nomor HP
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Jenis Kelamin
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Tanggal Lahir
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Role
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Nama Orang Tua
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    No HP Orang Tua
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Alamat
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Keahlian
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Pekerjaan
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Status
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Dibuat
                                </TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {filteredUsers.length === 0 ? (
                                <EmptyTable colspan={15} description="Tidak ada data user" />
                            ) : (
                                filteredUsers.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            <img
                                                src={
                                                    user.avatar ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                                                }
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.email}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.phone ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.gender ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.birthdate ? formatCalendarDate(user.birthdate) : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role === "student" ? user.parent_name ?? "-" : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role === "student" ? user.parent_phone ?? "-" : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role === "student" ? user.address ?? "-" : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role === "mentor" ? user.expertise ?? "-" : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {user.role === "mentor" ? user.scope ?? "-" : "-"}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm whitespace-nowrap">
                                            {user.status_verified === "Verified" ? (
                                                <Badge color="success">Verified</Badge>
                                            ) : (
                                                <Badge color="error">Unverified</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatDateTime(user.created_at)}
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-theme-sm text-gray-500 dark:text-gray-400 flex gap-2 whitespace-nowrap">
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="default"
                                                aria-label="Edit user"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <LuPencil />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="danger"
                                                aria-label="Hapus user"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id}
                                            >
                                                {deletingId === user.id ? (
                                                    <LuTrash2 className="animate-spin" />
                                                ) : (
                                                    <LuTrash2 />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {props.users.last_page > 1 && (
                        <div className="p-4">
                            <Pagination links={links} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
