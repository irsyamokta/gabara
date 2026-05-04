import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";

import Calendar from "@/Components/ui/calendar/Calendar";
import StatCard from "@/Components/card/StatCard";
import EmptyState from "@/Components/empty/EmptyState";

import { createMarkup } from "@/utils/htmlMarkup";
import { formatDateTime } from "@/utils/formatDate";

import { PageProps, Deadline, Announcement } from "@/types/types";

import { PiUsersThreeBold, PiBookOpenBold, PiChalkboardTeacherBold } from "react-icons/pi";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";

export default function DashboardCard() {
    const { props } = usePage<PageProps>();
    const {
        auth,
        announcements = [],
        calendarEvents = [],
        numClasses = 0,
        deadlines = [],
        progress = 0,
        ongoingTasks = 0,
        numStudents = 0,
        reminders = [],
        numMentors = 0,
    } = props;

    const userRole = auth.user.role;

    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const transformedEvents = calendarEvents.map(event => {
            try {
                return {
                    id: event.id,
                    title: event.title,
                    start: new Date(event.start),
                    end: event.end ? new Date(event.end) : undefined,
                    type: event.type,
                    extendedProps: { calendar: event.type === "assignment" ? "Danger" : "Success" }, // Map type to calendar color
                };
            } catch (error) {
                return null;
            }
        }).filter(event => event !== null) as any[];
        setEvents(transformedEvents);
    }, [calendarEvents]);

    const renderDeadlines = (items: Deadline[], title: string) => (
        <div className="p-3">
            <h2 className="text-md font-semibold mb-3">{title}</h2>
            {items.length === 0 ? (
                <p className="text-gray-500 text-sm">Tidak ada deadline mendatang.</p>
            ) : (
                <ul className="space-y-1">
                    {items.map((item) => (
                        <li key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                {item.type === 'quiz' ? (
                                    <FaClipboardList className="text-blue-500 size-4" />
                                ) : (
                                    <MdOutlineAssignmentTurnedIn className="text-green-500 size-4" />
                                )}
                                <span>{item.title}</span>
                            </div>
                            <span className="text-gray-500">{formatDateTime(item.deadline)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const renderAnnouncementsList = () => (
        <div className="p-3">
            <h2 className="text-md font-semibold mb-3">Pengumuman</h2>
            {announcements.length === 0 ? (
                <EmptyState
                    title="Tidak ada pengumuman"
                    description="Belum ada pengumuman yang tersedia."
                />
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="flex flex-col gap-2 border-b border-gray-200 pb-2 last:border-b-0">
                            <p className="text-xs text-gray-600">
                                {new Date(announcement.posted_at).toLocaleDateString('id-ID')}, {new Date(announcement.posted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <h3 className="text-sm font-medium text-red-600 hover:underline">
                                <Link href={route('announcements.show', announcement.id)}>
                                    {announcement.title}
                                </Link>
                            </h3>
                            <p className="text-xs text-gray-800">{announcement.admin.name}</p>
                            <div className="text-xs line-clamp-2"
                                dangerouslySetInnerHTML={createMarkup(announcement.content)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div>
                {userRole === "student" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                        <div className="grid col-span-4 md:col-span-4 md:grid-cols-2 lg:grid-cols-1 lg:col-span-1 gap-3">
                            <StatCard
                                icon={<PiBookOpenBold className="text-white size-6" />}
                                title="Jumlah Kelas Diikuti"
                                value={numClasses}
                            />
                            <StatCard
                                icon={<MdOutlineAssignmentTurnedIn className="text-white size-6" />}
                                title="Tugas Berjalan"
                                value={ongoingTasks}
                            />
                        </div>

                        {/* Announcement section */}
                        <div className="col-span-4 grid grid-cols-1 gap-3 border rounded-xl">
                            <div className="h-[440px] overflow-y-auto overflow-x-hidden no-scrollbar">
                                {renderAnnouncementsList()}
                            </div>
                        </div>
                    </div>
                )}
                {userRole === "mentor" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                        <div className="grid col-span-4 md:col-span-4 md:grid-cols-2 lg:grid-cols-1 lg:col-span-1 gap-3">
                            <StatCard
                                icon={<PiBookOpenBold className="text-white size-6" />}
                                title="Jumlah Kelas Dibuat"
                                value={numClasses}
                            />
                            <StatCard
                                icon={<PiUsersThreeBold className="text-white size-6" />}
                                title="Jumlah Siswa"
                                value={numStudents}
                            />
                        </div>

                        {/* Announcement section */}
                        <div className="col-span-4 grid grid-cols-1 gap-3 border rounded-xl">
                            <div className="h-[440px] overflow-y-auto overflow-x-hidden no-scrollbar">
                                {renderAnnouncementsList()}
                            </div>
                        </div>
                    </div>
                )}
                {userRole === "admin" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <StatCard
                            icon={<PiUsersThreeBold className="text-white size-6" />}
                            title="Jumlah Siswa"
                            value={numStudents}
                        />
                        <StatCard
                            icon={<PiChalkboardTeacherBold className="text-white size-6" />}
                            title="Jumlah Mentor"
                            value={numMentors}
                        />
                        <StatCard
                            icon={<PiBookOpenBold className="text-white size-6" />}
                            title="Jumlah Kelas"
                            value={numClasses}
                        />
                    </div>
                )}
            </div>

            <div>
                {/* Deadlines / Reminders */}
                {(userRole === "student") && (
                    <div className="col-span-2 grid grid-cols-1 gap-3 md:gap-4 border rounded-xl">
                        <div className="h-auto overflow-y-auto overflow-x-hidden no-scrollbar">
                            {renderDeadlines(deadlines, "Daftar Deadline Tugas/Quiz")}
                        </div>
                    </div>
                )}
            </div>

            {/* Announcement section */}
            {userRole === "admin" && (
                <div className="grid grid-cols-1 gap-3 border rounded-xl">
                    <div className="h-[440px] overflow-y-auto overflow-x-hidden no-scrollbar">
                        {renderAnnouncementsList()}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1">
                <div className="rounded-xl border p-4">
                    <h2 className="text-lg font-bold mb-4 text-gray-800">Kalender</h2>
                    <Calendar events={events} />
                </div>
            </div>
        </div>
    );
}
