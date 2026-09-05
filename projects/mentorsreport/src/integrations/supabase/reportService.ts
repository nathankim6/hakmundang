
import { supabase } from './client';
import type { Json } from './types';
import { ReportCard } from '@/types/supabaseExtensions';

// Define the type for a problem type in the report card
export interface ProblemType {
  id: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

// Define the type for a highlight in the report card
export interface ReportHighlight {
  id: string;
  text: string;
  color: string;
  pageX?: number;
  pageY?: number;
  timestamp?: number;
  elementId?: string;
  serializedRange?: string;
  range?: any; // Add range property for compatibility
}

// Define the type for a hit question photo
export interface HitQuestionPhoto {
  url: string;
  problemNumber?: number;
  problemName?: string;
  selectedArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Define the type for the data of a report card
export interface ReportCardData {
  id?: string;
  school: string;
  grade: string;
  examScope: string;
  teacher: string;
  teacherPhoto?: string;
  totalQuestions: number;
  objectiveQuestions: number;
  subjectiveQuestions: number;
  problemTypes: ProblemType[];
  overallEvaluation?: string;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    very_hard: number;
  };
  difficultProblemsExplanation?: string;
  examInfo?: string;
  hitQuestionPhotos?: HitQuestionPhoto[];
  highlights?: ReportHighlight[];
}

// Function to save a report card to Supabase
export async function saveReportCard(reportData: ReportCardData) {
  try {
    const { id, ...rest } = reportData;
    
    // Ensure teacher field has a default value if it's empty
    const teacher = rest.teacher || '미정';
    
    // Process hit question photos
    let processedPhotos: string[] | null = null;
    
    if (rest.hitQuestionPhotos && Array.isArray(rest.hitQuestionPhotos) && rest.hitQuestionPhotos.length > 0) {
      // Convert each photo object to JSON string
      processedPhotos = rest.hitQuestionPhotos.map(photo => JSON.stringify(photo));
    }
    
    // Prepare data for Supabase insertion/update
    const dbData = {
      school: rest.school,
      grade: rest.grade,
      exam_scope: rest.examScope,
      teacher: teacher,
      teacher_photo: rest.teacherPhoto || null,
      total_questions: rest.totalQuestions,
      objective_questions: rest.objectiveQuestions,
      subjective_questions: rest.subjectiveQuestions,
      problem_types: JSON.stringify(rest.problemTypes), // Convert to JSON string
      overall_evaluation: rest.overallEvaluation || null,
      difficult_problems_explanation: rest.difficultProblemsExplanation || null,
      exam_info: rest.examInfo || null,
      hit_question_photos: processedPhotos, // Processed photos array
      highlights: rest.highlights ? JSON.stringify(rest.highlights) : null
    };

    console.log("Prepared DB data for Supabase:", dbData);

    if (id) {
      // Update an existing report
      console.log("Updating existing report with ID:", id);
      const { data, error } = await supabase
        .from('report_cards')
        .update(dbData)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
      } else {
        console.log("Update successful, returned data:", data);
      }

      return { data, error };
    } else {
      // Create a new report
      console.log("Creating new report");
      const { data, error } = await supabase
        .from('report_cards')
        .insert([dbData])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Insert successful, returned data:", data);
      }

      return { data, error };
    }
  } catch (error) {
    console.error("Exception in saveReportCard:", error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

// Function to get all report cards from Supabase
export async function getReportCards() {
  const { data, error } = await supabase
    .from('report_cards')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

// Function to delete a report card from Supabase
export async function deleteReportCard(id: string) {
  const { data, error } = await supabase
    .from('report_cards')
    .delete()
    .eq('id', id);

  return { data, error };
}

// Updated function to save highlights to Supabase
export const updateReportHighlights = async (reportId: string, highlights: ReportHighlight[]) => {
  try {
    // Convert the highlights array to a string for storage
    const highlightsString = JSON.stringify(highlights);
    
    const { data, error } = await supabase
      .from('report_cards')
      .update({ highlights: highlightsString })
      .eq('id', reportId)
      .select();

    if (error) {
      console.error("Error updating highlights:", error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error in updateReportHighlights:", error.message);
    return { data: null, error };
  }
};

// Function to get a report card by ID from Supabase
export async function getReportCardById(id: string) {
  const { data, error } = await supabase
    .from('report_cards')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// Function to get highlights for a report from Supabase
export const getReportHighlights = async (reportId: string): Promise<ReportHighlight[]> => {
  try {
    const { data, error } = await supabase
      .from('report_cards')
      .select('highlights')
      .eq('id', reportId)
      .single();

    if (error || !data) {
      console.error("Error fetching highlights:", error?.message);
      return [];
    }

    try {
      // Parse highlights from JSON string
      // Using type assertion to ensure TypeScript knows data has a highlights property
      const dataWithHighlights = data as unknown as { highlights: string | null };
      const parsedHighlights = typeof dataWithHighlights.highlights === 'string' 
        ? JSON.parse(dataWithHighlights.highlights) 
        : dataWithHighlights.highlights;
      
      return Array.isArray(parsedHighlights) ? parsedHighlights : [];
    } catch (e) {
      console.error("Error parsing highlights:", e);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching highlights:", error.message);
    return [];
  }
};

// In the convertDbToAppFormat function, make sure we're handling the hitQuestionPhotos correctly
export const convertDbToAppFormat = (data: any): ReportCardData => {
  let hitQuestionPhotos: HitQuestionPhoto[] = [];
  let highlights: ReportHighlight[] = [];
  
  // 향상된 hitQuestionPhotos 처리 로직
  if (data.hit_question_photos && Array.isArray(data.hit_question_photos)) {
    try {
      hitQuestionPhotos = data.hit_question_photos.map((item: string) => {
        try {
          // 각 항목을 JSON으로 파싱
          return JSON.parse(item);
        } catch (e) {
          console.error("Error parsing hit question photo item:", e);
          // 파싱할 수 없는 경우 기본 객체 반환
          return { url: item };
        }
      });
    } catch (e) {
      console.error("Error processing hit question photos:", e);
      hitQuestionPhotos = [];
    }
  }
  
  // Handle highlights - parse from JSON string if needed
  if (data.highlights) {
    if (typeof data.highlights === 'string') {
      try {
        highlights = JSON.parse(data.highlights);
      } catch {
        highlights = [];
      }
    } else {
      try {
        // For cases where it might be a JSON object already
        highlights = Array.isArray(data.highlights) ? data.highlights : JSON.parse(JSON.stringify(data.highlights));
      } catch {
        highlights = [];
      }
    }
  } else {
    highlights = [];
  }

  // Handle problem_types - parse from JSON string if needed
  let problemTypes;
  if (data.problem_types) {
    if (typeof data.problem_types === 'string') {
      try {
        problemTypes = JSON.parse(data.problem_types);
        // Ensure all problem types have the category field
        problemTypes = problemTypes.map((type: any) => {
          if (!type.category) {
            return {
              ...type,
              category: type.name?.split(' ')[0] || '기타' // Use first word of name as category or default
            };
          }
          return type;
        });
      } catch (e) {
        console.error("Error parsing problem types:", e);
        problemTypes = [];
      }
    } else {
      problemTypes = data.problem_types;
      // Ensure all problem types have the category field
      problemTypes = problemTypes.map((type: any) => {
        if (!type.category) {
          return {
            ...type,
            category: type.name?.split(' ')[0] || '기타' // Use first word of name as category or default
          };
        }
        return type;
      });
    }
  }

  // difficulty는 테이블에 실제 컬럼이 없으므로 기본값 사용
  const defaultDifficulty = {
    easy: 25,
    medium: 25,
    hard: 25,
    very_hard: 25
  };

  return {
    id: data.id,
    school: data.school,
    grade: data.grade,
    examScope: data.exam_scope,
    teacher: data.teacher || '미정', // Ensure teacher has a default value
    teacherPhoto: data.teacher_photo,
    totalQuestions: data.total_questions,
    objectiveQuestions: data.objective_questions,
    subjectiveQuestions: data.subjective_questions,
    problemTypes: problemTypes || [],
    overallEvaluation: data.overall_evaluation,
    difficulty: defaultDifficulty, // 항상 기본값 사용
    difficultProblemsExplanation: data.difficult_problems_explanation,
    examInfo: data.exam_info,
    hitQuestionPhotos: hitQuestionPhotos,
    highlights: highlights
  };
};
