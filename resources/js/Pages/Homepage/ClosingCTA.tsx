import React from "react";
import ctaImage from "../../../assets/images/CTA-Below.png";
import Button from "@/Components/ui/button/Button";
import { Link } from "@inertiajs/react";

export default function CTA() {
    return (
        <section className="relative bg-white text-center pt-8 pb-0 overflow-hidden">
            {/* Teks CTA */}
            <div className="relative z-10 max-w-3xl mx-auto px-6">
                <h3 className="text-3xl font-bold">
                    Siap Belajar{" "}
                    <span className="text-sky-600">Bersama Kami?</span>
                </h3>
                <p className="mt-3 text-slate-600">
                    Mari bergabung dengan Gabara dan temukan kembali semangat
                    belajar tanpa batas. Pendidikan terbuka untuk siapa saja,
                    kapan saja, dan di mana saja.
                </p>
                <div className="mt-6">
                    <Link href={route("register")}>
                        <Button variant="primary">Gabung Sekarang</Button>
                    </Link>
                </div>
            </div>

            {/* Gambar siswa */}
            <div className="relative mt-12 flex justify-center">
                <img
                    src={ctaImage}
                    alt="CTA Illustration"
                    className="w-[480px] sm:w-[600px] md:w-[720px] lg:w-[900px] xl:w-[1400px] object-contain"
                />
            </div>
        </section>
    );
}
