"use client";

import { useState } from 'react';
import { Mail, MessageCircle, Send, FileText } from 'lucide-react';

export default function CommunicationPage() {
    const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const templates = {
        email: [
            { id: 'newsletter', name: 'Monthly Newsletter', subject: 'Updates from our NGO', content: 'Dear [Name],\n\nHere are the updates for this month...' },
            { id: 'thankyou', name: 'Donation Thank You', subject: 'Thank you for your donation', content: 'Dear [Name],\n\nThank you for your generous donation of [Amount]...' },
        ],
        whatsapp: [
            { id: 'event_alert', name: 'Event Alert', content: 'Hi [Name], join us for our upcoming event on [Date]!' },
            { id: 'reminder', name: 'Donation Reminder', content: 'Hi [Name], this is a gentle reminder for your recurring donation.' },
        ]
    };

    const handleSend = () => {
        setMessageStatus('sending');
        setTimeout(() => {
            setMessageStatus('sent');
            setTimeout(() => setMessageStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <div>
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-xl font-bold">Communication Center</h1>
                    <p className="text-muted">Engage with your donors via Email and WhatsApp</p>
                </div>
            </header>

            <div className="flex gap-6">
                <div className="card" style={{ flex: 1 }}>
                    <div className="flex gap-4" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <button
                            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('email')}
                        >
                            <Mail size={18} /> Email Campaigns
                        </button>
                        <button
                            className={`btn ${activeTab === 'whatsapp' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('whatsapp')}
                        >
                            <MessageCircle size={18} /> WhatsApp Messages
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold">Select Template</label>
                            <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {templates[activeTab].map((template) => (
                                    <div
                                        key={template.id}
                                        className="card"
                                        style={{
                                            cursor: 'pointer',
                                            borderColor: selectedTemplate === template.id ? 'var(--primary)' : 'var(--border-color)',
                                            background: selectedTemplate === template.id ? 'var(--primary-light)' : 'var(--bg-card)'
                                        }}
                                        onClick={() => setSelectedTemplate(template.id)}
                                    >
                                        <div className="flex items-center gap-2 font-bold" style={{ marginBottom: '0.5rem' }}>
                                            <FileText size={16} /> {template.name}
                                        </div>
                                        <p className="text-sm text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {'subject' in template ? template.subject : template.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold">Message Preview</label>
                            <textarea
                                className="input"
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    fontFamily: 'inherit'
                                }}
                                value={
                                    selectedTemplate
                                        ? (templates[activeTab].find(t => t.id === selectedTemplate) as any)?.content
                                        : 'Select a template to preview...'
                                }
                                readOnly
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="btn btn-primary"
                                disabled={!selectedTemplate || messageStatus === 'sending'}
                                onClick={handleSend}
                            >
                                {messageStatus === 'sending' ? 'Sending...' : messageStatus === 'sent' ? 'Sent Successfully!' : 'Send Broadcast'}
                                {messageStatus === 'idle' && <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ width: '300px' }}>
                    <h3 className="text-lg font-bold" style={{ marginBottom: '1rem' }}>Audience Summary</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between">
                            <span className="text-muted">Total Recipients</span>
                            <span className="font-bold">1,240</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Active Donors</span>
                            <span className="font-bold">850</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Recurring</span>
                            <span className="font-bold">120</span>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }}></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">Estimated Cost</span>
                            <span className="text-xl font-bold">₹0.00</span>
                        </div>
                        <p className="text-xs text-muted">Mock integration active. No actual messages will be sent.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
