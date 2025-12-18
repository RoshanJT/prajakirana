"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Megaphone, Settings, HeartHandshake, LogOut } from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Donors", href: "/donors", icon: Users },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Communication", href: "/communication", icon: HeartHandshake },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (pathname === '/login') return null;


    return (
        <aside className="sidebar flex flex-col justify-between h-full">
            <div>
                <div className="logo">
                    <Image src="/logo-new.jpg" alt="Prajakirana Seva Logo" width={48} height={48} />
                    <span>PRAJAKIRANA SEVA</span>
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
