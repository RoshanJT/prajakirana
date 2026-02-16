"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface CampaignFormProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}

export default function CampaignForm({ onClose, onSubmit, initialData }: CampaignFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        goal_amount: initialData?.goal_amount || '',
        deadline: initialData?.deadline || '',
        status: initialData?.status || 'Active',
    });

    const [errors, setErrors] = useState<{ title?: string; goal_amount?: string; deadline?: string; description?: string }>({});

    const validate = (): boolean => {
        const newErrors: { title?: string; goal_amount?: string; deadline?: string; description?: string } = {};
        let isValid = true;

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        if (Number(formData.goal_amount) <= 0) {
            newErrors.goal_amount = 'Goal amount must be greater than 0';
            isValid = false;
        }

        if (formData.deadline && new Date(formData.deadline) <= new Date()) {
            newErrors.deadline = 'Target date must be in the future';
            isValid = false;
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                goal_amount: Number(formData.goal_amount)
            });
        }
    };

    return (
        <div className="modal-overlay" style={{
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
            <div className="card modal-content" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>{initialData ? 'Edit Campaign' : 'Create Campaign'}</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Campaign Title</label>
                        <input
                            type="text"
                            required
                            className="input"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.title ? '#ef4444' : 'var(--border-color)'}` }}
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: '' });
                            }}
                        />
                        {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Goal Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.goal_amount ? '#ef4444' : 'var(--border-color)'}` }}
                            value={formData.goal_amount}
                            onChange={(e) => {
                                setFormData({ ...formData, goal_amount: e.target.value });
                                if (errors.goal_amount) setErrors({ ...errors, goal_amount: '' });
                            }}
                        />
                        {errors.goal_amount && <span className="text-xs text-red-500">{errors.goal_amount}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Target Date</label>
                        <input
                            type="date"
                            required
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.deadline ? '#ef4444' : 'var(--border-color)'}` }}
                            value={formData.deadline}
                            onChange={(e) => {
                                setFormData({ ...formData, deadline: e.target.value });
                                if (errors.deadline) setErrors({ ...errors, deadline: '' });
                            }}
                        />
                        {errors.deadline && <span className="text-xs text-red-500">{errors.deadline}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Description</label>
                        <textarea
                            rows={3}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.description ? '#ef4444' : 'var(--border-color)'}`, resize: 'none' }}
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (errors.description) setErrors({ ...errors, description: '' });
                            }}
                        />
                        {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                    </div>

                    <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">{initialData ? 'Update Campaign' : 'Create Campaign'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
