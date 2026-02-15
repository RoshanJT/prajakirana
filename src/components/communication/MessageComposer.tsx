"use client";

import { Send, Smartphone, Mail } from 'lucide-react';

interface Donor {
    id: string;
    name: string;
    email?: string;
    phone?: string;
}

interface MessageComposerProps {
    activeChannel: 'Email' | 'WhatsApp';
    subject: string;
    message: string;
    onSubjectChange: (s: string) => void;
    onMessageChange: (m: string) => void;
    onSend: () => void;
    isSending: boolean;
    selectedDonors: Donor[];
}

export default function MessageComposer({
    activeChannel,
    subject,
    message,
    onSubjectChange,
    onMessageChange,
    onSend,
    isSending,
    selectedDonors
}: MessageComposerProps) {
    // Format recipient names for display
    const recipientNames = selectedDonors.length > 0
        ? selectedDonors.slice(0, 3).map(d => d.name).join(', ') + (selectedDonors.length > 3 ? ` +${selectedDonors.length - 3} others` : '')
        : 'No recipients selected';
    return (
        <div className="flex flex-col h-full">
            {/* Toolbar / Header */}
            <div className="pb-4 mb-4 flex justify-between items-center border-b border-[#E6E4DC]">
                <div className="flex items-center gap-2 text-[#2A8575] font-bold text-base uppercase tracking-wider">
                    {activeChannel === 'Email' ? <Mail size={16} /> : <Smartphone size={16} />}
                    <span className="capitalize">{activeChannel} Composer</span>
                </div>
            </div>

            {/* To Field */}
            <div className="mb-4 flex items-center gap-3">
                <span className="font-bold text-[#1F4D45] text-sm w-12">To:</span>
                <div className="flex-1 bg-[#F9F7F0] border border-[#E6E4DC] rounded-lg px-3 py-2 text-sm text-[#1F4D45] truncate">
                    {recipientNames}
                </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {activeChannel === 'Email' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase">Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => onSubjectChange(e.target.value)}
                            placeholder="Enter a compelling subject..."
                            className="w-full text-base font-semibold text-[#1F4D45] placeholder-gray-400 bg-white border border-[#E6E4DC] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2A8575]/20 focus:border-[#2A8575] transition-all"
                        />
                    </div>
                )}

                <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-xs font-bold text-muted uppercase">Message Body</label>
                    <textarea
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="Write your message here..."
                        className="flex-1 w-full resize-none text-base leading-relaxed text-[#1F4D45] placeholder-gray-400 bg-white border border-[#E6E4DC] rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#2A8575]/20 focus:border-[#2A8575] transition-all"
                        style={{ minHeight: '200px' }}
                    />
                </div>
            </div>

            {/* Footer / Send Button */}
            <div className="pt-4 mt-4 flex justify-between items-center border-t border-[#E6E4DC]">
                <span className="text-sm text-muted">
                    Sending to <strong className="text-[#1F4D45]">{selectedDonors.length}</strong> recipients
                </span>
                <button
                    onClick={onSend}
                    disabled={isSending || selectedDonors.length === 0}
                    className="btn btn-primary"
                >
                    {isSending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Send {activeChannel === 'Email' ? 'Email' : 'WhatsApp'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
