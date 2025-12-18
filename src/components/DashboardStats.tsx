"use client";

"use client";

import { ArrowUpRight, ArrowDownRight, IndianRupee, Users, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function DashboardStats() {
    const supabase = createClient();

    interface StatItem {
        title: string;
        value: string;
        change: string;
        trend: "up" | "down";
        icon: any;
        color: string;
        bg: string;
    }

    const [stats, setStats] = useState<StatItem[]>([
        {
            title: "Total Donations",
            value: "₹0",
            change: "0%",
            trend: "up",
            icon: IndianRupee,
            color: "var(--primary)",
            bg: "var(--primary-light)"
        },
        {
            title: "Active Donors",
            value: "0",
            change: "0%",
            trend: "up",
            icon: Users,
            color: "var(--accent)",
            bg: "var(--accent-light)"
        },
        {
            title: "Campaign Reach",
            value: "0",
            change: "0%",
            trend: "down",
            icon: Activity,
            color: "#8b5cf6", // Violet
            bg: "#f3e8ff"
        },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            // Fetch Total Donations
            const { data: donations } = await supabase
                .from('donations')
                .select('amount');

            const totalAmount = donations?.reduce((sum: number, d: { amount: number }) => sum + (d.amount || 0), 0) || 0;

            // Fetch Active Donors count
            const { count: donorCount } = await supabase
                .from('donors')
                .select('*', { count: 'exact', head: true });

            // Fetch Active Campaigns (using as proxy for reach/activity for now)
            const { count: campaignCount } = await supabase
                .from('campaigns')
                .select('*', { count: 'exact', head: true });

            setStats((prev: StatItem[]) => [
                {
                    ...prev[0],
                    value: `₹${totalAmount.toLocaleString()}`,
                    // Mocking change data for now as we don't have historical data structure yet
                    change: "+0%",
                },
                {
                    ...prev[1],
                    value: (donorCount || 0).toLocaleString(),
                    change: "+0%"
                },
                {
                    ...prev[2],
                    value: (campaignCount || 0).toLocaleString(),
                    change: "0%"
                }
            ]);
        };

        fetchStats();
    }, []);

    return (
        <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="card">
                        <div className="flex justify-between items-start" style={{ marginBottom: '1.25rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: stat.bg,
                                borderRadius: '12px',
                                color: stat.color,
                                boxShadow: `0 4px 6px -1px ${stat.bg}40`
                            }}>
                                <Icon size={22} strokeWidth={2.5} />
                            </div>
                            <span
                                className="text-sm font-bold px-2 py-1 rounded-full border"
                                style={{
                                    borderColor: stat.trend === 'up' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    backgroundColor: stat.trend === 'up' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: stat.trend === 'up' ? '#15803d' : '#b91c1c'
                                }}
                            >
                                {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted text-sm font-bold uppercase tracking-wider">{stat.title}</span>
                            <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>{stat.value}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
