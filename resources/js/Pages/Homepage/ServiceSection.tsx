import React from "react";
import flexibleIcon from "../../../assets/images/Flexible.png";
import directedIcon from "../../../assets/images/Directed.png";
import packetcIcon from "../../../assets/images/PacketC.png";
import community from "../../../assets/images/Community.png";

import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";

type Props = {
    name: string;
    text: string;
    imageSrc: string;
};

function FeatureItem({ name, text, imageSrc }: Props) {
    return (
        <Card className="shadow-md rounded-2xl border border-slate-200 hover:shadow-lg transition">
            <CardHeader className="flex flex-col items-center">
                <img src={imageSrc} alt={name} className="w-16 h-16 mb-4" />
                <CardTitle className="text-lg font-semibold text-slate-800">
                    {name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 text-sm text-center leading-relaxed">
                    {text}
                </p>
            </CardContent>
        </Card>
    );
}

export default function FeatureCard() {
    const features = [
        {
            name: "Kelas Fleksibel",
            text: "Belajar online atau tatap muka sesuai kebutuhan.",
            imageSrc: flexibleIcon,
        },
        {
            name: "Bimbingan Terarah",
            text: "Materi sesuai kurikulum ujian paket dengan tutor yang siap mendampingi.",
            imageSrc: directedIcon,
        },
        {
            name: "Persiapan Ujian",
            text: "Latihan soal & simulasi supaya lebih siap menghadapi ujian.",
            imageSrc: packetcIcon,
        },
        {
            name: "Komunitas Belajar",
            text: "Ruang untuk saling dukung antar siswa dan tutor.",
            imageSrc: community,
        },
    ];

    return (
        <section
            id="features"
            className="container mx-auto px-8 py-16 text-center"
        >
            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                Kenapa Harus <span className="text-sky-600">Gabara?</span>
            </h2>

            {/* Paragraph */}
            <p className="mt-3 sm:mt-4 text-slate-500 text-base md:text-lg max-w-8xl mx-auto leading-relaxed">
                Banyak anak dan orang tua di Banjarnegara harus berhenti sekolah
                karena biaya, jarak, atau keterbatasan waktu. <br /> Gabara
                hadir dengan cara belajar yang fleksibel dan mudah diakses agar
                semua orang tetap bisa menyelesaikan pendidikannya.
            </p>

            {/* Cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                    <FeatureItem key={i} {...f} />
                ))}
            </div>
        </section>
    );
}
