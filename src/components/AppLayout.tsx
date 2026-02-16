"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (isLoginPage) {
        return (
            <main style={{ width: '100%', minHeight: '100vh' }}>
                {children}
            </main>
        );
    }

    return (
        <div className="app-layout">
            {/* Mobile Menu Button */}
            {/* Mobile Menu Button - Hidden when menu is open */}
            {!isMobileMenuOpen && (
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                    style={{ padding: 0, overflow: 'hidden', border: '2px solid white' }}
                >
                    <img
                        src="/logo-new.jpg"
                        alt="Menu"
                        style={{
                            width: '45px',
                            height: '45px',
                            objectFit: 'cover'
                        }}
                    />
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
