
import React from "react";
import { 
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface TitleFieldProps {
  field: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLTextAreaElement>;
  };
}

export const TitleField: React.FC<TitleFieldProps> = ({ field }) => {
  return (
    <FormItem>
      <FormLabel>일정 내용</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="일정 내용을 자유롭게 입력하세요" 
          className="resize-none min-h-[80px]" 
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
