"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Building2, Globe, Bell, Save, CreditCard, Mail } from 'lucide-react';

export default function SettingsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'integrations' | 'notifications'>('profile');

    const [formData, setFormData] = useState({
        id: '',
        org_name: '',
        org_email: '',
        org_phone: '',
        org_address: '',
        website: '',
        upi_id: '',
        razorpay_key: '',
        notifications_enabled: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (error) {
                // If no settings exist, we might need to create one, or handles error
                console.error('Error fetching settings:', error);
                // Fallback if table is empty but defined (though SQL script inserts default)
                return;
            }

            if (data) {
                setFormData(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .update({
                    org_name: formData.org_name,
                    org_email: formData.org_email,
                    org_phone: formData.org_phone,
                    org_address: formData.org_address,
                    website: formData.website,
                    upi_id: formData.upi_id,
                    razorpay_key: formData.razorpay_key,
                    notifications_enabled: formData.notifications_enabled
                })
                .eq('id', formData.id);

            if (error) throw error;
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-xl font-bold">Settings</h1>
                <p className="text-muted">Manage your organization profile and preferences</p>
            </header>

            <div className="flex flex-col gap-6">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b pb-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm ${activeTab === 'profile' ? 'bg-[#E6F2F0] text-[#1F4D45]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Building2 size={18} />
                        Organization Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm ${activeTab === 'integrations' ? 'bg-[#E6F2F0] text-[#1F4D45]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Globe size={18} />
                        Integrations
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm ${activeTab === 'notifications' ? 'bg-[#E6F2F0] text-[#1F4D45]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Bell size={18} />
                        Notifications
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="card">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold border-b pb-4">Organization Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Organization Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                            value={formData.org_name || ''}
                                            onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Website</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                            value={formData.website || ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://example.org"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Support Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                            value={formData.org_email || ''}
                                            onChange={(e) => setFormData({ ...formData, org_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                            value={formData.org_phone || ''}
                                            onChange={(e) => setFormData({ ...formData, org_phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold">Address</label>
                                        <textarea
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                            rows={3}
                                            value={formData.org_address || ''}
                                            onChange={(e) => setFormData({ ...formData, org_address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'integrations' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold border-b pb-4">Integrations & API Keys</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                                        <CreditCard className="text-[#2A8575] mt-1" />
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="font-bold">Payment Gateway (UPI)</h3>
                                                <p className="text-sm text-gray-500">Configure your UPI ID for receiving donations.</p>
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                                placeholder="example@upi"
                                                value={formData.upi_id || ''}
                                                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border">
                                        <Globe className="text-[#2A8575] mt-1" />
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="font-bold">Razorpay Configuration</h3>
                                                <p className="text-sm text-gray-500">Enter your live/test key for payment processing.</p>
                                            </div>
                                            <input
                                                type="password"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A8575]"
                                                placeholder="rzp_live_..."
                                                value={formData.razorpay_key || ''}
                                                onChange={(e) => setFormData({ ...formData, razorpay_key: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold border-b pb-4">Notification Preferences</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex gap-4">
                                            <Mail className="text-[#2A8575]" />
                                            <div>
                                                <h3 className="font-bold">Email Notifications</h3>
                                                <p className="text-sm text-gray-500">Receive alerts for new donations and campaign updates.</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.notifications_enabled}
                                                onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2A8575]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A8575]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
