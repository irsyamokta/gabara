<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Validator;

class ValidationHelper
{
    public static function user($data, $isUpdate = false, $userId = null)
    {
        $rules = [
            'avatar' => $isUpdate ? 'nullable|image|mimes:jpg,jpeg,png|max:2048' : 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                $isUpdate ? 'unique:users,email,' . $userId : 'unique:users,email',
            ],
            'password' => $isUpdate ? 'nullable|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/' : 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'phone' => [
                'required',
                'string',
                'max:15',
                $isUpdate ? 'unique:users,phone,' . $userId : 'unique:users,phone',
            ],
            'gender' => 'required|string|in:Laki-laki,Perempuan',
            'birthdate' => 'required|date|before:today',
            'role' => 'required|string|in:admin,mentor,student',
            'parent_name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($data) {
                    if ($data['role'] === 'student' && empty($value)) {
                        $fail('Nama orang tua wajib diisi untuk role student.');
                    }
                },
            ],
            'parent_phone' => [
                'nullable',
                'string',
                'max:15',
                function ($attribute, $value, $fail) use ($data) {
                    if ($data['role'] === 'student' && empty($value)) {
                        $fail('Nomor telepon orang tua wajib diisi untuk role student.');
                    }
                },
            ],
            'address' => [
                'nullable',
                'string',
                'max:500',
                function ($attribute, $value, $fail) use ($data) {
                    if ($data['role'] === 'student' && empty($value)) {
                        $fail('Alamat wajib diisi untuk role student.');
                    }
                },
            ],
            'expertise' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($data) {
                    if ($data['role'] === 'mentor' && empty($value)) {
                        $fail('Keahlian wajib diisi untuk role mentor.');
                    }
                },
            ],
            'scope' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($data) {
                    if ($data['role'] === 'mentor' && empty($value)) {
                        $fail('Lingkup pekerjaan wajib diisi untuk role mentor.');
                    }
                },
            ],
        ];

        return Validator::make(
            $data,
            $rules,
            [
                'avatar.image' => 'Foto profil harus berupa gambar.',
                'avatar.mimes' => 'Foto profil harus berupa gambar dengan ekstensi jpg, jpeg, atau png.',
                'avatar.max' => 'Foto profil maksimal 2MB.',

                'name.required' => 'Nama wajib diisi.',
                'name.string' => 'Nama harus berupa teks.',
                'name.max' => 'Nama maksimal 255 karakter.',

                'email.required' => 'Email wajib diisi.',
                'email.string' => 'Email harus berupa teks.',
                'email.email' => 'Format email tidak valid.',
                'email.max' => 'Email maksimal 255 karakter.',
                'email.unique' => 'Email sudah terdaftar.',

                'password.required' => 'Kata sandi wajib diisi.',
                'password.string' => 'Kata sandi harus berupa teks.',
                'password.min' => 'Kata sandi minimal 8 karakter.',
                'password.regex' => 'Kata sandi harus mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus (@$!%*?&).',

                'phone.required' => 'Nomor telepon wajib diisi.',
                'phone.string' => 'Nomor telepon harus berupa teks.',
                'phone.max' => 'Nomor telepon maksimal 15 karakter.',
                'phone.unique' => 'Nomor telepon sudah terdaftar.',

                'gender.required' => 'Jenis kelamin wajib diisi.',
                'gender.string' => 'Jenis kelamin harus berupa teks.',
                'gender.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',

                'birthdate.required' => 'Tanggal lahir wajib diisi.',
                'birthdate.date' => 'Tanggal lahir harus berupa tanggal.',
                'birthdate.before' => 'Tanggal lahir harus sebelum tanggal saat ini.',

                'role.required' => 'Role wajib diisi.',
                'role.string' => 'Role harus berupa teks.',
                'role.in' => 'Role harus admin, mentor, atau student.',

                'parent_name.string' => 'Nama orang tua harus berupa teks.',
                'parent_name.max' => 'Nama orang tua maksimal 255 karakter.',

                'parent_phone.string' => 'Nomor telepon orang tua harus berupa teks.',
                'parent_phone.max' => 'Nomor telepon orang tua maksimal 15 karakter.',

                'address.string' => 'Alamat harus berupa teks.',
                'address.max' => 'Alamat maksimal 500 karakter.',

                'expertise.string' => 'Keahlian harus berupa teks.',
                'expertise.max' => 'Keahlian maksimal 255 karakter.',

                'scope.string' => 'Lingkup pekerjaan harus berupa teks.',
                'scope.max' => 'Lingkup pekerjaan maksimal 255 karakter.',
            ]
        );
    }

    public static function class($data, $isUpdate = false, $classId = null)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'enrollment_code' => [
                'required',
                'string',
                'max:50',
                $isUpdate ? 'unique:classes,enrollment_code,' . $classId : 'unique:classes,enrollment_code',
            ],
            'academic_year_tag' => 'required|string|max:50',
            'visibility' => 'required|boolean',
            'thumbnail' => $isUpdate ? 'nullable|image|mimes:jpeg,png,jpg|max:2048' : 'required|image|mimes:jpeg,png,jpg|max:2048',
        ];

        return Validator::make(
            $data,
            $rules,
            [
                'name.required' => 'Nama kelas wajib diisi.',
                'name.string' => 'Nama kelas harus berupa teks.',
                'name.max' => 'Nama kelas maksimal 255 karakter.',
                'description.required' => 'Deskripsi wajib diisi.',
                'description.string' => 'Deskripsi harus berupa teks.',
                'description.max' => 'Deskripsi maksimal 1000 karakter.',
                'enrollment_code.required' => 'Kode enrollment wajib diisi.',
                'enrollment_code.string' => 'Kode enrollment harus berupa teks.',
                'enrollment_code.max' => 'Kode enrollment maksimal 10 karakter.',
                'enrollment_code.unique' => 'Kode enrollment sudah digunakan.',
                'academic_year_tag.required' => 'Tag tahun akademik wajib diisi.',
                'academic_year_tag.string' => 'Tag tahun akademik harus berupa teks.',
                'academic_year_tag.max' => 'Tag tahun akademik maksimal 50 karakter.',
                'visibility.required' => 'Visibilitas wajib diisi.',
                'visibility.boolean' => 'Visibilitas harus berupa true atau false.',
                'thumbnail.required' => 'Thumbnail harus diisi',
                'thumbnail.image' => 'Thumbnail harus berupa gambar.',
                'thumbnail.mimes' => 'Thumbnail hanya boleh berformat jpeg, png, atau jpg.',
                'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB.',
            ]
        );
    }

    public static function meeting($data, $isUpdate = false, $meetingId = null)
    {
        $rules = [
            'class_id' => ['required', 'string', 'exists:classes,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'materials.*.link' => ['nullable', 'url'],
            'assignments' => ['sometimes', 'array'],
            'assignments.*.title' => ['required', 'string', 'max:255'],
            'assignments.*.description' => ['required', 'string'],
            'assignments.*.date_open' => [
                'required',
                'date',
                $isUpdate ? 'before_or_equal:assignments.*.date_close' : 'after_or_equal:today',
                'before_or_equal:assignments.*.date_close',
            ],
            'assignments.*.time_open' => ['required', 'string'],
            'assignments.*.date_close' => ['required', 'date', 'after_or_equal:assignments.*.date_open'],
            'assignments.*.time_close' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($data) {
                    // Extract index from attribute (e.g. assignments.0.time_close)
                    preg_match('/assignments\.(\d+)\.time_close/', $attribute, $matches);
                    $index = $matches[1] ?? null;

                    if ($index !== null && isset($data['assignments'][$index])) {
                        $assignment = $data['assignments'][$index];
                        $dateOpen = $assignment['date_open'] ?? null;
                        $dateClose = $assignment['date_close'] ?? null;
                        $timeOpen = $assignment['time_open'] ?? null;

                        if ($dateOpen && $dateClose && $timeOpen) {
                            if ($dateOpen === $dateClose) {
                                if (strtotime($value) <= strtotime($timeOpen)) {
                                    $fail('Waktu ditutup harus setelah waktu dibuka pada hari yang sama.');
                                }
                            }
                        }
                    }
                }
            ],
            'assignments.*.file_link' => ['nullable', 'url'],
        ];

        if ($isUpdate && $meetingId) {
            $rules['title'][] = 'unique:meetings,title,' . $meetingId;
        } else {
            $rules['title'][] = 'unique:meetings,title';
        }

        return Validator::make(
            $data,
            $rules,
            [
                'class_id.required' => 'ID kelas wajib diisi.',
                'class_id.string' => 'ID kelas harus berupa teks.',
                'class_id.exists' => 'Kelas tidak ditemukan.',
                'title.required' => 'Judul pertemuan wajib diisi.',
                'title.string' => 'Judul pertemuan harus berupa teks.',
                'title.max' => 'Judul pertemuan maksimal 255 karakter.',
                'title.unique' => 'Judul pertemuan sudah digunakan.',
                'description.required' => 'Deskripsi pertemuan wajib diisi.',
                'description.string' => 'Deskripsi pertemuan harus berupa teks.',
                'materials.*.link.url' => 'Link berkas harus berupa URL yang valid.',
                'assignments.*.title.required' => 'Judul tugas wajib diisi.',
                'assignments.*.title.string' => 'Judul tugas harus berupa teks.',
                'assignments.*.title.max' => 'Judul tugas maksimal 255 karakter.',
                'assignments.*.description.required' => 'Deskripsi tugas wajib diisi.',
                'assignments.*.description.string' => 'Deskripsi tugas harus berupa teks.',
                'assignments.*.date_open.required' => 'Tanggal dibuka wajib diisi.',
                'assignments.*.date_open.date' => 'Tanggal dibuka harus berupa tanggal yang valid.',
                'assignments.*.date_open.after_or_equal' => 'Tanggal dibuka tidak boleh sebelum hari ini.',
                'assignments.*.date_open.before_or_equal' => 'Tanggal dibuka tidak boleh setelah tanggal ditutup.',
                'assignments.*.time_open.required' => 'Waktu dibuka wajib diisi.',
                'assignments.*.time_open.date_format' => 'Waktu dibuka harus dalam format HH:mm.',
                'assignments.*.date_close.required' => 'Tanggal ditutup wajib diisi.',
                'assignments.*.date_close.date' => 'Tanggal ditutup harus berupa tanggal yang valid.',
                'assignments.*.date_close.after_or_equal' => 'Tanggal ditutup harus sama atau setelah tanggal dibuka.',
                'assignments.*.time_close.required' => 'Waktu ditutup wajib diisi.',
                'assignments.*.time_close.after' => 'Waktu ditutup harus setelah waktu dibuka.',
                'assignments.*.file_link.url' => 'Link file pendukung harus berupa URL yang valid.',
            ]
        );
    }

    public static function announcement($data, $isUpdate = false, $announcementId = null)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'thumbnail' => $isUpdate ? 'nullable|image|mimes:jpeg,png,jpg|max:2048' : 'required|image|mimes:jpeg,png,jpg|max:2048',
        ];

        return Validator::make(
            $data,
            $rules,
            [
                'title.required' => 'Judul pengumuman wajib diisi.',
                'title.string' => 'Judul pengumuman harus berupa teks.',
                'title.max' => 'Judul pengumuman maksimal 255 karakter.',
                'content.required' => 'Konten pengumuman wajib diisi.',
                'content.string' => 'Konten pengumuman harus berupa teks.',
                'content.max' => 'Konten pengumuman maksimal 2000 karakter.',
                'thumbnail.required' => 'Thumbnail harus diisi.',
                'thumbnail.image' => 'Thumbnail harus berupa gambar.',
                'thumbnail.mimes' => 'Thumbnail hanya boleh berformat jpeg, png, atau jpg.',
                'thumbnail.max' => 'Ukuran thumbnail maksimal 2MB.',
            ]
        );
    }
}
