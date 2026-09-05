
import React from "react";
import { Paperclip, File, ExternalLink } from "lucide-react";
import { Task } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskAttachmentsProps {
  task: Task;
}

export function TaskAttachments({ task }: TaskAttachmentsProps) {
  if (!task.attachments || task.attachments.length === 0) {
    return null;
  }

  const openAttachment = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('task_attachments')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds

      if (error) {
        console.error('Error creating signed URL:', error);
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
    }
  };

  const getFileName = (filePath: string) => {
    // For new format filenames (timestamp_random.ext), extract just the filename
    if (filePath.includes('.')) {
      // This is likely a new format filename, which is timestamp_random.ext
      // We'll display original filename if available, otherwise the path
      return filePath;
    }
    
    // For old format filenames, try to extract the original filename
    return filePath.split('_').slice(1).join('_') || filePath;
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        <Paperclip className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">첨부 파일 ({task.attachments.length})</span>
      </div>
      <div className="space-y-1.5">
        {task.attachments.map((attachment, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <File className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{getFileName(attachment)}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => openAttachment(attachment)} 
                    className="h-6 w-6"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>파일 열기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  );
}
