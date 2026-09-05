-- Add reason field to attendance_records table
ALTER TABLE attendance_records 
ADD COLUMN reason TEXT;