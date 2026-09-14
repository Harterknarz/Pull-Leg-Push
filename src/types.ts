export type Day = 'mon' | 'wed' | 'fri';

export interface ExerciseDef {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

export interface FixedSlot {
  id: string;
  pool: ExerciseDef[];
}

export interface DayPlan {
  fixedSlots: FixedSlot[];
  rotationSlots: number;
  rotationPool: ExerciseDef[];
}

export interface SetEntry {
  weight: number | '';
  reps: number | '';
  rpe: number | '';
}

export interface Profile {
  id: string;
  display_name: string;
}

export interface DayMeta {
  user_id: string;
  day: Day;
  slot_picks: Record<string, string>;
  custom_names: Record<string, string>;
  session_count: number;
}

export interface HistoryPoint {
  date: string;
  max_weight: number;
}

export interface ExerciseSummary {
  exerciseId: string;
  latestSets: SetEntry[] | null;
  history: HistoryPoint[];
  prWeight: number | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  day: Day;
  session_date: string;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSetRow {
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_index: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
}
