import React from "react";
import faqImage from "../../../assets/images/faq-image.png";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";

type QA = { question: string; answer: string };

const defaultFaqs: QA[] = [
    {
        question: "Apa itu Gabara?",
        answer: "Gabara (Garasi Belajar Banjarnegara) adalah wadah belajar non-formal yang hadir untuk membantu anak-anak, remaja, maupun orang dewasa yang sempat putus sekolah agar tetap bisa melanjutkan pendidikan dan meraih masa depan lebih baik.",
    },
    {
        question: "Siapa saja yang bisa ikut belajar?",
        answer: "Semua masyarakat Banjarnegara yang putus sekolah, baik tingkat SD, SMP, maupun SMA, dapat bergabung di Gabara tanpa batasan usia tertentu.",
    },
    {
        question: "Apakah belajar di Gabara berbayar?",
        answer: "Tidak. Gabara merupakan inisiatif sosial yang memberikan fasilitas belajar secara gratis agar pendidikan bisa diakses oleh semua kalangan.",
    },
    {
        question: "Apa saja program yang ada di Gabara?",
        answer: `Program Gabara meliputi:
- Bimbingan belajar untuk mata pelajaran dasar
- Kelas persiapan Paket A, B, dan C (setara SD, SMP, SMA)
- Kegiatan pengembangan diri seperti literasi, diskusi, dan keterampilan hidup
- Kelas motivasi untuk membangun semangat belajar`,
    },
    {
        question: "Apakah Gabara hanya untuk anak-anak?",
        answer: "Tidak. Gabara terbuka untuk semua usia yang ingin melanjutkan pendidikan.",
    },
];

const FAQ: React.FC<{ faqs?: QA[] }> = ({ faqs = defaultFaqs }) => {
    return (
        <section id="faq" className="w-full bg-white py-20">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-start gap-8">
                {/* Kolom kiri: gambar */}
                <div className="flex-shrink-0">
                    <img
                        src={faqImage}
                        alt="FAQ Illustration"
                        className="w-full max-w-sm md:max-w-sm lg:max-w-md object-cover rounded-xl shadow-md"
                    />
                </div>

                {/* Kolom kanan: teks FAQ */}
                <div className="flex flex-col w-full items-start">
                    <h3 className="text-3xl font-bold mb-2 text-left">
                        Frequently Asked Questions
                    </h3>
                    <p className="text-slate-600 mb-6 text-left">
                        Pertanyaan yang mungkin ditanyakan tentang layanan kami
                    </p>

                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((item, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`}>
                                <AccordionTrigger className="text-left font-bold text-slate-800">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
