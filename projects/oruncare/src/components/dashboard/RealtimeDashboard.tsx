
import { useState, useEffect } from 'react';
import TestResultsDashboard from './TestResultsDashboard';
import { useRealtimeTestSchedules } from '@/hooks/test-schedules/useRealtimeTestSchedules';

interface RealtimeDashboardProps {
  selectedDate: Date;
  onClose: () => void;
  selectedTeacher: string;
}

const RealtimeDashboard = ({ selectedDate, onClose, selectedTeacher }: RealtimeDashboardProps) => {
  // Enable real-time updates for test schedules with the enhanced hook
  const { isSubscribed, lastUpdate } = useRealtimeTestSchedules();
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    console.log('RealtimeDashboard real-time subscription status:', isSubscribed);
  }, [isSubscribed]);

  // Track when updates occur to trigger re-renders
  useEffect(() => {
    if (lastUpdate) {
      console.log('Dashboard received real-time update at:', lastUpdate);
      setUpdateCount(prev => prev + 1);
    }
  }, [lastUpdate]);

  return (
    <TestResultsDashboard
      selectedDate={selectedDate}
      onClose={onClose}
      selectedTeacher={selectedTeacher}
      key={`dashboard-${updateCount}`} // Force re-render on real-time updates
    />
  );
};

export default RealtimeDashboard;
