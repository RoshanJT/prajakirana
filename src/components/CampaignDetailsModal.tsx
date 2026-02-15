"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { X, Target, Users, Calendar, DollarSign } from "lucide-react";

interface CampaignDetailsModalProps {
    campaign: any;
    onClose: () => void;
}

export default function CampaignDetailsModal({ campaign, onClose }: CampaignDetailsModalProps) {
    const supabase = createClient();
    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonors = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('donations')
                    .select(`
                        id,
                        amount,
                        date,
                        donors (
                            name,
                            email
                        )
                    `)
                    .eq('campaign_id', campaign.id)
                    .order('date', { ascending: false });

                if (error) throw error;
                setDonors(data || []);
            } catch (error) {
                console.error("Error fetching campaign donors:", error);
            } finally {
                setLoading(false);
            }
        };

        if (campaign?.id) {
            fetchDonors();
        }
    }, [campaign, supabase]);

    const progress = campaign.goal_amount > 0
        ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100)
        : 0;

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
            zIndex: 60
        }} onClick={onClose}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '600px',
                maxHeight: '85vh',
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

                <div style={{ paddingRight: '2rem' }}>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full border inline-block mb-2 ${campaign.status === 'Active'
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`} style={{
                            background: campaign.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                            color: campaign.status === 'Active' ? '#16a34a' : '#64748b',
                            borderColor: campaign.status === 'Active' ? '#bbf7d0' : '#e2e8f0'
                        }}>
                        {campaign.status}
                    </div>
                    <h2 className="text-xl font-bold mb-2">{campaign.title}</h2>
                    <p className="text-sm text-muted mb-4">{campaign.description}</p>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#fafaf9', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted flex items-center gap-1"><Target size={14} /> Goal Progress</span>
                        <div className="font-bold text-lg">
                            {progress}% <span className="text-sm font-normal text-muted">of ₹{campaign.goal_amount.toLocaleString()}</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e5e5e5', borderRadius: '3px', marginTop: '4px' }}>
                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted flex items-center gap-1"><DollarSign size={14} /> Raised</span>
                        <div className="font-bold text-lg text-primary">₹{campaign.raised_amount.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted flex items-center gap-1"><Users size={14} /> Donors</span>
                        <div className="font-bold">{campaign.donors}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted flex items-center gap-1"><Calendar size={14} /> Deadline</span>
                        <div className="font-bold">{campaign.deadline}</div>
                    </div>
                </div>

                <h3 className="font-bold mb-3 flex items-center gap-2 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                    <Users size={18} className="text-primary" /> Recent Donors
                </h3>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-8 text-muted">Loading donors...</div>
                    ) : donors.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {donors.map((d) => (
                                <div key={d.id} style={{
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-color-card)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div className="font-bold text-sm">{d.donors?.name || 'Anonymous'}</div>
                                        <div className="text-xs text-muted">{new Date(d.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="font-bold text-primary">+₹{d.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted bg-gray-50 rounded-lg">
                            No donations yet for this campaign.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
