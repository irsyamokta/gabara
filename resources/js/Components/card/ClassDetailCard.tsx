import { useState } from "react";
import { usePage } from "@inertiajs/react";

import ImageFallback from "@/Components/ui/images/ImageFallback";
import Badge from "@/Components/ui/badge/Badge";
import CourseTab from "@/Components/tab/CourseTab";
import ParticipantsTab from "@/Components/tab/ParticipantsTab";
import DiscussionTab from "@/Components/tab/DiscussionTab";
import GradesTab from "@/Components/tab/GradesTab";
import PageBreadcrumb from "@/Components/ui/breadcrumb/Breadcrumb";
import { ClassDetailPageProps } from "@/types/types";

const RoleBadge = ({ role }: { role?: string }) => {
    if (role === "admin") {
        return <Badge color="error" size="sm" className="ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold">Admin</Badge>;
    }
    if (role === "mentor") {
        return <Badge color="info" size="sm" className="ml-2 uppercase text-[10px] px-1.5 py-0 rounded font-bold">Mentor</Badge>;
    }
    return null;
};

export default function ClassDetailCard() {
    const { props } = usePage<ClassDetailPageProps>();
    const { class: classData, userRole } = props;

    const [activeTab, setActiveTab] = useState("Kursus");

    const tabs = ["Kursus", "Peserta", "Diskusi", "Nilai"];

    return (
        <div className="container mx-auto">
            <PageBreadcrumb crumbs={[
                { label: "Home", href: "/dashboard" },
                { label: "Kelasku", href: "/classes" },
                { label: classData.name },
            ]} />

            {/* Thumbnail with Overlay */}
            <div className="relative mb-6">
                <ImageFallback
                    src={classData.thumbnail}
                    alt={classData.name}
                    className="w-full h-60 object-cover rounded-lg"
                    fallbackClassName="w-full h-60 object-cover bg-gray-200"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-lg" />
                {/* Overlay for Class Name, Mentor Avatar, and Mentor Name */}
                <div className="absolute bottom-4 left-4 flex flex-col items-start space-y-2 md:flex-row md:items-center md:space-x-4">
                    <img
                        src={
                            classData.mentor?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(classData.mentor?.name)}`
                        }
                        alt={classData.mentor?.name}
                        className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div className="flex flex-col">
                        <div className="flex flex-col items-start md:flex-row md:items-center gap-2">
                            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-white drop-shadow-md">{classData.name}</h1>
                            <Badge color="warning">{classData.academic_year_tag}</Badge>
                        </div>
                        <div className="flex items-center mt-1">
                            <p className="text-sm md:text-base text-white drop-shadow-md">{classData.mentor?.name}</p>
                            <RoleBadge role={classData.mentor?.role} />
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent rounded-b-lg" />
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 2xsm:space-x-4 xsm:space-x-6 md:space-x-4 border-b mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-sm xsm:text-base pb-2 px-4 ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-gray-500"}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "Kursus" && <CourseTab classData={classData} />}
                {activeTab === "Peserta" && <ParticipantsTab classData={classData} />}
                {activeTab === "Diskusi" && <DiscussionTab classData={classData} />}
                {activeTab === "Nilai" && <GradesTab />}
            </div>
        </div>
    );
}
