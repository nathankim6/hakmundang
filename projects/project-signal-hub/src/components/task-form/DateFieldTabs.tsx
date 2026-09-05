
import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface DateFieldTabsProps {
  date: Date | undefined;
  text: string;
  error: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateFieldTabs: React.FC<DateFieldTabsProps> = ({
  date,
  text,
  error,
  onDateChange,
  onTextChange,
  activeTab,
  onTabChange,
}) => {
  return (
    <FormItem className="flex flex-col">
      <Tabs defaultValue="calendar" value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">캘린더</TabsTrigger>
          <TabsTrigger value="text">직접 입력</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="pt-2">
          <div className="w-full border rounded-md overflow-hidden">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
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
                value={text}
                onChange={onTextChange}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                날짜 형식: YYYY-MM-DD (예: 2024-04-15)
              </p>
            </div>
          </FormControl>
        </TabsContent>
      </Tabs>
      <FormDescription>
        업무를 완료해야 하는 날짜를 선택하세요.
      </FormDescription>
      <FormMessage />
    </FormItem>
  );
};
