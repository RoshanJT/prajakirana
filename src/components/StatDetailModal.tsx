"use client";

import { useEffect, useState } from "react";
import { X, IndianRupee, PieChart, TrendingUp, Users, Activity, Target } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StatDetailModalProps {
    type: 'donations' | 'donors' | 'campaigns';
    onClose: () => void;
}

interface ChartData {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface DonationRecord {
    amount: number;
    payment_method: string;
    donors: { type: string } | null;
}

interface DonorRecord {
    id: string;
    status: string;
    donations: { id: string }[];
}

interface CampaignRecord {
    id: string;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number; // This will now be calculated
    donations?: { amount: number }[];
}

export default function StatDetailModal({ type, onClose }: StatDetailModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);

    // Metrics State
    const [metrics, setMetrics] = useState({
        total: 0,
        subMetric1: 0, // Average or Active or Raised
        subMetric2: 0, // Max or Retention or Goal
        countLabel: '',
        subMetric1Label: '',
        subMetric2Label: ''
    });

    // Chart Data State
    const [chart1Data, setChart1Data] = useState<ChartData[]>([]);
    const [chart2Data, setChart2Data] = useState<ChartData[]>([]);
    const [chartTitles, setChartTitles] = useState({ title1: '', title2: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            if (type === 'donations') {
                const { data, error } = await supabase
                    .from('donations')
                    .select(`
                        amount,
                        payment_method,
                        donors (
                            type
                        )
                    `);

                if (error) {
                    console.error("Error fetching donation details:", error);
                    setLoading(false);
                    return;
                }

                const donations = (data || []) as unknown as DonationRecord[];

                if (donations.length > 0) {
                    // Metrics
                    const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
                    const count = donations.length;
                    const average = total / count;
                    const max = Math.max(...donations.map(d => Number(d.amount)));

                    setMetrics({
                        total,
                        subMetric1: Math.round(average),
                        subMetric2: max,
                        countLabel: 'total donations',
                        subMetric1Label: 'Average Donation',
                        subMetric2Label: 'Max Donation'
                    });

                    // Chart 1: Payment Method
                    const paymentMethods = donations.reduce((acc: Record<string, number>, d) => {
                        const method = d.payment_method || 'Unknown';
                        const category = method.toLowerCase() === 'in-kind' ? 'In-Kind' : 'Monetary';
                        acc[category] = (acc[category] || 0) + Number(d.amount);
                        return acc;
                    }, {});
                    setChart1Data(Object.keys(paymentMethods).map(key => ({ name: key, value: paymentMethods[key] })));

                    // Chart 2: Donor Type
                    const donorTypes = donations.reduce((acc: Record<string, number>, d) => {
                        const type = d.donors?.type || 'Unknown';
                        acc[type] = (acc[type] || 0) + Number(d.amount);
                        return acc;
                    }, {});
                    setChart2Data(Object.keys(donorTypes).map(key => ({ name: key, value: donorTypes[key] })));

                    setChartTitles({
                        title1: 'Composition (Monetary vs In-Kind)',
                        title2: 'Source (Individual vs Corporate)'
                    });
                }
            } else if (type === 'donors') {
                const { data, error } = await supabase
                    .from('donors')
                    .select(`
                        id,
                        status,
                        donations (
                            id
                        )
                    `);

                if (error) {
                    console.error("Error fetching donor details:", error);
                    setLoading(false);
                    return;
                }

                const donors = (data || []) as unknown as DonorRecord[];

                if (donors.length > 0) {
                    // Metrics
                    const totalCopy = donors.length;
                    const activeCount = donors.filter(d => d.status === 'Active').length;

                    // Retention Logic: Recurring = >1 donation
                    const recurringCount = donors.filter(d => d.donations && d.donations.length > 1).length;
                    const retentionRate = totalCopy > 0 ? (recurringCount / totalCopy) * 100 : 0;

                    setMetrics({
                        total: totalCopy,
                        subMetric1: activeCount,
                        subMetric2: parseFloat(retentionRate.toFixed(1)),
                        countLabel: 'registered donors',
                        subMetric1Label: 'Active Donors',
                        subMetric2Label: 'Retention Rate %'
                    });

                    // Chart 1: Retention (One-time vs Recurring)
                    const oneTimeCount = donors.filter(d => d.donations && d.donations.length === 1).length;
                    const zeroCount = donors.filter(d => !d.donations || d.donations.length === 0).length; // Just registered

                    // Using "Recurring" for >1, "One-time" for 1, "New" for 0
                    setChart1Data([
                        { name: 'Recurring (>1)', value: recurringCount },
                        { name: 'One-time', value: oneTimeCount },
                        { name: 'New (0)', value: zeroCount }
                    ].filter(d => d.value > 0));

                    // Chart 2: Activity Status
                    const inactiveCount = donors.filter(d => d.status !== 'Active').length;
                    setChart2Data([
                        { name: 'Active', value: activeCount },
                        { name: 'Inactive', value: inactiveCount }
                    ].filter(d => d.value > 0));

                    setChartTitles({
                        title1: 'Retention (Donation Frequency)',
                        title2: 'Activity Status'
                    });
                }
            } else if (type === 'campaigns') {
                const { data, error } = await supabase
                    .from('campaigns')
                    .select(`
                        *,
                        donations (
                            amount
                        )
                    `);

                if (error) {
                    console.error("Error fetching campaign details:", error);
                    setLoading(false);
                    return;
                }

                // Calculate raised_amount dynamically from donations
                const rawCampaigns = (data || []) as unknown as CampaignRecord[];
                const campaigns = rawCampaigns.map(c => ({
                    ...c,
                    raised_amount: c.donations ? c.donations.reduce((sum, d) => sum + Number(d.amount), 0) : 0
                }));

                if (campaigns.length > 0) {
                    const totalCampaigns = campaigns.length;
                    const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount || 0), 0);
                    const totalGoal = campaigns.reduce((sum, c) => sum + Number(c.goal_amount || 0), 0);

                    setMetrics({
                        total: totalCampaigns,
                        subMetric1: totalRaised,
                        subMetric2: totalGoal,
                        countLabel: 'active campaigns',
                        subMetric1Label: 'Total Raised',
                        subMetric2Label: 'Total Goal'
                    });

                    // Chart 1: Progress (Goal vs Raised) - Top 5 by raised amount
                    const sortedCampaigns = [...campaigns].sort((a, b) => b.raised_amount - a.raised_amount).slice(0, 5);
                    setChart1Data(sortedCampaigns.map(c => ({
                        name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
                        value: Number(c.raised_amount),
                        goal: Number(c.goal_amount)
                    })));

                    // Chart 2: Donation Distribution (Pie)
                    setChart2Data(sortedCampaigns.map(c => ({
                        name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
                        value: Number(c.raised_amount)
                    })).filter(d => d.value > 0));

                    setChartTitles({
                        title1: 'Fundraising Progress (Top 5)',
                        title2: 'Donation Distribution'
                    });
                }
            }
            setLoading(false);
        };

        fetchData();
    }, [type, supabase]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const getIcon = () => {
        if (type === 'donations') return <IndianRupee size={24} className="text-primary" />;
        if (type === 'donors') return <Users size={24} className="text-primary" />;
        if (type === 'campaigns') return <Target size={24} className="text-primary" />;
        return <Activity size={24} className="text-primary" />;
    };

    const getTitle = () => {
        if (type === 'donations') return 'Donation Insights';
        if (type === 'donors') return 'Donor Insights';
        if (type === 'campaigns') return 'Campaign Insights';
        return 'Insights';
    };

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
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {getIcon()}
                    {getTitle()}
                </h2>

                {loading ? (
                    <div className="py-10 text-center text-muted">Loading insights...</div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Top Row: Key Metrics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
                                <div className="text-sm font-semibold mb-1" style={{ color: '#2563eb' }}>
                                    Total {type === 'campaigns' ? 'Campaigns' : (type === 'donations' ? 'Collections' : 'Donors')}
                                </div>
                                <div className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>
                                    {type === 'donations' ? '₹' : ''}{metrics.total.toLocaleString()}
                                </div>
                                <div className="text-xs mt-1" style={{ color: '#3b82f6' }}>{metrics.countLabel}</div>
                            </div>
                            <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                                <div className="text-sm font-semibold mb-1" style={{ color: '#16a34a' }}>{metrics.subMetric1Label}</div>
                                <div className="text-2xl font-bold" style={{ color: '#14532d' }}>
                                    {type === 'donations' || type === 'campaigns' ? '₹' : ''}{metrics.subMetric1.toLocaleString()}
                                </div>
                                <div className="text-xs mt-1" style={{ color: '#22c55e' }}>
                                    {type === 'donations' ? 'Per transaction' : (type === 'donors' ? 'Currently active' : 'Funds Raised')}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl" style={{ background: '#faf5ff', border: '1px solid #f3e8ff' }}>
                                <div className="text-sm font-semibold mb-1" style={{ color: '#9333ea' }}>{metrics.subMetric2Label}</div>
                                <div className="text-2xl font-bold" style={{ color: '#581c87' }}>
                                    {type === 'donations' || type === 'campaigns' ? '₹' : ''}{metrics.subMetric2.toLocaleString()}{type === 'donors' ? '%' : ''}
                                </div>
                                <div className="text-xs mt-1" style={{ color: '#a855f7' }}>
                                    {type === 'donations' ? 'Highest single amount' : (type === 'donors' ? 'Recurring >1 time' : 'Target Goal')}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* Chart 1 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    {type === 'campaigns' ? <Target size={18} /> : <PieChart size={18} />}
                                    {chartTitles.title1}
                                </h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        {type === 'campaigns' ? (
                                            <BarChart data={chart1Data} layout="vertical" margin={{ left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                                <Legend />
                                                <Bar dataKey="value" name="Raised" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={20} />
                                                <Bar dataKey="goal" name="Goal" fill="#d1d5db" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        ) : (
                                            <RechartsPieChart>
                                                <Pie
                                                    data={chart1Data}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chart1Data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => type === 'donations' ? `₹${value.toLocaleString()}` : value} />
                                                <Legend />
                                            </RechartsPieChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2 */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    {chartTitles.title2}
                                </h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <RechartsPieChart>
                                            <Pie
                                                data={chart2Data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chart2Data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} /> // Offset colors
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => (type === 'donations' || type === 'campaigns') ? `₹${value.toLocaleString()}` : value} />
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
