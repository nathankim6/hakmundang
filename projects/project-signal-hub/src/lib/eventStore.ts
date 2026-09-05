
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  time?: string; // Add the optional time property
  created_at: string;
  updated_at: string;
}

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  
  // Event actions
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<Event | null>;
  updateEvent: (id: string, event: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setupEventSubscription: () => any; // Return type of supabase.channel()
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      set({ events: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  addEvent: async (event) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // No need to update state as the real-time subscription will handle it
      set({ isLoading: false });
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
  
  updateEvent: async (id, eventUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('events')
        .update(eventUpdate)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // No need to update state as the real-time subscription will handle it
      set({ isLoading: false });
    } catch (error) {
      console.error('Error updating event:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // No need to update state as the real-time subscription will handle it
      set({ isLoading: false });
    } catch (error) {
      console.error('Error deleting event:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  setupEventSubscription: () => {
    const channel = supabase
      .channel('event-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          const newEvent = payload.new as Event;
          set((state) => ({
            events: [...state.events, newEvent].sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          }));
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        (payload) => {
          const updatedEvent = payload.new as Event;
          set((state) => ({
            events: state.events.map((event) => 
              event.id === updatedEvent.id ? updatedEvent : event
            ).sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          }));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'events' },
        (payload) => {
          const deletedEvent = payload.old as Event;
          set((state) => ({
            events: state.events.filter((event) => event.id !== deletedEvent.id)
          }));
        }
      )
      .subscribe();
    
    return channel;
  }
}));
