
import React from "react";
import { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Key, ShieldCheck, User, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBirthday, getDepartmentBadgeColor, getAccessLevelBadgeColor } from "./utils/formatters";

interface EmployeeMobileCardProps {
  employee: Employee;
  departmentNames: Record<string, string>;
  accessLevelNames: Record<string, string>;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeMobileCard: React.FC<EmployeeMobileCardProps> = ({
  employee,
  departmentNames,
  accessLevelNames,
  onEdit,
  onDelete
}) => {
  return (
    <Card key={employee.id} className="overflow-hidden border-border/40">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <div className="font-semibold text-base flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              {employee.name}
            </div>
            <span className="text-sm text-muted-foreground">{employee.position}</span>
          </div>
          <Badge className={`${getDepartmentBadgeColor(employee.department || 'administration')} font-normal text-xs`}>
            {departmentNames[employee.department || 'administration']}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">
              {formatBirthday(employee) !== "-" 
                ? formatBirthday(employee) 
                : "생일 정보 없음"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <code className="bg-muted/40 px-2 py-0.5 rounded text-xs font-mono">
              {employee.accessCode}
            </code>
          </div>
          
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge className={`${getAccessLevelBadgeColor(employee.accessLevel || 'personal')} font-normal text-xs`}>
              {accessLevelNames[employee.accessLevel || 'personal']}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(employee)} className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(employee)} className="h-8 w-8 p-0 border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
