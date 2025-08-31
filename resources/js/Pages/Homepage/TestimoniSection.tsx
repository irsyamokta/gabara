import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import alumni1 from "../../../assets/images/Testimonial-Image.png";
import alumni2 from "../../../assets/images/Testimonial-Image.png";
import alumni3 from "../../../assets/images/Testimonial-Image.png";
import Quotes from "../../../assets/images/Quotation.png";

import Button from "@/Components/ui/button/Button";

type TestimonialType = {
    name: string;
    text: string;
    avatarUrl: string;
};

const TestimonialsSection: React.FC = () => {
    const [index, setIndex] = useState(0);

    const testimonials: TestimonialType[] = [
        {
            name: "Ari Lesmana",
            text: "Waktu SMP saya terpaksa berhenti sekolah karena harus bantu orang tua jualan. Awalnya saya pikir itu akhir dari pendidikan saya, karena nggak mungkin bisa balik sekolah lagi. Tapi sejak kenal Gabara, saya bisa belajar lewat HP di rumah tanpa harus meninggalkan tanggung jawab. Sekarang saya kembali punya harapan untuk lulus Paket C dan melanjutkan cita-cita.",
            avatarUrl: alumni1,
        },
        {
            name: "Budi Santoso",
            text: "Materinya mudah dipahami dan sangat membantu saya dalam belajar mandiri.",
            avatarUrl: alumni2,
        },
        {
            name: "Ani Lestari",
            text: "Mentor Gabara sangat ramah dan selalu mendukung saya dalam belajar.",
            avatarUrl: alumni3,
        },
    ];

    const handlePrev = () => {
        setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    return (
        <section id="testimonials" className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-sky-600 mb-3">
                    Cerita dari Mereka
                </h3>
                <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
                    Di balik setiap perjalanan, selalu ada mimpi yang belum
                    selesai. Lewat Gabara, banyak yang berani melanjutkan
                    langkah dan menemukan jalan baru untuk belajar kembali.
                </p>

                {/* Konten Testimonial */}
                <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center lg:items-center gap-8">
                    {/* Foto */}
                    <div className="flex-shrink-0 lg:w-1/3">
                        <img
                            src={testimonials[index].avatarUrl}
                            alt={testimonials[index].name}
                            className="w-full object-cover"
                        />
                    </div>

                    {/* Teks + Button */}
                    <div className="lg:w-2/3 relative text-left">
                        <img
                            src={Quotes}
                            alt="Quotes"
                            className="w-10 h-10 mb-4 opacity-60"
                        />
                        <p className="text-base md:text-lg leading-relaxed text-slate-700">
                            {testimonials[index].text}
                        </p>
                        <h4 className="text-sky-600 text-lg md:text-xl font-semibold mt-6">
                            {testimonials[index].name}
                        </h4>

                        {/* Navigasi tombol */}
                        <div className="mt-6 flex gap-4 justify-center lg:justify-end">
                            <Button
                                variant="circle-outline"
                                size="circle-lg"
                                onClick={handlePrev}
                                aria-label="Sebelumnya"
                            >
                                <ArrowLeft
                                    strokeWidth={3}
                                    className="w-6 h-6"
                                />
                            </Button>

                            <Button
                                variant="outline"
                                size="circle-lg"
                                onClick={handleNext}
                                aria-label="Berikutnya"
                            >
                                <ArrowRight
                                    strokeWidth={3}
                                    className="w-6 h-6"
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
