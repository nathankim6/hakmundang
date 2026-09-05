
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Tag, FileText, Save, Filter, X, CheckSquare, Square, BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Passage {
  id: string;
  content: string;
  category?: string;
  tags?: string[];
  difficulty?: string;
  item_id?: string;
  interpretation?: string;
}

interface PassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassage: (content: string) => void;
  onSelectMultiplePassages?: (contents: string[]) => void;
}

export const PassageModal = ({ isOpen, onClose, onSelectPassage, onSelectMultiplePassages }: PassageModalProps) => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "add">("browse");
  const [selectedPassages, setSelectedPassages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [newPassage, setNewPassage] = useState({
    content: "",
    item_id: "",
    interpretation: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPassages();
      setSelectedPassages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (passages.length > 0) {
      const uniqueCategories = Array.from(
        new Set(passages.filter(p => p.category).map(p => p.category as string))
      );
      setCategories(uniqueCategories);
    }
  }, [passages]);

  const loadPassages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("passages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPassages(data || []);
    } catch (error) {
      console.error("Error loading passages:", error);
      toast({
        title: "에러 발생",
        description: "지문 불러오기에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNewPassage = async () => {
    if (!newPassage.content.trim()) {
      toast({
        title: "내용 필요",
        description: "지문 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("passages")
        .insert([
          {
            content: newPassage.content,
            item_id: newPassage.item_id || null,
            interpretation: newPassage.interpretation || null
          }
        ])
        .select();

      if (error) throw error;
      
      toast({
        title: "저장 완료",
        description: "지문이 성공적으로 저장되었습니다.",
      });
      
      setNewPassage({
        content: "",
        item_id: "",
        interpretation: ""
      });
      
      setActiveTab("browse");
      loadPassages();
    } catch (error) {
      console.error("Error saving passage:", error);
      toast({
        title: "저장 실패",
        description: "지문 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const togglePassageSelection = (passageId: string, content: string) => {
    setSelectedPassages(prev => {
      if (prev.includes(content)) {
        return prev.filter(p => p !== content);
      } 
      return [...prev, content];
    });
  };

  const handleConfirmSelection = () => {
    if (selectedPassages.length === 0) {
      toast({
        title: "선택 필요",
        description: "선택된 지문이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPassages.length === 1) {
      onSelectPassage(selectedPassages[0]);
    } else if (onSelectMultiplePassages) {
      onSelectMultiplePassages(selectedPassages);
    }
    
    onClose();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const filteredPassages = passages.filter(passage => {
    const matchesSearch = 
      passage.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (passage.category && passage.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (passage.tags && passage.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (passage.item_id && passage.item_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || passage.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col bg-gradient-to-b from-gray-50 to-white shadow-2xl border-0">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center text-xl font-bold text-gray-800">
            <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
            지문 관리 시스템
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            데이터베이스에서 지문을 검색하거나 새로운 지문을 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="browse" className="w-full" onValueChange={(value) => setActiveTab(value as "browse" | "add")}>
          <TabsList className="grid grid-cols-2 mb-6 w-full bg-gray-100/70 p-1 rounded-lg">
            <TabsTrigger 
              value="browse" 
              className="flex items-center font-system text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              지문 검색
            </TabsTrigger>
            <TabsTrigger 
              value="add" 
              className="flex items-center font-system text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2 text-indigo-600" />
              새 지문 추가
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="지문, 카테고리, 태그, 문항 ID 검색..."
                    className="pl-10 border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-system text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="w-60">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-system text-sm">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="font-system">
                      <SelectItem value="all" className="text-sm">전체 카테고리</SelectItem>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category} className="text-sm">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex items-center text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-all font-system text-sm"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  초기화
                </Button>
              </div>
              
              {(searchTerm || selectedCategory !== "all") && (
                <div className="flex items-center text-sm text-gray-600 font-system">
                  <Filter className="w-4 h-4 mr-1 text-indigo-500" />
                  <span>
                    {filteredPassages.length}개의 검색 결과
                    {selectedCategory !== "all" && <Badge variant="outline" className="ml-2 font-system bg-blue-50 text-blue-700 border-blue-200">{selectedCategory}</Badge>}
                    {searchTerm && <Badge variant="outline" className="ml-2 font-system bg-indigo-50 text-indigo-700 border-indigo-200">"{searchTerm}"</Badge>}
                  </span>
                </div>
              )}
            </div>
            
            <div className="overflow-y-auto pr-2 -mr-2 h-[400px] custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredPassages.length === 0 ? (
                <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 font-system">
                  {searchTerm || selectedCategory !== "all" ? "검색 결과가 없습니다." : "저장된 지문이 없습니다."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPassages.map((passage) => (
                    <div 
                      key={passage.id} 
                      className="p-5 border rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer shadow-sm hover:shadow-md"
                      onClick={() => togglePassageSelection(passage.id, passage.content)}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePassageSelection(passage.id, passage.content);
                            }}
                            className="flex items-center"
                          >
                            {selectedPassages.includes(passage.content) ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          {passage.item_id ? (
                            <Badge variant="outline" className="text-xs font-medium bg-indigo-50 text-indigo-700 border-indigo-200 font-system px-2 py-0.5 rounded-md">
                              {passage.item_id}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-system">
                              ID: {passage.id.substring(0, 8)}
                            </Badge>
                          )}
                          
                          {passage.category && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-system">
                              {passage.category}
                            </Badge>
                          )}
                        </div>
                        
                        {passage.difficulty && (
                          <span className="text-xs font-system text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            난이도: {passage.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3 mb-2 text-gray-700 font-system">{passage.content}</p>
                      {passage.tags && passage.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {passage.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-blue-100 font-system">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600 font-system">
                {selectedPassages.length > 0 && (
                  <span className="font-medium">{selectedPassages.length}개 지문 선택됨</span>
                )}
              </div>
              <Button 
                onClick={handleConfirmSelection} 
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-1px] font-system"
                disabled={selectedPassages.length === 0}
              >
                {selectedPassages.length > 1 
                  ? `${selectedPassages.length}개 지문 선택하기` 
                  : "지문 선택하기"}
                <ChevronRight className="w-4 h-4 ml-1 animate-pulse" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-5">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold mb-4 text-gray-800 font-system">새로운 지문 추가</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 font-system">문항 ID</label>
                  <Input
                    placeholder="예: 2024년 고2 6월 모의고사 24번"
                    value={newPassage.item_id}
                    onChange={(e) => setNewPassage({...newPassage, item_id: e.target.value})}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-system"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 font-system">지문 내용</label>
                  <Textarea
                    placeholder="지문 내용을 입력하세요..."
                    rows={8}
                    value={newPassage.content}
                    onChange={(e) => setNewPassage({...newPassage, content: e.target.value})}
                    className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-system"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 font-system">해석</label>
                  <Textarea
                    placeholder="지문 해석을 입력하세요..."
                    rows={6}
                    value={newPassage.interpretation}
                    onChange={(e) => setNewPassage({...newPassage, interpretation: e.target.value})}
                    className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-system"
                  />
                </div>
                
                <Button 
                  onClick={saveNewPassage} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-1px] font-system"
                >
                  <Save className="w-4 h-4 mr-2" />
                  지문 저장하기
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
