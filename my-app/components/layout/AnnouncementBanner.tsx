'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { HiX, HiSpeakerphone, HiExclamation, HiCheckCircle, HiInformationCircle } from 'react-icons/hi'; // Ensure you have react-icons installed

interface Announcement {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    isActive: boolean;
}

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const pathname = usePathname();
    const [closedIds, setClosedIds] = useState<string[]>([]);

    useEffect(() => {
        // Don't show on admin pages
        if (pathname?.startsWith('/admin')) return;

        const fetchAnnouncements = async () => {
            try {
                const response = await api.getAnnouncements() as { success: boolean; data: Announcement[] };
                if (response.success) {
                    setAnnouncements(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        };

        fetchAnnouncements();
    }, [pathname]);

    const handleClose = (id: string) => {
        setClosedIds((prev) => [...prev, id]);
    };

    const visibleAnnouncements = announcements.filter(
        (a) => !closedIds.includes(a._id)
    );

    if (visibleAnnouncements.length === 0) return null;

    return (
        <div className="flex flex-col w-full z-50">
            {visibleAnnouncements.map((announcement) => (
                <div
                    key={announcement._id}
                    className={`${announcement.type === 'error'
                        ? 'bg-red-600 text-white'
                        : announcement.type === 'warning'
                            ? 'bg-yellow-500 text-white'
                            : announcement.type === 'success'
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 text-white'
                        } px-4 py-3 shadow-md relative`}
                >
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {announcement.type === 'error' ? (
                                <HiExclamation className="w-5 h-5 flex-shrink-0" />
                            ) : announcement.type === 'warning' ? (
                                <HiExclamation className="w-5 h-5 flex-shrink-0" />
                            ) : announcement.type === 'success' ? (
                                <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <HiInformationCircle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <div>
                                <span className="font-bold mr-2">{announcement.title}:</span>
                                <span>{announcement.message}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleClose(announcement._id)}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label="Close announcement"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
