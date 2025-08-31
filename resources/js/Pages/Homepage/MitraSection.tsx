// PKBMCard.tsx
import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import Button from "@/Components/ui/button/Button";
import pkbminsan from "../../../assets/images/PKBM-Insan-Mandiri.png";
import pkbmarmada from "../../../assets/images/PKBM-Armada.png";
import pkbmbina from "../../../assets/images/PKBM-Bina-Nusantara.png";

// --- komponen kecil (1 card)
function PKBMItem({
    title,
    address,
    imageUrl,
}: {
    title: string;
    address: string;
    imageUrl: string;
}) {
    return (
        <Card className="rounded-xl shadow-md overflow-hidden text-center">
            <CardHeader className="p-0">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-40 object-contain"
                />
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <p className="text-slate-600 text-sm mt-2">{address}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="primary" className="w-full">
                    Kunjungi
                </Button>
            </CardFooter>
        </Card>
    );
}

// --- komponen utama (section PKBM)
export default function PKBMCard() {
    const pkbm = [
        {
            title: "PKBM Harapan Bangsa",
            address:
                "Banjarkulon, RT. 02 RW. 03, Karang Gondang, Banjarkulon, Kec. Banjarnegara",
            imageUrl: pkbminsan,
        },
        {
            title: "PKBM Armada",
            address:
                "Jl. Serma Mukhlas No. 10B, Kutabanjarnegara, Karangtengah, Kec. Banjarnegara",
            imageUrl: pkbmarmada,
        },
        {
            title: "PKBM Bina Nusantara",
            address:
                "Pucang, RT. 01 RW. I, Gemirit, Pucang, Kec. Bawang Banjarnegara",
            imageUrl: pkbmbina,
        },
    ];

    return (
        <section id="mitra" className="bg-sky-100 py-16">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl font-bold text-center">
                    Dari Persiapan Hingga{" "}
                    <span className="text-blue-500">Ujian Resmi</span>
                </h3>
                <p className="text-center text-slate-500 mt-5 max-w-3xl mx-auto">
                    Setelah belajar dan berlatih di platform, peserta bisa
                    melanjutkan ke lembaga pendidikan non-formal resmi di
                    Banjarnegara dan sekitarnya untuk mengikuti ujian kesetaraan
                    di berbagai jenjang: Paket A (setara SD), Paket B (setara
                    SMP), hingga Paket C (setara SMA).
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pkbm.map((p, idx) => (
                        <div
                            key={idx}
                            className={`
                                ${
                                    idx === pkbm.length - 1
                                        ? "sm:col-span-2 sm:justify-self-center lg:col-span-1 lg:justify-self-auto"
                                        : ""
                                }
                            `}
                        >
                            <PKBMItem {...p} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
