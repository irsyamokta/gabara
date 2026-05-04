import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { FormEventHandler } from 'react';

import { Modal } from "@/Components/ui/modal";
import DatePicker from "@/Components/form/date-picker";
import Button from "@/Components/ui/button/Button";
import Input from "@/Components/form/input/InputField";
import Select from "@/Components/form/Select";
import Label from "@/Components/form/Label";

import { AiOutlineLoading3Quarters, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface ModalUserProps {
    isOpen: boolean;
    onClose: () => void;
    user?: any;
}

type UserForm = {
    name: string;
    phone: string;
    email: string;
    gender: string;
    avatar: File | null;
    role: string;
    password: string;
    birthdate?: string;
    parent_name?: string;
    parent_phone?: string;
    address?: string;
    expertise?: string;
    scope?: string;
};

export const ModalUser = ({ isOpen, onClose, user }: ModalUserProps) => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const isEditing = !!user;

    const { data, setData, reset, errors } = useForm<UserForm>({
        name: "",
        phone: "",
        email: "",
        gender: "",
        avatar: null,
        role: "",
        password: "",
        birthdate: "",
        parent_name: "",
        parent_phone: "",
        address: "",
        expertise: "",
        scope: "",
    });

    useEffect(() => {
        if (isOpen && isEditing && user) {
            setData({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                gender: user.gender || "",
                avatar: null,
                role: user.role || "",
                password: "",
                birthdate: user.birthdate || "",
                parent_name: user.parent_name || "",
                parent_phone: user.parent_phone || "",
                address: user.address || "",
                expertise: user.expertise || "",
                scope: user.scope || "",
            });
            setImagePreview(user.avatar || null);
        } else if (!isOpen) {
            reset();
            setImagePreview(null);
            setServerErrors({});
        }
    }, [isOpen, user, isEditing, setData, reset]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        setLoading(true);

        const formData = new FormData();
        if (isEditing) {
            formData.append("_method", "PUT");
        }
        Object.entries(data).forEach(([key, value]) => {
            if (key === "avatar" && value instanceof File) {
                formData.append(key, value);
            } else if (value !== null && value !== undefined && (key !== "password" || value !== "")) {
                formData.append(key, value as string);
            }
        });

        router.post(isEditing ? route("users.update", user.id) : route("users.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
                setLoading(false);
                onClose();
            },
            onError: (errors) => {
                setServerErrors(errors);
                setLoading(false);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[330px] 2xsm:max-w-[350px] md:max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[800px] max-h-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                <h4 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    {isEditing ? "Edit Pengguna" : "Tambah Pengguna"}
                </h4>

                <form
                    className="flex flex-col"
                    onSubmit={handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                            e.preventDefault();
                        }
                    }}
                >
                    <div className="space-y-5">
                        {/* Profile */}
                        <div>
                            <Label>Foto Profil</Label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={
                                        imagePreview ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "User")}`
                                    }
                                    alt="Profile Preview"
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                                <input
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setData("avatar", file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/80"
                                />
                            </div>
                            {serverErrors.avatar && <p className="mt-1 text-xs text-red-500">{serverErrors.avatar}</p>}
                        </div>

                        {/* Name */}
                        <div>
                            <Label required={true}>Nama Lengkap</Label>
                            <Input
                                name="name"
                                value={data.name}
                                placeholder="Masukkan Nama Lengkap"
                                onChange={(e) => setData("name", e.target.value)}
                            />
                            {serverErrors.name && <p className="mt-1 text-xs text-red-500">{serverErrors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <Label required={true}>Email</Label>
                            <Input
                                name="email"
                                value={data.email}
                                placeholder="Masukkan Email"
                                onChange={(e) => setData("email", e.target.value)}
                                {...isEditing && { disabled: true }}
                            />
                            {serverErrors.email && <p className="mt-1 text-xs text-red-500">{serverErrors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <Label required={true}>No Hp</Label>
                            <Input
                                name="phone"
                                value={data.phone}
                                inputMode="numeric"
                                maxLength={15}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    setData("phone", onlyNumbers);
                                }}
                                placeholder="Masukkan No Hp"
                            />
                            {serverErrors.phone && <p className="mt-1 text-xs text-red-500">{serverErrors.phone}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                            <Label required={true}>Jenis Kelamin</Label>
                            <Select
                                value={data.gender}
                                onChange={(value) => setData("gender", value)}
                                options={[
                                    { value: "Laki-laki", label: "Laki-laki" },
                                    { value: "Perempuan", label: "Perempuan" },
                                ]}
                                placeholder="Pilih jenis kelamin"
                                className="w-full"
                            />
                            {serverErrors.gender && <p className="mt-1 text-xs text-error-500">{serverErrors.gender}</p>}
                        </div>

                        {/* Birthdate */}
                        <div>
                            <Label required={true}>Tanggal Lahir</Label>
                            <DatePicker
                                id="birthdate"
                                value={data.birthdate}
                                onChange={(e) => setData("birthdate", e)}
                                placeholder="Tanggal Lahir"
                            />
                            {serverErrors.birthdate && <p className="mt-1 text-xs text-red-500">{serverErrors.birthdate}</p>}
                        </div>

                        {/* Role */}
                        <div>
                            <Label required={true}>Role</Label>
                            <Select
                                value={data.role}
                                onChange={(value) => setData("role", value)}
                                options={[
                                    { value: "admin", label: "Admin" },
                                    { value: "mentor", label: "Mentor" },
                                    { value: "student", label: "Student" },
                                ]}
                                placeholder="Pilih role"
                            />
                            {serverErrors.role && <p className="text-xs text-red-500 mt-1">{serverErrors.role}</p>}
                        </div>

                        {/* Conditional Fields for Student */}
                        {data.role === "student" && (
                            <>
                                {/* Parent Name */}
                                <div>
                                    <Label required={true}>Nama Orang Tua</Label>
                                    <Input
                                        name="parent_name"
                                        value={data.parent_name}
                                        placeholder="Masukkan Nama Orang Tua"
                                        onChange={(e) => setData("parent_name", e.target.value)}
                                    />
                                    {serverErrors.parent_name && <p className="mt-1 text-xs text-red-500">{serverErrors.parent_name}</p>}
                                </div>

                                {/* Parent Phone */}
                                <div>
                                    <Label required={true}>No Hp Orang Tua</Label>
                                    <Input
                                        name="parent_phone"
                                        value={data.parent_phone}
                                        inputMode="numeric"
                                        maxLength={15}
                                        onChange={(e) => {
                                            const onlyNumbers = e.target.value.replace(/\D/g, "");
                                            setData("parent_phone", onlyNumbers);
                                        }}
                                        placeholder="Masukkan No Hp Orang Tua"
                                    />
                                    {serverErrors.parent_phone && <p className="mt-1 text-xs text-red-500">{serverErrors.parent_phone}</p>}
                                </div>

                                {/* Address */}
                                <div>
                                    <Label required={true}>Alamat</Label>
                                    <Input
                                        name="address"
                                        value={data.address}
                                        placeholder="Masukkan Alamat"
                                        onChange={(e) => setData("address", e.target.value)}
                                    />
                                    {serverErrors.address && <p className="mt-1 text-xs text-red-500">{serverErrors.address}</p>}
                                </div>
                            </>
                        )}

                        {/* Conditional Fields for Mentor */}
                        {data.role === "mentor" && (
                            <>
                                {/* Expertise */}
                                <div>
                                    <Label required={true}>Keahlian</Label>
                                    <Input
                                        name="expertise"
                                        value={data.expertise}
                                        placeholder="Masukkan Keahlian"
                                        onChange={(e) => setData("expertise", e.target.value)}
                                    />
                                    {serverErrors.expertise && <p className="mt-1 text-xs text-red-500">{serverErrors.expertise}</p>}
                                </div>

                                {/* Scope */}
                                <div>
                                    <Label required={true}>Pekerjaan</Label>
                                    <Input
                                        name="scope"
                                        value={data.scope}
                                        placeholder="Masukkan Lingkup Pekerjaan"
                                        onChange={(e) => setData("scope", e.target.value)}
                                    />
                                    {serverErrors.scope && <p className="mt-1 text-xs text-red-500">{serverErrors.scope}</p>}
                                </div>
                            </>
                        )}

                        {/* Password */}
                        <div>
                            <Label required={!isEditing}>Kata Sandi {isEditing && "(Kosongkan jika tidak ingin mengubah)"}</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="Masukkan Kata Sandi"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(showPassword => !showPassword)}
                                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                </button>
                            </div>
                            {serverErrors.password && (
                                <p className="mt-1 text-xs text-red-500">{serverErrors.password}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6 justify-end">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Batal
                        </Button>
                        <Button type="submit" variant="default" disabled={loading}>
                            {loading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                                    Loading...
                                </>
                            ) : (
                                isEditing ? "Perbarui" : "Simpan"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
