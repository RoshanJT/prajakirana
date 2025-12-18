"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface DonationFormProps {
    onClose: () => void;
    onSubmit: () => void;
}

export default function DonationForm({ onClose, onSubmit }: DonationFormProps) {
    const supabase = createClient();
    const [donors, setDonors] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        donor_id: '',
        campaign_id: '',
        amount: '',
        payment_method: 'UPI',
    });

    useEffect(() => {
        const loadData = async () => {
            const { data: donorsData } = await supabase.from('donors').select('id, name');
            const { data: campaignsData } = await supabase.from('campaigns').select('id, title');

            if (donorsData) setDonors(donorsData);
            if (campaignsData) setCampaigns(campaignsData);
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('donations').insert([{
                donor_id: formData.donor_id,
                campaign_id: formData.campaign_id || null,
                amount: Number(formData.amount),
                payment_method: formData.payment_method
            }]);

            if (error) throw error;
            onSubmit();
        } catch (error) {
            console.error('Error adding donation:', error);
            alert('Failed to add donation');
        }
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
            zIndex: 50
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Record Donation</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Donor</label>
                        <select
                            required
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.donor_id}
                            onChange={(e) => setFormData({ ...formData, donor_id: e.target.value })}
                        >
                            <option value="">Select Donor</option>
                            {donors.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Campaign (Optional)</label>
                        <select
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.campaign_id}
                            onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                        >
                            <option value="">General Fund</option>
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Payment Method</label>
                        <select
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.payment_method}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        >
                            <option>UPI</option>
                            <option>Cash</option>
                            <option>Bank Transfer</option>
                            <option>Cheque</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Donation</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
