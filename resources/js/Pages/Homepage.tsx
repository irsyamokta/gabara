import AppLayout from "@/Layouts/AppLayout";
import Hero from "@/Pages/Homepage/HeroSection";
import FeatureCard from "@/Pages/Homepage/ServiceSection";
import PKBMCard from "@/Pages/Homepage/MitraSection";
import FAQ from "@/Pages/Homepage/FaqSection";
import TestimonialsSection from "@/Pages/Homepage/TestimoniSection";
import Footer from "@/Pages/Homepage/Footer";
import CTA from "@/Pages/Homepage/ClosingCTA";
import { Head } from "@inertiajs/react";

export default function Home() {
    return (
        <>
            <AppLayout>
                <Head title="Gabara - Belajar Tanpa Batas" />
                <Hero />
                <FeatureCard />
                <TestimonialsSection />
                <PKBMCard />
                <FAQ />
                <CTA />
                <Footer />
            </AppLayout>
        </>
    );
}
