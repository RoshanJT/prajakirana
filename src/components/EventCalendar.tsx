"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, ChevronRight, Gift, Heart, Calendar as CalendarIcon } from "lucide-react";

type EventType = "birthday" | "anniversary" | "memorial";

interface CalendarEvent {
    id: string;
    donorId: string;
    donorName: string;
    date: Date;
    type: EventType;
    description: string;
}

interface MemorialDate {
    tag: string;
    date: string;
}

export default function EventCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const { data: donors, error } = await supabase
                    .from("donors")
                    .select("id, name, birth_date, anniversary_date, memorial_dates");

                if (error) throw error;

                const processedEvents: CalendarEvent[] = [];
                const currentYear = new Date().getFullYear();

                donors?.forEach((donor) => {
                    // Birthday
                    if (donor.birth_date) {
                        const birthDate = new Date(donor.birth_date);
                        processedEvents.push({
                            id: `b-${donor.id}`,
                            donorId: donor.id,
                            donorName: donor.name,
                            date: new Date(currentYear, birthDate.getMonth(), birthDate.getDate()),
                            type: "birthday",
                            description: `${donor.name}'s Birthday`,
                        });
                    }

                    // Anniversary
                    if (donor.anniversary_date) {
                        const annivDate = new Date(donor.anniversary_date);
                        processedEvents.push({
                            id: `a-${donor.id}`,
                            donorId: donor.id,
                            donorName: donor.name,
                            date: new Date(currentYear, annivDate.getMonth(), annivDate.getDate()),
                            type: "anniversary",
                            description: `${donor.name}'s Anniversary`,
                        });
                    }

                    // Memorial Dates
                    if (donor.memorial_dates && Array.isArray(donor.memorial_dates)) {
                        donor.memorial_dates.forEach((memorial: MemorialDate, index: number) => {
                            if (memorial.date) {
                                const memDate = new Date(memorial.date);
                                processedEvents.push({
                                    id: `m-${donor.id}-${index}`,
                                    donorId: donor.id,
                                    donorName: donor.name,
                                    date: new Date(currentYear, memDate.getMonth(), memDate.getDate()),
                                    type: "memorial",
                                    description: `${memorial.tag || "Memorial"} for ${donor.name}`,
                                });
                            }
                        });
                    }
                });

                setEvents(processedEvents);
            } catch (error) {
                console.error("Error fetching calendar events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [supabase]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return (
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear()
        );
    };

    const getEventsForDate = (date: Date) => {
        return events.filter((e) => isSameDay(e.date, date));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const selectedDayEvents = getEventsForDate(selectedDate);

    if (loading) {
        return <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading calendar...</div>;
    }

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color-card)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                <h2 className="text-lg font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={20} style={{ color: 'var(--primary)' }} />
                    Event Calendar
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontWeight: 500, minWidth: '100px', textAlign: 'center' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} style={{ padding: '0.25rem', borderRadius: '4px', cursor: 'pointer' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
                {days.map((day) => (
                    <div key={day} className="text-xs text-muted" style={{ fontWeight: 500, padding: '4px 0' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', flex: 1 }}>
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = getEventsForDate(currentDayDate);
                    const hasEvents = dayEvents.length > 0;
                    const isSelected = isSameDay(currentDayDate, selectedDate);
                    const isToday = isSameDay(currentDayDate, new Date());

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(currentDayDate)}
                            style={{
                                height: '2rem',
                                width: '2rem',
                                margin: '0 auto',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                position: 'relative',
                                transition: 'all 0.2s',
                                backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                                color: isSelected ? '#fff' : 'inherit',
                                border: isToday && !isSelected ? '1px solid var(--primary)' : 'none',
                                fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                        >
                            {day}
                            {hasEvents && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    width: '4px',
                                    height: '4px',
                                    backgroundColor: isSelected ? '#fff' : 'var(--danger)',
                                    borderRadius: '50%'
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color-card)', paddingTop: '1rem' }}>
                <h3 className="font-semibold text-sm" style={{ marginBottom: '0.75rem' }}>
                    {isSameDay(selectedDate, new Date()) ? "Today's Events" : `Events on ${selectedDate.toLocaleDateString()}`}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map((event) => (
                            <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                <div style={{
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: event.type === 'birthday' ? '#fce7f3' : event.type === 'anniversary' ? '#f3e8ff' : '#dbeafe',
                                    color: event.type === 'birthday' ? '#db2777' : event.type === 'anniversary' ? '#9333ea' : '#2563eb'
                                }}>
                                    {event.type === 'birthday' ? <Gift size={16} /> :
                                        event.type === 'anniversary' ? <Heart size={16} /> :
                                            <CalendarIcon size={16} />}
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ margin: 0 }}>{event.description}</p>
                                    <p className="text-xs text-muted" style={{ margin: 0 }}>{event.date.toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No events for this day</p>
                    )}
                </div>
            </div>
        </div>
    );
}
