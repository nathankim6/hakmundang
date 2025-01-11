import { BackgroundMedia } from "@/components/login/BackgroundMedia";

export const PageBackground = () => {
  return (
    <BackgroundMedia
      url="https://jpanpwbdlhsxnyaldddm.supabase.co/storage/v1/object/public/backgrounds/background.mp4"
      isVideo={true}
    />
  );
};