import { Timestamp } from "firebase/firestore";

export type Task = {
  id: string;
  title: string;
  description: string;
  notes?: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string[];
  createdAt: Date;
  priority?: "low" | "medium" | "high";
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt: Timestamp;
  priority: "low" | "medium" | "high";
  startDate: Timestamp;
  endDate: Timestamp;
  owner: string;
  members: string[];
  role: "Owner" | "Participant";
};

export type ProjectStats = {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  overdueTasks: number;
  highPriorityTasks: number;
};