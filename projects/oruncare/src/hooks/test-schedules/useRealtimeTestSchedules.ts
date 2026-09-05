
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TestSchedule } from '@/types/calendar';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to listen for real-time test schedule updates and synchronize the UI
 * @param enabled Whether to enable the real-time subscription
 * @returns Information about the subscription status
 */
export const useRealtimeTestSchedules = (enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to real-time updates for test_schedules table
    const channel = supabase
      .channel('test_schedules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_schedules' },
        (payload) => {
          console.log('Real-time test schedule update received:', payload);
          setLastUpdate(new Date());

          // Get the updated schedule from the payload
          const updatedSchedule = payload.new as TestSchedule;
          
          // For INSERT or UPDATE events, update the specific item in the cache
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Update the React Query cache for better performance
            queryClient.setQueryData(['test_schedules'], (oldData: any) => {
              if (!Array.isArray(oldData)) return oldData;
              
              // Check if the item exists in the cache
              const itemExists = oldData.some((item: TestSchedule) => item.id === updatedSchedule.id);
              
              if (itemExists) {
                // Update existing item
                return oldData.map((item: TestSchedule) => 
                  item.id === updatedSchedule.id ? {...item, ...updatedSchedule} : item
                );
              } else {
                // Add new item
                return [...oldData, updatedSchedule];
              }
            });
          } 
          // For DELETE events, remove the item from the cache
          else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['test_schedules'], (oldData: any) => {
              if (!Array.isArray(oldData)) return oldData;
              
              return oldData.filter((item: TestSchedule) => item.id !== payload.old.id);
            });
          }

          // Finally, invalidate the queries to ensure data consistency
          queryClient.invalidateQueries({ queryKey: ['test_schedules'] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    setIsSubscribed(true);
    console.log('Realtime subscription enabled for test schedules');

    // Cleanup subscription when component unmounts
    return () => {
      console.log('Cleaning up realtime subscription');
      channel.unsubscribe();
      setIsSubscribed(false);
    };
  }, [queryClient, enabled]);

  return { isSubscribed, lastUpdate };
};
