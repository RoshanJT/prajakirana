"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Activity, UserPlus, DollarSign, X } from "lucide-react";

interface ActivityLogModalProps {
    onClose: () => void;
}

type ActivityItem = {
    id: string;
    type: "donation" | "donor";
    title: string;
    subtitle: string;
    date: Date;
    amount?: number;
};

interface DonationRecord {
    id: string;
    amount: number;
    date: string;
    donors: { name: string } | null;
}

interface DonorRecord {
    id: string;
    name: string;
    created_at: string;
}

export default function ActivityLogModal({ onClose }: ActivityLogModalProps) {
    const supabase = createClient();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Fetch recent donations (limit 50)
                const { data: donations } = await supabase
                    .from("donations")
                    .select("id, amount, date, donors(name)")
                    .order("date", { ascending: false })
                    .limit(50);

                // Fetch recent donors (limit 50)
                const { data: newDonors } = await supabase
                    .from("donors")
                    .select("id, name, created_at")
                    .order("created_at", { ascending: false })
                    .limit(50);

                const donationRecords = (donations as unknown) as DonationRecord[] | null;
                const donorRecords = (newDonors as unknown) as DonorRecord[] | null;

                const donationItems: ActivityItem[] = (donationRecords || []).map((d) => ({
                    id: `don-${d.id}`,
                    type: "donation",
                    title: `New Donation received`,
                    subtitle: `From ${d.donors?.name || "Unknown"}`,
                    amount: d.amount,
                    date: new Date(d.date),
                }));

                const donorItems: ActivityItem[] = (donorRecords || []).map((d) => ({
                    id: `user-${d.id}`,
                    type: "donor",
                    title: "New Donor Registered",
                    subtitle: d.name,
                    date: new Date(d.created_at),
                }));

                // Combine and sort
                const combined = [...donationItems, ...donorItems]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 50); // Show top 50 mixed activities

                setActivities(combined);
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [supabase]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
        }} onClick={onClose}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={24} className="text-primary" />
                    Full Activity Log
                </h2>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Loading activity...
                        </div>
                    ) : activities.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activities.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'start',
                                        paddingBottom: index !== activities.length - 1 ? '1rem' : '0',
                                        borderBottom: index !== activities.length - 1 ? '1px solid var(--border-color-card)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        marginTop: '4px',
                                        padding: '0.5rem',
                                        borderRadius: '50%',
                                        backgroundColor: activity.type === 'donation' ? '#ecfccb' : '#dbeafe',
                                        color: activity.type === 'donation' ? '#65a30d' : '#2563eb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {activity.type === 'donation' ? <DollarSign size={16} /> : <UserPlus size={16} />}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                {activity.title}
                                            </p>
                                            <span className="text-xs text-muted">
                                                {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                                            {activity.subtitle}
                                            {activity.amount && (
                                                <span style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: '0.5rem' }}>
                                                    +₹{activity.amount.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
