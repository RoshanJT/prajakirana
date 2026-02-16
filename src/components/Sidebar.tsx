"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Megaphone, Settings, HeartHandshake, LogOut, X } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Donors", href: "/donors", icon: Users },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Communication", href: "/communication", icon: HeartHandshake },
    { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
    isMobileMenuOpen?: boolean;
    onCloseMobileMenu?: () => void;
}

export default function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const handleNavClick = () => {
        // Close mobile menu when navigation item is clicked
        if (onCloseMobileMenu) {
            onCloseMobileMenu();
        }
    };

    if (pathname === '/login') return null;

    return (
        <aside className={`sidebar flex flex-col justify-between h-full ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Image src="/logo-new.jpg" alt="Prajakirana Seva Logo" width={48} height={48} />
                        <span>PRAJAKIRANA SEVA</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        className="mobile-close-btn"
                        onClick={onCloseMobileMenu}
                        style={{
                            padding: '0.5rem',
                            color: 'var(--primary)',
                            display: 'none'
                        }}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                                onClick={handleNavClick}
                            >
                                <Icon size={22} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={handleLogout}
                    className="nav-item w-full"
                    style={{ color: '#ef4444', justifyContent: 'flex-start' }}
                >
                    <LogOut size={22} />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
