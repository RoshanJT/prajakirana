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
    const [donationType, setDonationType] = useState<'monetary' | 'in-kind'>('monetary');
    const [formData, setFormData] = useState({
        donor_id: '',
        campaign_id: '',
        amount: '',
        payment_method: 'UPI',
        items: [] as { item: string; quantity: string; unit: string }[]
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

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { item: '', quantity: '', unit: '' }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: 'item' | 'quantity' | 'unit', value: string) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                donor_id: formData.donor_id,
                campaign_id: formData.campaign_id || null,
                donation_type: donationType,
                amount: formData.amount ? Number(formData.amount) : null,
            };

            if (donationType === 'monetary') {
                payload.payment_method = formData.payment_method;
                payload.items = null;
            } else {
                payload.items = formData.items;
                payload.payment_method = null; // In-kind doesn't usually have a payment method like UPI
            }

            const { error } = await supabase.from('donations').insert([payload]);

            if (error) throw error;

            // Check if campaign goal is met
            if (formData.campaign_id) {
                const { data: campaign } = await supabase
                    .from('campaigns')
                    .select('goal_amount')
                    .eq('id', formData.campaign_id)
                    .single();

                if (campaign) {
                    const { data: donations } = await supabase
                        .from('donations')
                        .select('amount')
                        .eq('campaign_id', formData.campaign_id);

                    const totalRaised = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

                    if (totalRaised >= campaign.goal_amount) {
                        await supabase
                            .from('campaigns')
                            .update({ status: 'Completed' })
                            .eq('id', formData.campaign_id);
                    }
                }
            }

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
            <div className="card" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Record Donation</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Donation Type Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${donationType === 'monetary' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setDonationType('monetary')}
                            style={{ color: donationType === 'monetary' ? 'var(--primary)' : 'inherit' }}
                        >
                            Monetary
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${donationType === 'in-kind' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setDonationType('in-kind')}
                            style={{ color: donationType === 'in-kind' ? 'var(--primary)' : 'inherit' }}
                        >
                            In-Kind (Items)
                        </button>
                    </div>

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

                    {donationType === 'monetary' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            {/* In-Kind Section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold">Items Donated</label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-xs btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem' }}
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                {formData.items.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No items added. Click "+ Add Item" to start.</p>
                                )}
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Item Name (e.g. Rice)"
                                            required
                                            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flex: 2 }}
                                            value={item.item}
                                            onChange={(e) => updateItem(index, 'item', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            required
                                            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flex: 1 }}
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit (kg/pcs)"
                                            required
                                            style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flex: 1 }}
                                            value={item.unit}
                                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            style={{ color: 'var(--danger)', padding: '0.5rem' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold">Estimated Value (₹) - Optional</label>
                                <input
                                    type="number"
                                    min="0"
                                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Donation</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
