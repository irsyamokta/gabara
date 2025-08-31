import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import Logo from "../../../assets/images/Gabara.png";

import Footer1 from "../../../assets/images/Footer-Image1.png";
import Footer2 from "../../../assets/images/Footer-Image2.png";
import Footer3 from "../../../assets/images/Footer-Image3.png";
import Footer4 from "../../../assets/images/Footer-Image4.png";

import igIcon from "../../../assets/images/igIcon.png";
import waIcon from "../../../assets/images/waIcon.png";
import emailIcon from "../../../assets/images/emailIcon.png";

const Footer: React.FC = () => {
    const galleryImages = [Footer1, Footer2, Footer3, Footer4];

    return (
        <footer className="relative z-10 bg-black text-white py-20">
            <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Kolom 1: Logo & Alamat */}
                <Card className="bg-transparent border-0 shadow-none text-white p-0">
                    <CardHeader className="p-0 mb-4">
                        <img src={Logo} alt="Gabara Logo" className="w-24" />
                    </CardHeader>
                    <CardContent className="p-0 text-sm text-slate-300 leading-relaxed">
                        Adipasir II, Adipasir, Kec. Rakit, Kab. Banjarnegara,
                        Jawa Tengah 53463, Indonesia
                    </CardContent>
                </Card>

                {/* Kolom 2: Navigasi */}
                <Card className="bg-transparent border-0 shadow-none text-white p-0">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-base font-semibold">
                            Navigasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col space-y-3">
                        <a
                            href="#hero"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Beranda
                        </a>
                        <a
                            href="#features"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Layanan
                        </a>
                        <a
                            href="#testimonials"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Testimoni
                        </a>
                        <a
                            href="#mitra"
                            className="text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            Mitra
                        </a>
                    </CardContent>
                </Card>

                {/* Kolom 3: Kontak */}
                <Card className="bg-transparent border-0 shadow-none text-white p-0">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg">Kontak</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm text-slate-300 space-y-2">
                        <a
                            href="https://wa.me/6282255108336"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                            <img
                                src={waIcon}
                                alt="WhatsApp"
                                className="w-4 h-4"
                            />{" "}
                            0822 5510 8336
                        </a>
                        <a
                            href="mailto:garasibelajar.id@gmail.com"
                            className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                            <img
                                src={emailIcon}
                                alt="Email"
                                className="w-4 h-4"
                            />{" "}
                            garasibelajar.id@gmail.com
                        </a>
                        <div className="flex gap-4 mt-3">
                            <a
                                href="https://www.instagram.com/gabara_education?igsh=MTl5c3lpeTdzNXp5dg=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
                            >
                                <img
                                    src={igIcon}
                                    alt="Instagram"
                                    className="w-4 h-4"
                                />{" "}
                                Gabara_Education
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Kolom 4: Galeri */}
                <Card className="bg-transparent border-0 shadow-none text-white p-0">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-base font-semibold">
                            Galeri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-0 overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-1">
                            {galleryImages.map((img, i) => (
                                <div
                                    key={i}
                                    className="w-full aspect-[4/3] border border-slate-500 rounded-md overflow-hidden"
                                >
                                    <img
                                        src={img}
                                        alt={`Footer ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Separator */}
            <div className="max-w-7xl mx-auto px-6">
                <Separator className="my-10 bg-white" />
            </div>

            {/* Copyright */}
            <div className="max-w-3xl mx-auto px-6 text-center text-sm text-slate-400">
                © {new Date().getFullYear()} Gabara. Hak Cipta Dilindungi oleh
                Telkom University Purwokerto.
            </div>
        </footer>
    );
};

export default Footer;
