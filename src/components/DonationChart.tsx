"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DonationChart() {
    const supabase = createClient();
    const [data, setData] = useState<{ name: string; amount: number }[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: donations } = await supabase
                .from('donations')
                .select('amount, date');

            if (!donations) {
                setLoading(false);
                return;
            }

            // Extract available years
            const years = new Set(donations.map(d => new Date(d.date).getFullYear()));
            // Ensure current year is always available
            years.add(new Date().getFullYear());
            const sortedYears = Array.from(years).sort((a, b) => b - a);
            setAvailableYears(sortedYears);

            // Filter by selected year
            const filteredDonations = donations.filter(d =>
                new Date(d.date).getFullYear() === selectedYear
            );

            // Initialize all months with 0
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyData = months.reduce((acc, month) => {
                acc[month] = 0;
                return acc;
            }, {} as Record<string, number>);

            // Aggregate data
            filteredDonations.forEach(d => {
                const date = new Date(d.date);
                const monthName = months[date.getMonth()];
                monthlyData[monthName] += Number(d.amount);
            });

            // Convert to array format for Recharts
            const chartData = months.map(name => ({
                name,
                amount: monthlyData[name]
            }));

            setData(chartData);
            setLoading(false);
        };

        fetchData();
    }, [selectedYear]); // Re-run when year changes

    return (
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3 className="text-lg font-bold">Donation Trends</h3>

                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{
                            padding: '0.5rem 2rem 0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color-card)',
                            backgroundColor: '#fff',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            appearance: 'none', // Hide default arrow
                            color: 'var(--text-card)'
                        }}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted-card)' }} />
                </div>
            </div>

            <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
                {loading ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Loading data...
                    </div>
                ) : (
                    isMobile ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                            <AreaChart
                                width={340}
                                height={300}
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2A8575" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2A8575" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#2A8575', fontWeight: 600 }}
                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Total Donated']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2A8575"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2A8575' }}
                                />
                            </AreaChart>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2A8575" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2A8575" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#2A8575', fontWeight: 600 }}
                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Total Donated']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2A8575"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2A8575' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )
                )}
            </div>
        </div >
    );
}
