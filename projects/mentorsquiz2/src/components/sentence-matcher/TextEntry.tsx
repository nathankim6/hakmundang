import { TextInput } from "../TextInput";

interface TextEntryProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  onPaste?: (values: string[]) => void;
}

export const TextEntry = ({ value, onChange, onEnterPress, onPaste }: TextEntryProps) => {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      onEnterPress={onEnterPress}
      onPaste={onPaste}
    />
  );
};