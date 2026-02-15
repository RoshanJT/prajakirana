"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Activity, UserPlus, DollarSign } from "lucide-react";
import ActivityLogModal from "./ActivityLogModal";

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

export default function RecentActivity() {
    const supabase = createClient();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Fetch recent donations
                const { data: donations } = await supabase
                    .from("donations")
                    .select("id, amount, date, donors(name)")
                    .order("date", { ascending: false })
                    .limit(5);

                // Fetch recent donors
                const { data: newDonors } = await supabase
                    .from("donors")
                    .select("id, name, created_at")
                    .order("created_at", { ascending: false })
                    .limit(5);

                // Cast to unknown first to avoid deep type/compatibility issues with Supabase auto-types
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
                    .slice(0, 5); // Show top 5 mixed activities

                setActivities(combined);
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [supabase]);

    if (loading) {
        return (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
                Loading activity...
            </div>
        );
    }

    return (
        <>
            <div
                className="card"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '300px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => setShowModal(true)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="text-lg font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} style={{ color: 'var(--primary)' }} />
                        Recent Activity
                    </h3>
                    <span className="text-xs text-muted" style={{ fontWeight: 500 }}>View All</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
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
                                            {activity.date.toLocaleDateString()}
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
                        ))
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No recent activity
                        </div>
                    )}
                </div>
            </div>

            {showModal && <ActivityLogModal onClose={() => setShowModal(false)} />}
        </>
    );
}
