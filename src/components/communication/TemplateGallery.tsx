"use client";

import { Zap, Heart, Star, AlertCircle, Users, FileCheck, Calendar, Bell, Camera, Gift, Smile } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    icon: React.ReactNode;
    subject?: string;
    content: string;
}

interface TemplateGalleryProps {
    onSelectTemplate: (template: Template) => void;
    activeChannel: 'email' | 'whatsapp';
}

export default function TemplateGallery({ onSelectTemplate, activeChannel }: TemplateGalleryProps) {

    // Define templates directly here or import from a constant file
    const templates: Record<string, Template[]> = {
        email: [
            { id: 'birthday', name: 'Birthday Wish', icon: <Gift size={18} />, subject: 'Happy Birthday {{name}}!', content: 'Dear {{name}},\n\nWishing you a very Happy Birthday! May your day be filled with joy and laughter.\n\nThank you for being a part of our family.\n\nWarm regards,\nThe Team' },
            { id: 'anniversary', name: 'Anniversary Wish', icon: <Heart size={18} />, subject: 'Happy Anniversary {{name}}!', content: 'Dear {{name}},\n\nWishing you a wonderful Anniversary! Thank you for your continued support and journey with us.\n\nBest wishes,\nThe Team' },
            { id: 'newsletter', name: 'Newsletter', icon: <Zap size={18} />, subject: 'Updates from our NGO', content: 'Dear {{name}},\n\nWe are excited to share this month\'s progress with you.\n\n[Highlights]\n\nThank you for your continued support.' },
            { id: 'thankyou', name: 'Thank You', icon: <Heart size={18} />, subject: 'Thank you for your generous donation', content: 'Dear {{name}},\n\nThank you for your generous donation. Your support helps us achieve our mission.\n\nWarm regards,\nThe Team' },
            { id: 'impact', name: 'Impact Story', icon: <Star size={18} />, subject: 'See the lives you changed', content: 'Dear {{name}},\n\nBecause of you, we were able to...\n\n[Impact Story]\n\nThis would not be possible without you.' },
            { id: 'appeal', name: 'Urgent Appeal', icon: <AlertCircle size={18} />, subject: 'We need your help', content: 'Dear {{name}},\n\nWe are facing an urgent situation and need your support specifically for...\n\nEvery contribution counts.' },
            { id: 'volunteer', name: 'Volunteer', icon: <Users size={18} />, subject: 'Join us on the ground', content: 'Dear {{name}},\n\nWe are looking for volunteers for our upcoming event. Would you be interested in joining us?' },
            { id: 'tax', name: 'Tax Cert', icon: <FileCheck size={18} />, subject: 'Your Tax Exemption Certificate', content: 'Dear {{name}},\n\nPlease find attached your tax exemption certificate for the financial year.\n\nThank you for your support.' },
        ],
        whatsapp: [
            { id: 'birthday_wa', name: 'Birthday', icon: <Gift size={18} />, content: 'Happy Birthday {{name}}! 🎂 Wishing you a fantastic day filled with joy!' },
            { id: 'anniversary_wa', name: 'Anniversary', icon: <Heart size={18} />, content: 'Happy Anniversary {{name}}! 💖 Wishing you many more years of happiness together!' },
            { id: 'event_alert', name: 'Event Alert', icon: <Calendar size={18} />, content: 'Hi {{name}}! Join us for our upcoming event on [Date] at [Location]. Hope to see you there!' },
            { id: 'reminder', name: 'Reminder', icon: <Bell size={18} />, content: 'Hi {{name}}, this is a gentle reminder regarding your pledge. Your support means a lot to us.' },
            { id: 'update', name: 'Update', icon: <Camera size={18} />, content: 'Hi {{name}}! Just wanted to share a quick photo of our recent drive. Thanks to you, we served 500 meals today! 📸' },
            { id: 'festive', name: 'Greeting', icon: <Gift size={18} />, content: 'Wishing you and your family a very Happy Festival, {{name}}! May this season bring you joy and light. ✨' },
            { id: 'thankyou_short', name: 'Thanks', icon: <Smile size={18} />, content: 'Thank you for your support, {{name}}! We really appreciate it. 🙏' },
        ]
    };

    const currentTemplates = templates[activeChannel] || [];

    return (
        <div className="w-full">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {currentTemplates.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onSelectTemplate(t)}
                        className="group flex flex-col items-start gap-2 p-4 min-w-[160px] bg-white border border-[#E6E4DC] rounded-xl text-left hover:border-[#2A8575] hover:shadow-md transition-all duration-200"
                    >
                        <div className="p-2 rounded-lg bg-[#F0F2F5] text-[#2A8575] group-hover:bg-[#2A8575] group-hover:text-white transition-colors">
                            {t.icon}
                        </div>
                        <span className="text-sm font-bold text-gray-800 group-hover:text-[#2A8575]">{t.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
