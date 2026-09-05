
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, Edit, Copy, Trash2, FileText, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Passage } from './hooks/types';
import { toast } from "@/hooks/use-toast";

interface PassageListProps {
  passages: Passage[];
  loading: boolean;
  selectedPassages: string[];
  handleEdit: (passage: Passage) => void;
  handleCopy: (text: string) => void;
  handleDeletePassage: (id: string) => void;
  handleSelectPassage: (id: string, isChecked: boolean) => void;
  handleSelectAllPassages: (isChecked: boolean) => void;
}

const PassageList: React.FC<PassageListProps> = ({
  passages,
  loading,
  selectedPassages,
  handleEdit,
  handleCopy,
  handleDeletePassage,
  handleSelectPassage,
  handleSelectAllPassages
}) => {
  const allSelected = passages.length > 0 && selectedPassages.length === passages.length;
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Confirm deletion function to prevent accidental deletions
  const confirmDelete = async (id: string) => {
    if (window.confirm('정말로 이 지문을 삭제하시겠습니까?')) {
      setDeletingIds(prev => new Set(prev).add(id));
      await handleDeletePassage(id);
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Safely get text preview with a maximum length
  const getTextPreview = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Card className="mt-4 shadow-lg border-0">
      <CardHeader className="bg-secondary">
        <CardTitle className="text-lg font-bold">등록된 지문 리스트</CardTitle>
        <CardDescription>기존 지문을 보고 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
            <p>지문을 불러오는 중...</p>
          </div>
        ) : passages.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">지문을 찾을 수 없습니다</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={allSelected} 
                      onCheckedChange={checked => handleSelectAllPassages(!!checked)} 
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">지문고유번호</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead>해석</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passages.map((passage) => (
                  <TableRow key={passage.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedPassages.includes(passage.id)} 
                        onCheckedChange={checked => handleSelectPassage(passage.id, !!checked)} 
                      />
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{passage.item_id || '(미설정)'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Copy className="h-3 w-3 mr-1" />
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 hover:bg-transparent" 
                          onClick={() => handleCopy(passage.content)}
                        >
                          {getTextPreview(passage.content)}
                        </Button>
                      </Badge>
                    </TableCell>
                    <TableCell>{getTextPreview(passage.translation || '')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(passage)}>
                            <Edit className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(passage.content)}>
                            <Copy className="h-4 w-4 mr-2" />
                            복사
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(passage.id)} 
                            className="text-red-500"
                            disabled={deletingIds.has(passage.id)}
                          >
                            {deletingIds.has(passage.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                삭제 중...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                삭제
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default PassageList;
