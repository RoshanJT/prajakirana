"use client";

import { useEffect, useState } from 'react';
import { Plus, Calendar, Target, Users } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import CampaignForm from '@/components/CampaignForm';

interface Campaign {
    id: string;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number;
    status: string;
    created_at: string;
    // Helper fields for UI
    deadline?: string;
    donors?: number;
}

export default function CampaignsPage() {
    const supabase = createClient();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data for UI
            const formattedCampaigns: Campaign[] = (data || []).map(c => ({
                ...c,
                deadline: new Date(new Date(c.created_at).setMonth(new Date(c.created_at).getMonth() + 1)).toLocaleDateString(), // Mock deadline: 1 month from creation
                donors: 0 // Mock donor count for now
            }));

            setCampaigns(formattedCampaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCampaign = async (newCampaign: any) => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .insert([{
                    title: newCampaign.title,
                    description: newCampaign.description,
                    goal_amount: newCampaign.goal_amount,
                    status: newCampaign.status
                }]);

            if (error) throw error;

            fetchCampaigns();
            setShowForm(false);
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-xl font-bold">Campaigns</h1>
                    <p className="text-muted">Manage fundraising campaigns and events</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Create Campaign
                </button>
            </header>

            {showForm && (
                <CampaignForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleCreateCampaign}
                />
            )}

            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {campaigns.map((campaign) => (
                    <div key={campaign.id} className="card">
                        <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${campaign.status === 'Active'
                                    ? 'bg-green-50 text-green-600 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`} style={{
                                        background: campaign.status === 'Active' ? '#f0fdf4' : '#f8fafc',
                                        color: campaign.status === 'Active' ? '#16a34a' : '#64748b',
                                        borderColor: campaign.status === 'Active' ? '#bbf7d0' : '#e2e8f0'
                                    }}>
                                    {campaign.status}
                                </span>
                                <h3 className="text-lg font-bold mt-2">{campaign.title}</h3>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted">Progress</span>
                                    <span className="font-bold">
                                        {campaign.goal_amount > 0
                                            ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100)
                                            : 0}%
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0}%`,
                                        height: '100%',
                                        background: 'var(--primary)',
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <Target size={16} className="text-muted" />
                                    <span>₹{campaign.raised_amount.toLocaleString()} / ₹{campaign.goal_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-muted" />
                                    <span>{campaign.donors || 0} Donors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-muted" />
                                    <span>{campaign.deadline}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

