
import { PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "./EventForm";
import { Event, useEventStore } from "@/lib/eventStore";
import { useEmployeeStore } from "@/lib/employeeStore";
import { EventCalendar } from "./event/EventCalendar";
import { DailyEventList } from "./event/DailyEventList";
import { MonthlyBirthdayList } from "./event/MonthlyBirthdayList";
import { supabase } from "@/integrations/supabase/client";

export const EventManagement = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const {
    events,
    fetchEvents,
    setupEventSubscription
  } = useEventStore();
  const {
    employees,
    getEmployeesWithBirthdaysThisMonth,
    fetchEmployees
  } = useEmployeeStore();
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [monthlyBirthdays, setMonthlyBirthdays] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchEmployees();

    // 실시간 이벤트 구독 설정
    const channel = setupEventSubscription();

    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      supabase.removeChannel(channel);
    };
  }, [fetchEvents, fetchEmployees, setupEventSubscription]);

  useEffect(() => {
    if (!date) return;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === selectedDate.getTime();
    });
    setTodayEvents(filteredEvents);

    const birthdayEmployees = getEmployeesWithBirthdaysThisMonth();
    setMonthlyBirthdays(birthdayEmployees);
  }, [date, events, getEmployeesWithBirthdaysThisMonth, employees]);

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleEventSuccess = () => {
    setShowEventForm(false);
  };

  return (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-md border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-700">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PartyPopper className="h-6 w-6 text-primary" />
            <span>일정 관리</span>
          </CardTitle>
          <CardDescription className="mt-1.5 text-base">
            일정과 행사를 추가, 편집, 삭제할 수 있습니다
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-50/30 before:via-indigo-50/20 before:to-purple-50/30 dark:before:from-slate-700/20 dark:before:via-slate-600/10 dark:before:to-slate-700/20 before:rounded-3xl before:-z-10 before:backdrop-blur-sm">
          {/* 일정 캘린더 - 전체 가로 */}
          <div className="relative z-10">
            <EventCalendar 
              date={date}
              setDate={setDate}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              events={events}
              employees={employees}
              onAddEvent={handleAddEvent}
            />
          </div>

          {/* 오늘 일정과 이달의 생일 - 나란히 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <DailyEventList 
              date={date}
              events={todayEvents}
            />
            
            <MonthlyBirthdayList 
              employees={monthlyBirthdays}
            />
          </div>
        </div>

        {date && <EventForm 
          initialData={{ date: date?.toISOString() }} 
          selectedDates={selectedDates}
          onSuccess={handleEventSuccess} 
          open={showEventForm}
          setOpen={setShowEventForm}
        />}
      </CardContent>
    </Card>
  );
};
