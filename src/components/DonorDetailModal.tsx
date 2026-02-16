import { useState, useEffect } from "react";
import { X, Mail, Phone, Calendar, User, DollarSign, Clock, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface DonorDetailModalProps {
    donorId: string;
    onClose: () => void;
}

interface DonationHistoryItem {
    id: string;
    amount: number;
    date: string;
    payment_method: string;
    campaigns?: { title: string } | null;
}

interface DonorDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    type: string;
    status: string;
    created_at: string;
    birth_date?: string;
    anniversary_date?: string;
    social_media_handle?: string;
    memorial_dates?: string[]; // Assuming dates are strings
}

export default function DonorDetailModal({ donorId, onClose }: DonorDetailModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [donor, setDonor] = useState<DonorDetails | null>(null);
    const [donations, setDonations] = useState<DonationHistoryItem[]>([]);

    useEffect(() => {
        const fetchDonorDetails = async () => {
            setLoading(true);

            // 1. Fetch Donor Profile
            const { data: donorData, error: donorError } = await supabase
                .from('donors')
                .select('*')
                .eq('id', donorId)
                .single();

            if (donorError) {
                console.error("Error fetching donor:", donorError);
                setLoading(false);
                return;
            }

            setDonor(donorData);

            // 2. Fetch Donation History with Campaign info
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .select(`
                    id,
                    amount,
                    date,
                    payment_method,
                    campaigns (
                        title
                    )
                `)
                .eq('donor_id', donorId)
                .order('date', { ascending: false });

            if (donationError) {
                console.error("Error fetching donations:", donationError);
            } else {
                setDonations(donationData as unknown as DonationHistoryItem[]);
            }

            setLoading(false);
        };

        if (donorId) {
            fetchDonorDetails();
        }
    }, [donorId, supabase]);

    if (!donorId) return null;

    const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const averageDonation = donations.length > 0 ? totalDonated / donations.length : 0;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
            zIndex: 100
        }} onClick={onClose}>
            <div className="card modal-content" style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                padding: '0'
            }} onClick={e => e.stopPropagation()}>

                {loading ? (
                    <div className="p-10 text-center text-muted">Loading donor profile...</div>
                ) : donor ? (
                    <>
                        {/* Header Banner */}
                        <div style={{
                            background: 'linear-gradient(to right, var(--primary), var(--primary-dark))',
                            padding: '2rem',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    right: '1.5rem',
                                    top: '1.5rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {donor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{donor.name}</h2>
                                    <div className="flex gap-2 mt-1">
                                        <span style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem'
                                        }}>{donor.type}</span>
                                        <span style={{
                                            background: donor.status === 'Active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem'
                                        }}>{donor.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {/* Contact Info */}
                                <div style={{ border: '1px solid var(--border-color-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={16} /> Contact Details
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} style={{ color: 'var(--primary)' }} />
                                            <span>{donor.email || 'No email'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} style={{ color: 'var(--primary)' }} />
                                            <span>{donor.phone || 'No phone'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={14} style={{ color: 'var(--primary)' }} />
                                            <span>{donor.address || 'No address'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Dates */}
                                <div style={{ border: '1px solid var(--border-color-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} /> Important Dates
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Joined:</span>
                                            <span>{formatDate(donor.created_at)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Birthday:</span>
                                            <span>{formatDate(donor.birth_date)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Anniversary:</span>
                                            <span>{formatDate(donor.anniversary_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lifetime Stats */}
                                <div style={{ border: '1px solid var(--border-color-card)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign size={16} /> Lifetime Giving
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{totalDonated.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Contributed</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{donations.length}</div>
                                                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Donations</div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', color: 'white' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>₹{Math.round(averageDonation).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Avg Amount</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Donation History */}
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={20} style={{ color: 'var(--primary)' }} /> Donation History
                            </h3>

                            <div style={{ border: '1px solid var(--border-color-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg-body)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem', color: 'white' }}>Date</th>
                                            <th style={{ padding: '0.75rem', color: 'white' }}>Campaign</th>
                                            <th style={{ padding: '0.75rem', color: 'white' }}>Method</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right', color: 'white' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {donations.length > 0 ? (
                                            donations.map((donation, index) => (
                                                <tr key={donation.id} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--border-color-card)' }}>
                                                    <td style={{ padding: '0.75rem' }}>{formatDate(donation.date)}</td>
                                                    <td style={{ padding: '0.75rem' }}>{donation.campaigns?.title || 'General Fund'}</td>
                                                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{donation.payment_method}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500 }}>₹{Number(donation.amount).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No donations recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center text-danger">Failed to load donor data.</div>
                )}
            </div>
        </div>
    );
}
