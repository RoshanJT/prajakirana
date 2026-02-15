"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import RecipientSidebar from '@/components/communication/RecipientSidebar';
import TemplateGallery from '@/components/communication/TemplateGallery';
import MessageComposer from '@/components/communication/MessageComposer';
import { Mail, MessageCircle } from 'lucide-react';

interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string;
    donor_type: string;
}

export default function CommunicationPage() {
    const supabase = createClient();

    // State
    const [donors, setDonors] = useState<Donor[]>([]);
    const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp'>('email');
    const [selectedDonors, setSelectedDonors] = useState<string[]>([]);

    // Message State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchDonors = async () => {
            console.log("Fetching donors...");
            const { data, error } = await supabase
                .from('donors')
                .select('id, name, email, phone, type');

            if (error) {
                console.error("Error fetching donors:", error);
                alert("Failed to load donors. Check console for details.");
                return;
            }

            console.log("Donors fetched:", data);

            if (data) {
                // Map 'type' to 'donor_type' to match component expectation if needed, 
                // or just pass it through. RecipientSidebar expects 'donor_type', let's fix that map.
                // Format donors for the sidebar
                const formattedDonors: Donor[] = (data || []).map((d: unknown) => {
                    const donor = d as { id: string; name: string; email: string; phone: string; type: string }; // Cast to original fetched type
                    return {
                        id: donor.id,
                        name: donor.name,
                        email: donor.email,
                        phone: donor.phone,
                        donor_type: donor.type // Map 'type' column to 'donor_type' prop
                    };
                });
                setDonors(formattedDonors);
            }
        };
        fetchDonors();
    }, []);

    // Handlers
    const handleChannelChange = (channel: 'email' | 'whatsapp') => {
        setActiveChannel(channel);
        setSelectedDonors([]); // Reset selection on channel change
        setSubject('');
        setMessage('');
    };

    const handleToggleDonor = (id: string, selected: boolean) => {
        if (selected) {
            setSelectedDonors(prev => [...prev, id]);
        } else {
            setSelectedDonors(prev => prev.filter(dId => dId !== id));
        }
    };

    const handleToggleAll = (ids: string[], selected: boolean) => {
        if (selected) {
            // Add all ids that aren't already selected
            setSelectedDonors(prev => {
                const newIds = ids.filter(id => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            // Remove all ids
            setSelectedDonors(prev => prev.filter(id => !ids.includes(id)));
        }
    };

    const handleSelectTemplate = (template: { subject?: string; content: string }) => {
        setMessage(template.content);
        if (template.subject) setSubject(template.subject);
    };

    const handleSend = async () => {
        const recipients = donors.filter(d => selectedDonors.includes(d.id));

        if (activeChannel === 'email') {
            if (recipients.length === 0) {
                alert("Please select at least one recipient.");
                return;
            }
            setIsSending(true);
            try {
                // Send array of { email, name } for personalization
                const recipientData = recipients
                    .filter(d => d.email)
                    .map(d => ({ email: d.email, name: d.name }));

                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipients: recipientData, // Changed from flat array to objects
                        subject: subject,
                        message: message
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Failed to send');

                // Log communication in Supabase
                const { error: dbError } = await supabase
                    .from('communications')
                    .insert(selectedDonors.map(donorId => ({
                        donor_id: donorId,
                        type: 'Email',
                        subject: subject,
                        content: message, // Log the template message (actual sent is personalized)
                        status: 'Sent',
                        direction: 'Outbound',
                        date: new Date().toISOString()
                    })));

                if (dbError) throw dbError;

                alert(`Successfully sent emails to ${recipientData.length} recipients.`);
                // Reset after success
                setSubject('');
                setMessage('');
                setSelectedDonors([]);
            } catch (error: any) {
                console.error("Batch Email Fetch Error:", error);

                let errorMessage = "Failed to send emails.";
                if (error instanceof TypeError && error.message === "Failed to fetch") {
                    errorMessage = "Network error: Could not connect to the server. Please check if the server is running.";
                } else if (error.message) {
                    errorMessage = `Error: ${error.message}`;
                }

                alert(errorMessage);
            } finally {
                setIsSending(false);
            }
        } else {
            // WhatsApp Logic
            if (recipients.length === 0) {
                alert("Please select at least one recipient.");
                return;
            }
            if (recipients.length === 1) {
                const donor = recipients[0];
                const phone = donor.phone?.replace(/\D/g, '');
                if (phone) {
                    // Personalize message for WhatsApp
                    const personalizedMessage = message.replace(/{{name}}/g, donor.name);
                    const text = encodeURIComponent(personalizedMessage);
                    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');

                    // Log WhatsApp communication
                    await supabase
                        .from('communications')
                        .insert({
                            donor_id: donor.id,
                            type: 'WhatsApp',
                            content: personalizedMessage,
                            status: 'Sent', // Assumed sent if opened
                            direction: 'Outbound',
                            date: new Date().toISOString()
                        });

                    setSelectedDonors([]);
                    setMessage('');
                } else {
                    alert('Selected donor does not have a valid phone number.');
                }
            } else {
                alert("Please select exactly one donor for WhatsApp (Click-to-Chat limitation).");
            }
        }
    };

    return (
        <div>
            {/* Page Header */}
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-xl font-bold">Communication Center</h1>
                    <p className="text-muted">Manage outreach campaigns and donor updates</p>
                </div>

                {/* Channel Switcher */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleChannelChange('email')}
                        className={`btn ${activeChannel === 'email' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        <Mail size={18} /> Email
                    </button>
                    <button
                        onClick={() => handleChannelChange('whatsapp')}
                        className={`btn ${activeChannel === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        <MessageCircle size={18} /> WhatsApp
                    </button>
                </div>
            </header>

            {/* Quick Templates */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-sm font-bold text-muted uppercase" style={{ marginBottom: '1rem' }}>Quick Templates</h2>
                <TemplateGallery
                    activeChannel={activeChannel}
                    onSelectTemplate={handleSelectTemplate}
                />
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Recipients Card */}
                <div className="card lg:w-[350px] flex-shrink-0">
                    <RecipientSidebar
                        donors={donors}
                        selectedDonors={selectedDonors}
                        onToggleDonor={handleToggleDonor}
                        onToggleAll={handleToggleAll}
                        activeChannel={activeChannel}
                    />
                </div>

                {/* Message Composer Card */}
                <div className="card flex-1">
                    <MessageComposer
                        activeChannel={activeChannel === 'email' ? 'Email' : 'WhatsApp'}
                        subject={subject}
                        onSubjectChange={setSubject}
                        message={message}
                        onMessageChange={setMessage}
                        onSend={handleSend}
                        isSending={isSending}
                        selectedDonors={donors.filter(d => selectedDonors.includes(d.id))}
                    />
                </div>
            </div>
        </div>
    );
}
