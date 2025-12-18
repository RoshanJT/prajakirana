"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import DonorForm from '@/components/DonorForm';

export interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
    lastDonationDate: string;
    totalDonated: number;
}

export default function DonorsPage() {
    const supabase = createClient();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');

    // Action Dropdown State
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    useEffect(() => {
        fetchDonors();
    }, []);

    // Close dropdown when clicking outside
    // Close dropdown when clicking outside replaced by backdrop logic

    const fetchDonors = async () => {
        try {
            const { data: donorsData, error } = await supabase
                .from('donors')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedDonors: Donor[] = (donorsData || []).map(d => ({
                id: d.id,
                name: d.name,
                email: d.email || '-',
                phone: d.phone || '-',
                type: 'Individual', // Default
                status: 'Active',   // Default
                lastDonationDate: new Date(d.created_at).toLocaleDateString(),
                totalDonated: 0 // Default
            }));

            setDonors(formattedDonors);
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDonor = async (newDonor: any) => {
        try {
            const { error } = await supabase
                .from('donors')
                .insert([{
                    name: newDonor.name,
                    email: newDonor.email,
                    phone: newDonor.phone,
                }]);

            if (error) throw error;

            fetchDonors();
            setShowForm(false);
        } catch (error: any) {
            console.error('Error adding donor:', error);
            alert(`Failed to add donor: ${error.message || error}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this donor?')) return;

        try {
            const { error } = await supabase.from('donors').delete().eq('id', id);
            if (error) throw error;
            fetchDonors();
        } catch (error) {
            console.error('Error deleting donor:', error);
            alert('Failed to delete donor');
        }
    };

    // Filter Logic
    const filteredDonors = donors.filter(donor =>
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-xl font-bold">Donor Management</h1>
                    <p className="text-muted">Manage your donor database</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Add Donor
                </button>
            </header>

            {showForm && (
                <DonorForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleAddDonor}
                />
            )}

            <div className="card">
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex gap-2" style={{ flex: 1, maxWidth: '400px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search donors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.5rem 0.5rem 2.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button className="btn btn-outline">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                    <div className="text-sm text-muted">
                        Showing {filteredDonors.length} donors
                    </div>
                </div>

                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Last Donation</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td>
                                </tr>
                            ) : (
                                filteredDonors.map((donor) => (
                                    <tr key={donor.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="font-bold">{donor.name}</div>
                                            <div className="text-sm text-muted">{donor.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.875rem',
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary)',
                                                fontWeight: 500
                                            }}>
                                                {donor.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                color: donor.status === 'Active' ? 'var(--accent)' : 'var(--text-muted)',
                                                fontWeight: 500
                                            }}>
                                                {donor.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{donor.lastDonationDate}</td>
                                        <td style={{ padding: '1rem' }}>₹{donor.totalDonated}</td>
                                        <td style={{ padding: '1rem', position: 'relative' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.25rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveActionId(activeActionId === donor.id ? null : donor.id);
                                                }}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeActionId === donor.id && (
                                                <>
                                                    <div
                                                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}
                                                        onClick={() => setActiveActionId(null)}
                                                    />
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: '1rem',
                                                        top: '3rem',
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: 'var(--radius-md)',
                                                        boxShadow: 'var(--shadow-lg)',
                                                        zIndex: 10,
                                                        minWidth: '120px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <button
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-main)' }}
                                                            className="hover:bg-gray-100"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert('Edit feature coming soon!');
                                                                setActiveActionId(null);
                                                            }}
                                                        >
                                                            <Edit size={14} /> Edit
                                                        </button>
                                                        <button
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--danger)' }}
                                                            className="hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(donor.id);
                                                            }}
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
