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
