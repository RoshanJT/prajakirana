"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import DonorForm from '@/components/DonorForm';
import DonorDetailModal from '@/components/DonorDetailModal';

export interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
    status: string;
    lastDonationDate: string;
    totalDonated: number;
    birth_date?: string;
    anniversary_date?: string;
    social_media_handle?: string;
    memorial_dates?: any[];
    created_at?: string;
}



export default function DonorsPage() {
    const supabase = createClient();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortColumn, setSortColumn] = useState<keyof Donor>('created_at' as keyof Donor);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // UI State
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
    const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

    useEffect(() => {
        fetchDonors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close dropdown when clicking outside
    // Close dropdown when clicking outside replaced by backdrop logic

    const fetchDonors = async () => {
        try {
            const { data: donorsData, error } = await supabase
                .from('donors')
                .select(`
                    *,
                    donations (
                        amount,
                        date
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Use unknown casting to bypass rough Supabase typings if needed, then map to our interface
            const formattedDonors: Donor[] = (donorsData || []).map((d: unknown) => {
                const donor = d as Donor & { donations: { amount: number; date: string }[] };
                const donations = (donor.donations || []);
                const totalDonated = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);

                // Find last donation date
                let lastDonationDate = '-';
                if (donations.length > 0) {
                    const sortedDonations = [...donations].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );
                    lastDonationDate = new Date(sortedDonations[0].date).toLocaleDateString();
                }

                return {
                    ...donor,
                    lastDonationDate,
                    totalDonated
                };
            });

            setDonors(formattedDonors);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error fetching donors:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDonor = async (donorData: Partial<Donor>) => {
        try {
            let error;

            const payload = {
                name: donorData.name,
                email: donorData.email || null,
                phone: donorData.phone || null,
                type: donorData.type,
                status: donorData.status,
                anniversary_date: donorData.anniversary_date || null,
                birth_date: donorData.birth_date || null,
                social_media_handle: donorData.social_media_handle || null,
                memorial_dates: donorData.memorial_dates
            };

            if (editingDonor) {
                // Update existing
                const result = await supabase
                    .from('donors')
                    .update(payload)
                    .eq('id', editingDonor.id);
                error = result.error;
            } else {
                // Insert new
                const result = await supabase
                    .from('donors')
                    .insert([payload]);
                error = result.error;
            }

            if (error) throw error;

            fetchDonors();
            setShowForm(false);
            setEditingDonor(null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error saving donor:', error);
            alert(`Failed to save donor: ${errorMessage}`);
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

    const exportToCSV = () => {
        // Define CSV headers
        const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Last Donation', 'Total Donated'];

        // Convert donors data to CSV rows
        const rows = donors.map(donor => [
            donor.name,
            donor.email || '',
            donor.phone || '',
            donor.type,
            donor.status,
            donor.lastDonationDate,
            donor.totalDonated.toString()
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `donors_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // Filter & Sort Logic
    // Standardize dates for sorting (handle '-' which means no date)
    const getDateValue = (dateStr: string | undefined): number => {
        if (!dateStr || dateStr === '-') return 0;
        return new Date(dateStr).getTime();
    };

    const filteredDonors = donors
        .filter(donor => {
            const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                donor.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'All' || donor.type === filterType;
            const matchesStatus = filterStatus === 'All' || donor.status === filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        })
        .sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            // Handle numeric values
            if (sortColumn === 'totalDonated') {
                valA = Number(valA);
                valB = Number(valB);
            }
            // Handle date values
            else if (sortColumn === 'lastDonationDate' || sortColumn === 'created_at') { // created_at isn't in Interface but IS in data, let's cast
                valA = getDateValue(valA as string);
                valB = getDateValue(valB as string);
            }
            // Handle strings
            else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = (column: keyof Donor) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ column }: { column: keyof Donor }) => {
        if (sortColumn !== column) return <span className="opacity-0 group-hover:opacity-30 ml-1"><ChevronDown size={14} /></span>;
        return sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
    };

    return (
        <div>
            <header className="donors-header flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-xl font-bold">Donor Management</h1>
                    <p className="text-muted">Manage your donor database</p>
                </div>
                <div className="header-actions flex gap-2">
                    <button className="btn btn-outline" onClick={exportToCSV}>
                        <Download size={18} /> Export as CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingDonor(null);
                        setShowForm(true);
                    }}>
                        <Plus size={18} /> Add Donor
                    </button>
                </div>
            </header>

            {showForm && (
                <DonorForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingDonor(null);
                    }}
                    onSubmit={handleSaveDonor}
                    initialData={editingDonor || undefined}
                />
            )}

            <div className="card">
                <div className="donors-filters flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                    <div className="search-bar flex gap-2" style={{ flex: 1, maxWidth: '400px' }}>
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
                        <div className="filter-bar flex gap-2">
                            <select
                                className="input-field"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="All">All Types</option>
                                <option value="Individual">Individual</option>
                                <option value="Corporate">Corporate</option>
                            </select>
                            <select
                                className="input-field"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        Showing {filteredDonors.length} donors
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th onClick={() => handleSort('name')} className="group cursor-pointer hover:bg-slate-50 transition-colors" style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div className="flex items-center">Name <SortIcon column="name" /></div>
                                </th>
                                <th onClick={() => handleSort('type')} className="group cursor-pointer hover:bg-slate-50 transition-colors" style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div className="flex items-center">Type <SortIcon column="type" /></div>
                                </th>
                                <th onClick={() => handleSort('status')} className="group cursor-pointer hover:bg-slate-50 transition-colors" style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div className="flex items-center">Status <SortIcon column="status" /></div>
                                </th>
                                <th onClick={() => handleSort('lastDonationDate')} className="group cursor-pointer hover:bg-slate-50 transition-colors" style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div className="flex items-center">Last Donation <SortIcon column="lastDonationDate" /></div>
                                </th>
                                <th onClick={() => handleSort('totalDonated')} className="group cursor-pointer hover:bg-slate-50 transition-colors" style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    <div className="flex items-center">Total <SortIcon column="totalDonated" /></div>
                                </th>
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
                                    <tr
                                        key={donor.id}
                                        style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                                        className="hover:bg-slate-50 transition-colors"
                                        onClick={() => setSelectedDonorId(donor.id)}
                                    >
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
                                                                setEditingDonor(donor);
                                                                setShowForm(true);
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

            {selectedDonorId && (
                <DonorDetailModal
                    donorId={selectedDonorId}
                    onClose={() => setSelectedDonorId(null)}
                />
            )}
        </div>
    );
}
