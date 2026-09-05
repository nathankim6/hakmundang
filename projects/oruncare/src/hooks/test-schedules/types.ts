
import { TestSchedule } from "@/types/calendar";

export interface NewTestSchedule extends Omit<TestSchedule, 'id'> {}

export interface UpdateTestResultParams {
  scheduleId: string;
  result: TestSchedule['result'];
  wrongCount?: number;
}

// Add support for string values in range fields
export interface PreviousTestInfo {
  range_start: string | number;
  range_end: string | number;
  wordbook: string;
}
