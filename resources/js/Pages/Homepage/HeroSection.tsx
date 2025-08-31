import heroImage from "../../../assets/images/Hero-Image.png";
import Button from "@/Components/ui/button/Button";
import { Link } from "@inertiajs/react";

export default function Hero() {
    return (
        <section className="relative bg-gradient-to-b from-[#3480F8] to-[#07409B] text-white overflow-hidden">
            <div className="pt-28 pb-0">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-10">
                    {/* Left text */}
                    <div className="lg:w-1/2 text-center lg:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                            Kesempatan Baru <br /> untuk Terus Belajar <br />
                            Tanpa Batas
                        </h1>

                        <p className="mt-4 text-sky-100 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Sekolah boleh tertunda, tapi mimpi jangan berhenti.
                            Gabara hadir agar kamu bisa belajar lagi dengan cara
                            yang lebih mudah.
                        </p>

                        <div className="mt-6 flex justify-center lg:justify-start">
                            <Link href={route("register")}>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="px-5 py-2.5 rounded-lg"
                                >
                                    Gabung Sekarang
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className="lg:w-3/5 flex justify-center lg:justify-end mt-8 lg:mt-0">
                        <img
                            src={heroImage}
                            alt="students"
                            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
