import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function Settings() {
  const navigate = useNavigate();
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);

  useEffect(() => {
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      setSubscriptionExpiry(storedExpiry);
    }
  }, []);

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">구독 정보</h4>
            {subscriptionExpiry ? (
              <p className="text-sm text-muted-foreground">
                구독 만료일: {new Date(subscriptionExpiry).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                구독 정보를 찾을 수 없습니다.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">관리자 접근</h4>
            <Button onClick={handleAdminAccess} className="w-full">
              관리자 페이지로 이동
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}