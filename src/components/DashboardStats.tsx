"use client";

"use client";

import { ArrowUpRight, IndianRupee, Users, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import StatDetailModal from "./StatDetailModal";

export default function DashboardStats() {
    const supabase = createClient();

    interface StatItem {
        title: string;
        value: string;
        change: string;
        trend: "up" | "down";
        icon: React.ElementType;
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
            const now = new Date();
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            // endOfPreviousMonth unused

            // 1. Total Donations Logic
            // Fetch Current Month Donations
            const { data: currentMonthDonations } = await supabase
                .from('donations')
                .select('amount')
                .gte('date', startOfCurrentMonth);

            // Fetch Previous Month Donations
            const { data: prevMonthDonations } = await supabase
                .from('donations')
                .select('amount')
                .gte('date', startOfPreviousMonth)
                .lt('date', startOfCurrentMonth);

            // Fetch All Time Total (for display value)
            const { data: allDonations } = await supabase
                .from('donations')
                .select('amount');

            const currentMonthTotal = currentMonthDonations?.reduce((sum, d: { amount: number }) => sum + (d.amount || 0), 0) || 0;
            const prevMonthTotal = prevMonthDonations?.reduce((sum, d: { amount: number }) => sum + (d.amount || 0), 0) || 0;
            const allTimeTotal = allDonations?.reduce((sum, d: { amount: number }) => sum + (d.amount || 0), 0) || 0;

            // Calculate Donation Percentage Change
            let donationChange = 0;
            if (prevMonthTotal > 0) {
                donationChange = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
            } else if (currentMonthTotal > 0) {
                donationChange = 100; // 0 to something is 100% growth effectively (or infinite)
            }

            // 2. Active Donors Logic (New Donors Growth for this month)
            const { count: currentMonthDonors } = await supabase
                .from('donors')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfCurrentMonth);

            const { count: prevMonthDonors } = await supabase
                .from('donors')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfPreviousMonth)
                .lt('created_at', startOfCurrentMonth);

            const { count: totalDonors } = await supabase
                .from('donors')
                .select('*', { count: 'exact', head: true });

            let donorChange = 0;
            const curDonors = currentMonthDonors || 0;
            const preDonors = prevMonthDonors || 0;

            if (preDonors > 0) {
                donorChange = ((curDonors - preDonors) / preDonors) * 100;
            } else if (curDonors > 0) {
                donorChange = 100;
            }

            // 3. Campaign Reach (Total Campaigns)
            const { count: campaignCount } = await supabase
                .from('campaigns')
                .select('*', { count: 'exact', head: true });

            const { count: currentMonthCampaigns } = await supabase
                .from('campaigns')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfCurrentMonth);

            const { count: prevMonthCampaigns } = await supabase
                .from('campaigns')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfPreviousMonth)
                .lt('created_at', startOfCurrentMonth);

            let campaignChange = 0;
            const curCampaigns = currentMonthCampaigns || 0;
            const preCampaigns = prevMonthCampaigns || 0;

            if (preCampaigns > 0) {
                campaignChange = ((curCampaigns - preCampaigns) / preCampaigns) * 100;
            } else if (curCampaigns > 0) {
                campaignChange = 100;
            }


            setStats((prev: StatItem[]) => [
                {
                    ...prev[0],
                    value: `₹${allTimeTotal.toLocaleString()}`,
                    change: `${donationChange >= 0 ? '+' : ''}${donationChange.toFixed(1)}%`,
                    trend: donationChange >= 0 ? "up" : "down"
                },
                {
                    ...prev[1],
                    value: (totalDonors || 0).toLocaleString(),
                    change: `${donorChange >= 0 ? '+' : ''}${donorChange.toFixed(1)}%`,
                    trend: donorChange >= 0 ? "up" : "down"
                },
                {
                    ...prev[2],
                    value: (campaignCount || 0).toLocaleString(),
                    change: `${campaignChange >= 0 ? '+' : ''}${campaignChange.toFixed(1)}%`,
                    trend: campaignChange >= 0 ? "up" : "down"
                }
            ]);
        };

        fetchStats();
    }, [supabase]);

    const [selectedStat, setSelectedStat] = useState<'donations' | 'donors' | 'campaigns' | null>(null);

    // ... (keep useEffect and fetching logic same) ...

    return (
        <>
            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isClickable = stat.title === "Total Donations" || stat.title === "Active Donors" || stat.title === "Campaign Reach";

                    return (
                        <div
                            key={index}
                            className="card"
                            style={{
                                cursor: isClickable ? 'pointer' : 'default',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onClick={() => {
                                if (stat.title === "Total Donations") setSelectedStat('donations');
                                if (stat.title === "Active Donors") setSelectedStat('donors');
                                if (stat.title === "Campaign Reach") setSelectedStat('campaigns');
                            }}
                            onMouseEnter={(e) => {
                                if (isClickable) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (isClickable) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; // Assuming default card shadow
                                }
                            }}
                        >
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
                                    className="text-[10px] font-bold rounded-full border"
                                    style={{
                                        padding: '2px 8px',
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
                            {isClickable && (
                                <div className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                                    View Insights <ArrowUpRight size={12} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedStat && (
                <StatDetailModal
                    type={selectedStat}
                    onClose={() => setSelectedStat(null)}
                />
            )}
        </>
    );
}
