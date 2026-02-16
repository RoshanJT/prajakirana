"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up Logic
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: 'Admin User', // Default metadata
                        }
                    }
                });
                if (error) throw error;
                alert('Sign up successful! Please log in with your new account.');
                setIsSignUp(false); // Switch back to login
            } else {
                // Login Logic
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Redirect to dashboard on success
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="card login-card">
                <div className="flex flex-col items-center gap-2" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div className="login-logo-container">
                        <Image src="/logo-new.jpg" alt="Prajakirana Seva Logo" width={100} height={100} style={{ borderRadius: '50%', border: '4px solid var(--primary)' }} />
                    </div>
                    <h1 className="font-bold login-title">PRAJAKIRANA SEVA<br />CHARITABLE TRUST</h1>
                    <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.9rem' }}>{isSignUp ? 'Create your admin account' : 'Sign in to access dashboard'}</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Email Address</label>
                        <input
                            type="email"
                            required
                            className="input"
                            placeholder="you@example.com"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Password</label>
                        <input
                            type="password"
                            required
                            className="input"
                            placeholder="••••••••"
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        style={{ marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading
                            ? (isSignUp ? 'Creating Account...' : 'Signing in...')
                            : (isSignUp ? 'Sign Up' : 'Sign In')
                        }
                    </button>
                </form>

                {/* 
                <p className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginLeft: '0.5rem'
                        }}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p> 
                */}
            </div>
        </div>
    );
}
