
import React, { useState } from "react";
import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface DateFieldTabsProps {
  date: Date;
  dateText: string;
  dateError: string;
  setDateText: (text: string) => void;
  setDateError: (error: string) => void;
  handleCalendarSelect: (date: Date | undefined) => void;
  handleDateTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tab: string;
  setTab: (tab: string) => void;
}

export const DateFieldTabs: React.FC<DateFieldTabsProps> = ({
  date,
  dateText,
  dateError,
  handleCalendarSelect,
  handleDateTextChange,
  tab,
  setTab,
}) => {
  return (
    <FormItem className="flex flex-col">
      <FormLabel>날짜</FormLabel>
      <Tabs defaultValue="calendar" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
          <TabsTrigger value="text">직접 입력</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="pt-2">
          <div className="w-full border rounded-md overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
              locale={ko}
              className="w-full"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="pt-2">
          <FormControl>
            <div className="space-y-2">
              <Input
                placeholder="YYYY-MM-DD"
                value={dateText}
                onChange={handleDateTextChange}
              />
              {dateError && (
                <p className="text-sm text-red-500">{dateError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                날짜 형식: YYYY-MM-DD (예: 2024-04-15)
              </p>
            </div>
          </FormControl>
        </TabsContent>
      </Tabs>
      <FormMessage />
    </FormItem>
  );
};
