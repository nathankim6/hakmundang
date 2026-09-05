import { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  icon?: LucideIcon;
  children: React.ReactNode;
}

const SectionTitle = ({ icon: Icon, children }: SectionTitleProps) => {
  return (
    <div className="flex items-center gap-3 mb-6 animate-fade-in">
      {Icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground border-l-4 border-l-primary pl-4">
        {children}
      </h2>
    </div>
  );
};

export default SectionTitle;
