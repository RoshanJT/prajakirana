"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function DonationChart() {
    const supabase = createClient();
    const [data, setData] = useState<{ name: string; amount: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: donations } = await supabase
                .from('donations')
                .select('amount, date');

            if (!donations) return;

            // Initialize all months with 0
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyData = months.reduce((acc, month) => {
                acc[month] = 0;
                return acc;
            }, {} as Record<string, number>);

            // Aggregate data
            donations.forEach(d => {
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
        };

        fetchData();
    }, []);
    return (
        <div className="card" style={{ height: '400px' }}>
            <h3 className="text-lg font-bold" style={{ marginBottom: '1.5rem' }}>Donation Trends</h3>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip
                            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
