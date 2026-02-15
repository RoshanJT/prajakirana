"use client";

import { useState } from 'react';
import { Search, Users, CheckSquare, Square } from 'lucide-react';

interface Donor {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    donor_type?: string;
}

interface RecipientSidebarProps {
    donors: Donor[];
    selectedDonors: string[];
    onToggleDonor: (id: string, selected: boolean) => void;
    onToggleAll: (ids: string[], selected: boolean) => void;
    activeChannel: 'email' | 'whatsapp';
}

export default function RecipientSidebar({
    donors,
    selectedDonors,
    onToggleDonor,
    onToggleAll,
    activeChannel
}: RecipientSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter donors based on channel availability and search term
    const filteredDonors = donors.filter(d => {
        // Search Filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (d.name || '').toLowerCase().includes(searchLower) ||
            (d.email && d.email.toLowerCase().includes(searchLower)) ||
            (d.phone && d.phone.includes(searchLower));

        // Channel Availability Filter
        // Relaxed check: just ensure the field exists and is not empty string
        const hasChannelInfo = activeChannel === 'email'
            ? Boolean(d.email && d.email.trim().length > 0)
            : Boolean(d.phone && d.phone.trim().length > 0);

        return matchesSearch && hasChannelInfo;
    });

    // Debug Log (View in Browser Console)
    console.log(`Sidebar Debug [${activeChannel}]:`, {
        total: donors.length,
        filtered: filteredDonors.length,
        sample: donors[0]
    });

    const isAllSelected = filteredDonors.length > 0 &&
        filteredDonors.every(d => selectedDonors.includes(d.id));

    const handleToggleAll = () => {
        const ids = filteredDonors.map(d => d.id);
        onToggleAll(ids, !isAllSelected);
    };

    return (
        <div className="flex flex-col">
            {/* Header / Search */}
            <div className="pb-4 mb-4 space-y-3 border-b border-[#E6E4DC]">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-[#1F4D45] flex items-center gap-2">
                        <Users size={16} />
                        Recipients
                    </h2>
                    <span className="bg-[#1F4D45] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {selectedDonors.length}
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search donors..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-[#E6E4DC] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2A8575]/20 focus:border-[#2A8575] transition-all text-gray-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted">Showing {filteredDonors.length} donors</span>
                    <button
                        onClick={handleToggleAll}
                        className="text-[#2A8575] hover:text-[#21695C] transition-colors flex items-center gap-1 font-semibold"
                    >
                        {isAllSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                        {isAllSelected ? "Deselect All" : "Select All"}
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto">
                {filteredDonors.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm italic">
                        No donors found for {activeChannel}.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredDonors.slice(0, 3).map(donor => {
                            const isSelected = selectedDonors.includes(donor.id);
                            return (
                                <div
                                    key={donor.id}
                                    onClick={() => onToggleDonor(donor.id, !isSelected)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: isSelected ? '2px solid #2A8575' : '2px solid transparent',
                                        backgroundColor: isSelected ? '#E6F2F0' : '#ffffff',
                                    }}
                                    className="hover:border-[#2A8575]/30 hover:shadow-sm"
                                >
                                    {/* Checkbox */}
                                    <div style={{
                                        flexShrink: 0,
                                        width: '1.25rem',
                                        height: '1.25rem',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: isSelected ? '2px solid #2A8575' : '2px solid #d1d5db',
                                        backgroundColor: isSelected ? '#2A8575' : '#ffffff'
                                    }}>
                                        {isSelected && <CheckSquare size={12} color="white" />}
                                    </div>

                                    {/* Avatar */}
                                    <div style={{
                                        flexShrink: 0,
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: isSelected ? '#2A8575' : '#f3f4f6',
                                        color: isSelected ? '#ffffff' : '#6b7280'
                                    }}>
                                        {donor.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info - Inline Name and Email */}
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div className="font-semibold text-sm text-[#1F4D45] whitespace-nowrap">
                                            {donor.name}
                                        </div>
                                        <div className="text-xs text-muted truncate">
                                            {activeChannel === 'email' ? donor.email : donor.phone}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {filteredDonors.length > 3 && (
                    <div className="mt-3 text-center text-xs text-muted font-medium">
                        + {filteredDonors.length - 3} more donors
                    </div>
                )}
            </div>
        </div>
    );
}
