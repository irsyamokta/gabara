import React from "react";
import { createMarkup } from "@/utils/htmlMarkup";

interface CourseDescriptionCardProps {
    description: string;
}

const CourseDescriptionCard = ({ description }: CourseDescriptionCardProps) => {
    return (
        <div className="mt-6 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Deskripsi Kelas</h2>
            <div
                className="text-sm text-gray-500 mt-4 prose max-w-none"
                dangerouslySetInnerHTML={createMarkup(description || "")}
            />
        </div>
    );
};

export default CourseDescriptionCard;
