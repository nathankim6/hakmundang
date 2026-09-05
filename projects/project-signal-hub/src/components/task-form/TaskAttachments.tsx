
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Paperclip, X, File, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./TaskFormFields";

interface TaskAttachmentsProps {
  form: UseFormReturn<FormValues>;
}

export function TaskAttachments({ form }: TaskAttachmentsProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    
    // Add file names to form values
    const currentAttachments = form.getValues("attachments") || [];
    form.setValue("attachments", [...currentAttachments, ...newFiles.map(file => file.name)], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        // Create a unique file path using UUID to avoid filename encoding issues
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const fileExtension = file.name.split('.').pop();
        const safeFilePath = `${timestamp}_${randomStr}.${fileExtension}`;
        
        console.log("Uploading file:", file.name);
        console.log("Safe file path:", safeFilePath);
        
        const { error: uploadError, data } = await supabase.storage
          .from('task_attachments')
          .upload(safeFilePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
        
        // Store both the safe path and original filename for display purposes
        return {
          path: safeFilePath,
          originalName: file.name
        };
      });

      const fileResults = await Promise.all(uploadPromises);
      const filePaths = fileResults.map(result => result.path);
      
      // Store metadata about the original filenames in a separate form field
      const fileMetadata = fileResults.map(result => ({
        path: result.path,
        originalName: result.originalName
      }));
      
      // Update form with the file paths
      form.setValue("filePaths", [...(form.getValues("filePaths") || []), ...filePaths], {
        shouldValidate: true,
        shouldDirty: true,
      });
      
      // Store additional metadata if needed
      form.setValue("fileMetadata", [...(form.getValues("fileMetadata") || []), ...fileMetadata], {
        shouldValidate: true,
        shouldDirty: true,
      });
      
      toast({
        title: "파일 업로드 완료",
        description: `${files.length}개의 파일이 업로드되었습니다.`,
      });
      
      // Clear the file input
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "업로드 실패",
        description: "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    // Remove file from local state
    setFiles(files.filter((_, i) => i !== index));
    
    // Remove file name from form
    const attachments = form.getValues("attachments") || [];
    form.setValue("attachments", attachments.filter((_, i) => i !== index), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <FormField
      control={form.control}
      name="attachments"
      render={({ field }) => (
        <FormItem>
          <FormLabel>첨부 파일</FormLabel>
          <FormControl>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>파일 선택</span>
                </Button>
                {files.length > 0 && (
                  <Button 
                    type="button" 
                    variant="default" 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? "업로드 중..." : "업로드"}</span>
                  </Button>
                )}
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {files.length > 0 && (
                <div className="bg-muted/50 rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium">선택된 파일:</p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <File className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {form.getValues("filePaths")?.length > 0 && (
                <div className="bg-muted/50 rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium">업로드된 파일:</p>
                  <ul className="space-y-2">
                    {form.getValues("filePaths")?.map((filePath: string, index: number) => {
                      // Display the original filename if available, otherwise use the path
                      const fileMetadata = form.getValues("fileMetadata") || [];
                      const metadata = fileMetadata[index];
                      const displayName = metadata?.originalName || filePath.split('_').slice(1).join('_');
                      
                      return (
                        <li key={index} className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <File className="h-4 w-4 shrink-0" />
                            <span className="truncate">{displayName}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </FormControl>
          <FormDescription>
            업무에 관련된 파일을 첨부할 수 있습니다 (선택사항)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
