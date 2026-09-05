
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventFormContent } from "./event-form/EventFormContent";

interface EventFormProps {
  initialData?: {
    id?: string;
    title?: string;
    date?: string;
    type?: string;
  };
  selectedDates?: Date[];
  onSuccess?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const EventForm = ({ 
  initialData, 
  selectedDates,
  onSuccess, 
  open: controlledOpen, 
  setOpen: setControlledOpen 
}: EventFormProps) => {
  const [open, setInternalOpen] = useState(false);
  const isEditing = !!initialData?.id;

  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = setControlledOpen || setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm" className="h-8 px-2">
            편집
          </Button>
        ) : initialData?.date ? null : (
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            새 일정
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "일정 편집" : "새 일정 추가"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "기존 일정 정보를 수정하세요."
              : "새로운 일정의 정보를 입력하세요."}
          </DialogDescription>
        </DialogHeader>

        <EventFormContent 
          initialData={initialData} 
          selectedDates={selectedDates}
          onSuccess={onSuccess} 
          setIsOpen={setIsOpen} 
        />
      </DialogContent>
    </Dialog>
  );
};
