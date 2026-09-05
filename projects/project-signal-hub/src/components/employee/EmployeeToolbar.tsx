
import React from "react";
import { EmployeeDepartment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Filter, Search, RefreshCw, SortAsc } from "lucide-react";

interface EmployeeToolbarProps {
  employeeCount: number;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterDepartment: EmployeeDepartment | "all";
  setFilterDepartment: React.Dispatch<React.SetStateAction<EmployeeDepartment | "all">>;
  sortOrder: "name" | "position" | "default";
  setSortOrder: React.Dispatch<React.SetStateAction<"name" | "position" | "default">>;
  handleRefresh: () => void;
  isLoading: boolean;
  addEmployeeButton: React.ReactNode;
}

export const EmployeeToolbar: React.FC<EmployeeToolbarProps> = ({
  employeeCount,
  searchTerm,
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  sortOrder,
  setSortOrder,
  handleRefresh,
  isLoading,
  addEmployeeButton
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">직원 관리</h2>
        <Badge variant="outline" className="ml-2 bg-primary/10">
          {employeeCount}명
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="직원 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full md:w-[200px]"
          />
        </div>
        <Select 
          value={filterDepartment} 
          onValueChange={(value) => setFilterDepartment(value as EmployeeDepartment | "all")}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="부서 필터" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 부서</SelectItem>
            <SelectItem value="administration">행정부</SelectItem>
            <SelectItem value="elementary">초등부</SelectItem>
            <SelectItem value="middle">중등부</SelectItem>
            <SelectItem value="high">고등부</SelectItem>
            <SelectItem value="assistant">조교부</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as "name" | "position" | "default")}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <div className="flex items-center">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="정렬 방식" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">기본 순서</SelectItem>
            <SelectItem value="name">이름순</SelectItem>
            <SelectItem value="position">직책순</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
        {addEmployeeButton}
      </div>
    </div>
  );
};
