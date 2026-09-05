import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';

interface AlertMessagesProps {
  warning: string;
  info: string;
}

export const AlertMessages = ({ warning, info }: AlertMessagesProps) => {
  return (
    <>
      {warning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      {info && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}
    </>
  );
};