
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeStore } from './store';

// Set up real-time subscription for employees
export const setupEmployeeSubscription = () => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employees',
      },
      () => {
        // Fetch updated employees on any change
        useEmployeeStore.getState().fetchEmployees();
      }
    )
    .subscribe();

  return channel;
};
