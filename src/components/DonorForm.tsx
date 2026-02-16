"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface DonorFormData {
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
    birth_date: string;
    anniversary_date: string;
    social_media_handle: string;
    memorial_dates: { tag: string; date: string }[];
}

interface DonorFormProps {
    onClose: () => void;
    onSubmit: (data: DonorFormData) => void;
    initialData?: Partial<DonorFormData>;
}

export default function DonorForm({ onClose, onSubmit, initialData }: DonorFormProps) {
    const [formData, setFormData] = useState<DonorFormData>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        type: initialData?.type || 'Individual',
        status: initialData?.status || 'Active',
        birth_date: initialData?.birth_date || '',
        anniversary_date: initialData?.anniversary_date || '',
        social_media_handle: initialData?.social_media_handle || '',
        memorial_dates: initialData?.memorial_dates || []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Name: Required and Letters Only
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            newErrors.name = 'Name must contain only letters';
            isValid = false;
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone is required';
            isValid = false;
        } else if (!/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10-15 digits';
            isValid = false;
        }

        if (!formData.birth_date) {
            newErrors.birth_date = 'Birth date is required';
            isValid = false;
        } else if (new Date(formData.birth_date) > new Date()) {
            newErrors.birth_date = 'Birth date cannot be in the future';
            isValid = false;
        }

        const invalidMemorials = formData.memorial_dates.some(m => (!m.tag && m.date) || (m.tag && !m.date));
        if (invalidMemorials) {
            newErrors.memorial_dates = 'Incomplete memorial date entries';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const addMemorialDate = () => {
        setFormData({
            ...formData,
            memorial_dates: [...formData.memorial_dates, { tag: '', date: '' }]
        });
    };

    const removeMemorialDate = (index: number) => {
        const newDates = [...formData.memorial_dates];
        newDates.splice(index, 1);
        setFormData({ ...formData, memorial_dates: newDates });
    };

    const updateMemorialDate = (index: number, field: 'tag' | 'date', value: string) => {
        const newDates = [...formData.memorial_dates];
        newDates[index] = { ...newDates[index], [field]: value };
        setFormData({ ...formData, memorial_dates: newDates });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
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
            <div className="card modal-content" style={{ width: '100%', maxWidth: '600px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>{initialData ? 'Edit Donor' : 'Add New Donor'}</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.name ? '#ef4444' : 'var(--border-color)'}` }}
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Email Address</label>
                            <input
                                type="email"
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.email ? '#ef4444' : 'var(--border-color)'}`, width: '100%' }}
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                }}
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Phone Number</label>
                            <input
                                type="tel"
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.phone ? '#ef4444' : 'var(--border-color)'}`, width: '100%' }}
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData({ ...formData, phone: val });
                                    if (errors.phone) setErrors({ ...errors, phone: '' });
                                }}
                            />
                            {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Birth Date</label>
                            <input
                                type="date"
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.birth_date ? '#ef4444' : 'var(--border-color)'}`, width: '100%' }}
                                value={formData.birth_date}
                                onChange={(e) => {
                                    setFormData({ ...formData, birth_date: e.target.value });
                                    if (errors.birth_date) setErrors({ ...errors, birth_date: '' });
                                }}
                            />
                            {errors.birth_date && <span className="text-xs text-red-500">{errors.birth_date}</span>}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Anniversary Date</label>
                            <input
                                type="date"
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.anniversary_date ? '#ef4444' : 'var(--border-color)'}`, width: '100%' }}
                                value={formData.anniversary_date}
                                onChange={(e) => {
                                    setFormData({ ...formData, anniversary_date: e.target.value });
                                    if (errors.anniversary_date) setErrors({ ...errors, anniversary_date: '' });
                                }}
                            />
                            {errors.anniversary_date && <span className="text-xs text-red-500">{errors.anniversary_date}</span>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Social Media Handle</label>
                            <input
                                type="text"
                                placeholder="@username"
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${errors.social_media_handle ? '#ef4444' : 'var(--border-color)'}`, width: '100%' }}
                                value={formData.social_media_handle}
                                onChange={(e) => {
                                    setFormData({ ...formData, social_media_handle: e.target.value });
                                    if (errors.social_media_handle) setErrors({ ...errors, social_media_handle: '' });
                                }}
                            />
                            {errors.social_media_handle && <span className="text-xs text-red-500">{errors.social_media_handle}</span>}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Type</label>
                            <select
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Individual</option>
                                <option>Corporate</option>
                                <option>Recurring</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-bold">Status</label>
                            <select
                                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Memorial Dates Section */}
                    <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold">Memorial Dates (Death Anniversaries)</label>
                            <button
                                type="button"
                                onClick={addMemorialDate}
                                className="text-xs btn btn-outline"
                                style={{ padding: '0.25rem 0.5rem' }}
                            >
                                + Add Relative
                            </button>
                        </div>
                        {Array.isArray(errors.memorial_dates) && (
                            <span className="text-xs text-red-500">Please fill in both fields for all entries.</span>
                        )}

                        {formData.memorial_dates.map((item: { tag: string; date: string }, index: number) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Relation (e.g. Father)"
                                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flex: 1 }}
                                    value={item.tag}
                                    onChange={(e) => updateMemorialDate(index, 'tag', e.target.value)}
                                />
                                <input
                                    type="date"
                                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flex: 1 }}
                                    value={item.date}
                                    onChange={(e) => updateMemorialDate(index, 'date', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeMemorialDate(index)}
                                    style={{ color: 'var(--danger)', padding: '0.5rem' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">{initialData ? 'Update Donor' : 'Save Donor'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
