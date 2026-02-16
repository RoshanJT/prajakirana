"use client";

import { useEffect, useState } from 'react';
import { Plus, Calendar, Target, Users, Trash2, Edit2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import CampaignForm from '@/components/CampaignForm';
import CampaignDetailsModal from '@/components/CampaignDetailsModal';

interface Campaign {
    id: string;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number;
    status: string;
    created_at: string;
    deadline?: string;
    donors?: number;
}

export default function CampaignsPage() {
    const supabase = createClient();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    donations (
                        amount,
                        donor_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedCampaigns: Campaign[] = (data || []).map((c: any) => {
                const donations = c.donations || [];
                const raised_amount = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
                const uniqueDonors = new Set(donations.map((d: any) => d.donor_id)).size;

                return {
                    ...c,
                    raised_amount,
                    donors: uniqueDonors,
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : '-'
                };
            });

            setCampaigns(formattedCampaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateCampaign = async (campaignData: any) => {
        try {
            if (editingCampaign) {
                // Update
                const { error } = await supabase
                    .from('campaigns')
                    .update({
                        title: campaignData.title,
                        description: campaignData.description,
                        goal_amount: campaignData.goal_amount,
                        deadline: campaignData.deadline,
                        status: campaignData.status
                    })
                    .eq('id', editingCampaign.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('campaigns')
                    .insert([{
                        title: campaignData.title,
                        description: campaignData.description,
                        goal_amount: campaignData.goal_amount,
                        deadline: campaignData.deadline,
                        status: campaignData.status
                    }]);
                if (error) throw error;
            }

            fetchCampaigns();
            setShowForm(false);
            setEditingCampaign(null);
        } catch (error) {
            console.error('Error saving campaign:', error);
            alert('Failed to save campaign');
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (filterStatus === 'All') return true;
        return c.status === filterStatus;
    });

    return (
        <div>
            <header className="campaign-header flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div className="header-content">
                    <h1 className="text-xl font-bold">Campaigns</h1>
                    <p className="text-muted">Manage fundraising campaigns and events</p>
                </div>
                <button
                    className="btn btn-primary header-action"
                    onClick={() => {
                        setEditingCampaign(null);
                        setShowForm(true);
                    }}
                >
                    <Plus size={18} /> <span>Create Campaign</span>
                </button>
            </header>

            {/* Status Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                {['All', 'Active', 'Completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderBottom: filterStatus === status ? '2px solid var(--primary)' : '2px solid transparent',
                            color: filterStatus === status ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: filterStatus === status ? 600 : 400,
                            marginBottom: '-2px'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {showForm && (
                <CampaignForm
                    initialData={editingCampaign}
                    onClose={() => {
                        setShowForm(false);
                        setEditingCampaign(null);
                    }}
                    onSubmit={handleCreateOrUpdateCampaign}
                />
            )}

            {selectedCampaign && (
                <CampaignDetailsModal
                    campaign={selectedCampaign}
                    onClose={() => setSelectedCampaign(null)}
                />
            )}

            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredCampaigns.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="card"
                        style={{ cursor: 'pointer', position: 'relative' }}
                        onClick={() => setSelectedCampaign(campaign)}
                    >
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

                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        setEditingCampaign(campaign);
                                        setShowForm(true);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full text-muted hover:text-primary transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="p-2 hover:bg-red-50 rounded-full text-muted hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
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

