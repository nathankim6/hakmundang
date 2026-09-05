
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Upload } from "lucide-react";

interface Background {
  id: string;
  url: string;
  is_video: boolean;
  created_at?: string;
}

export const BackgroundManager = () => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('backgrounds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBackgrounds(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching backgrounds",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('backgrounds')
        .insert([
          {
            url: publicUrl,
            is_video: file.type.startsWith('video/')
          }
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Background uploaded successfully",
      });

      fetchBackgrounds();
    } catch (error: any) {
      toast({
        title: "Error uploading background",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('backgrounds')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete from storage
      const filePath = url.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('backgrounds')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      toast({
        title: "Success",
        description: "Background deleted successfully",
      });

      fetchBackgrounds();
    } catch (error: any) {
      toast({
        title: "Error deleting background",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="max-w-xs"
        />
        <Button disabled={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((bg) => (
          <div key={bg.id} className="relative group">
            {bg.is_video ? (
              <video
                src={bg.url}
                className="w-full h-48 object-cover rounded-lg"
                controls
              />
            ) : (
              <img
                src={bg.url}
                alt="Background"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(bg.id, bg.url)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
