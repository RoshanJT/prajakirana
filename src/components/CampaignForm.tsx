"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface CampaignFormProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function CampaignForm({ onClose, onSubmit }: CampaignFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        deadline: '',
        status: 'Active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            goal_amount: Number(formData.goal_amount)
        });
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

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Create Campaign</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Campaign Title</label>
                        <input
                            type="text"
                            required
                            className="input"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Goal Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.goal_amount}
                            onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Target Date</label>
                        <input
                            type="date"
                            required
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Description</label>
                        <textarea
                            rows={3}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'none' }}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Create Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
