'use client'

import { createClient } from '@/utils/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
    user: User | null
    session: Session | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, session, loading }}>
            <AuthGuard>{children}</AuthGuard>
        </AuthContext.Provider>
    )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = require('next/navigation').useRouter()
    const pathname = require('next/navigation').usePathname()

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/login') {
                router.push('/login')
            } else if (user && pathname === '/login') {
                router.push('/')
            }
        }
    }, [user, loading, pathname, router])

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading...
            </div>
        )
    }

    if (!user && pathname !== '/login') {
        return null; // Prevent flash of content
    }

    return <>{children}</>
}
