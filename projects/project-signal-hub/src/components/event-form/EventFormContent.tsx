
import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEventStore } from "@/lib/eventStore";
import { TitleField } from "./TitleField";
import { DateFieldTabs } from "./DateFieldTabs";
import { FormButtons } from "./FormButtons";

interface EventFormContentProps {
  initialData?: {
    id?: string;
    title?: string;
    date?: string;
    type?: string;
  };
  selectedDates?: Date[];
  onSuccess?: () => void;
  setIsOpen: (open: boolean) => void;
}

export const EventFormContent: React.FC<EventFormContentProps> = ({ 
  initialData, 
  selectedDates = [],
  onSuccess, 
  setIsOpen 
}) => {
  const [dateInputTab, setDateInputTab] = useState<string>("calendar");
  const [dateText, setDateText] = useState("");
  const [dateError, setDateError] = useState("");
  const { toast } = useToast();
  const { addEvent, updateEvent } = useEventStore();
  const isEditing = !!initialData?.id;

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      type: initialData?.type || "event",
    },
  });

  useEffect(() => {
    const date = initialData?.date ? new Date(initialData.date) : new Date();
    const eventType = initialData?.type || "event";
    form.reset({
      title: initialData?.title || "",
      date: date,
      type: eventType,
    });
    setDateText(format(date, "yyyy-MM-dd"));
  }, [initialData, form]);

  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateText(e.target.value);
    setDateError("");
    
    try {
      if (e.target.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
        if (!isNaN(parsedDate.getTime())) {
          form.setValue("date", parsedDate);
        } else {
          setDateError("유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해주세요.");
        }
      }
    } catch (error) {
      setDateError("유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식으로 입력해주세요.");
    }
  };

  useEffect(() => {
    const date = form.watch("date");
    if (date) {
      setDateText(format(date, "yyyy-MM-dd"));
    }
  }, [form.watch("date")]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue("date", date);
      setDateText(format(date, "yyyy-MM-dd"));
    }
  };

  const onSubmit = async (values: { title: string; date: Date; type: string }) => {
    try {
      // Default type to "event" if it's not provided
      const finalType = values.type || "event";
      
      if (isEditing && initialData?.id) {
        await updateEvent(initialData.id, {
          title: values.title,
          date: format(values.date, "yyyy-MM-dd"),
          type: finalType,
        });
        toast({
          title: "일정 업데이트 완료",
          description: "일정이 성공적으로 업데이트되었습니다.",
        });
      } else {
        // 선택된 여러 날짜가 있으면 각각에 대해 일정 추가
        if (selectedDates.length > 1) {
          for (const selectedDate of selectedDates) {
            await addEvent({
              title: values.title,
              date: format(selectedDate, "yyyy-MM-dd"),
              type: finalType,
            });
          }
          toast({
            title: "일정 추가 완료",
            description: `${selectedDates.length}개 날짜에 일정이 추가되었습니다.`,
          });
        } else {
          await addEvent({
            title: values.title,
            date: format(values.date, "yyyy-MM-dd"),
            type: finalType,
          });
          toast({
            title: "일정 추가 완료",
            description: "새로운 일정이 추가되었습니다.",
          });
        }
      }

      form.reset();
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "오류 발생",
        description: "일정 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => <TitleField field={field} />}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="일정 카테고리를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="elementary">초등</SelectItem>
                  <SelectItem value="middle">중등</SelectItem>
                  <SelectItem value="high">고등</SelectItem>
                  <SelectItem value="event">기타(행사)</SelectItem>
                  <SelectItem value="personal">개인일정</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <DateFieldTabs
              date={field.value}
              dateText={dateText}
              dateError={dateError}
              setDateText={setDateText}
              setDateError={setDateError}
              handleCalendarSelect={handleCalendarSelect}
              handleDateTextChange={handleDateTextChange}
              tab={dateInputTab}
              setTab={setDateInputTab}
            />
          )}
        />

        <FormButtons isEditing={isEditing} onCancel={() => setIsOpen(false)} />
      </form>
    </Form>
  );
};
