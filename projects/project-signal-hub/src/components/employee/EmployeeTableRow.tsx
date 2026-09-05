
import React from "react";
import { Employee } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Key, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBirthday, getDepartmentBadgeColor, getAccessLevelBadgeColor } from "./utils/formatters";

interface EmployeeTableRowProps {
  employee: Employee;
  departmentNames: Record<string, string>;
  accessLevelNames: Record<string, string>;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeTableRow: React.FC<EmployeeTableRowProps> = ({
  employee,
  departmentNames,
  accessLevelNames,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow key={employee.id} className="hover:bg-muted/20">
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{employee.name}</span>
          <span className="text-muted-foreground text-xs">{employee.position}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getDepartmentBadgeColor(employee.department || 'administration')} font-normal`}>
          {departmentNames[employee.department || 'administration']}
        </Badge>
      </TableCell>
      <TableCell>
        {(employee.birthday || (employee.birthdayMonth && employee.birthdayDay)) ? (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{formatBirthday(employee)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Key className="h-4 w-4 mr-2 text-muted-foreground" />
          <code className="bg-muted/40 px-2 py-1 rounded text-xs font-mono">
            {employee.accessCode}
          </code>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getAccessLevelBadgeColor(employee.accessLevel || 'personal')} font-normal`}>
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          <span>{accessLevelNames[employee.accessLevel || 'personal']}</span>
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(employee)} className="h-8 w-8 p-0">
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(employee)} className="h-8 w-8 p-0">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
