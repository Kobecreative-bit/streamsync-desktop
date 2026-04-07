import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { PlanTier } from '../lib/planConfig'

export interface UserProfile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  bio?: string
  plan: PlanTier
  team_id: string | null
  onboarded: boolean
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  loadProfile: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
  markOnboarded: () => Promise<void>
  updateProfile: (updates: { display_name?: string; avatar_url?: string; bio?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  clearError: (): void => {
    set({ error: null })
  },

  signIn: async (email: string, password: string): Promise<void> => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      set({ user: data.user })
      await get().loadProfile()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, name: string): Promise<void> => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name }
        }
      })
      if (error) throw error
      set({ user: data.user })

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          display_name: name,
          plan: 'starter',
          team_id: null,
          onboarded: false
        })
        if (profileError) {
          console.error('Failed to create profile:', profileError.message)
        }
        await get().loadProfile()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  signOut: async (): Promise<void> => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, profile: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  loadProfile: async (): Promise<void> => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, bio, plan, team_id, onboarded')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to load profile:', error.message)
        set({
          profile: {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.display_name || 'User',
            plan: 'starter',
            team_id: null,
            onboarded: false
          }
        })
        return
      }

      set({
        profile: {
          ...(data as UserProfile),
          onboarded: data.onboarded ?? false
        }
      })
    } catch (err) {
      console.error('Profile load error:', err)
    }
  },

  markOnboarded: async (): Promise<void> => {
    const { user, profile } = get()
    if (!user || !profile) return

    // Update locally immediately
    set({ profile: { ...profile, onboarded: true } })

    // Persist to Supabase
    try {
      await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user.id)
    } catch (err) {
      console.error('Failed to mark onboarded:', err)
    }
  },

  updateProfile: async (updates: { display_name?: string; avatar_url?: string; bio?: string }): Promise<void> => {
    const { user, profile } = get()
    if (!user || !profile) return

    // Update locally immediately
    set({ profile: { ...profile, ...updates } })

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (error) throw error
    } catch (err) {
      console.error('Failed to update profile:', err)
      // Revert on failure
      set({ profile })
      set({ error: 'Failed to update profile' })
    }
  },

  initialize: async (): Promise<void> => {
    set({ loading: true })
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        set({ user: data.session.user })
        await get().loadProfile()
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        get().loadProfile()
      } else {
        set({ user: null, profile: null })
      }
    })
  }
}))
