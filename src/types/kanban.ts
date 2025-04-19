export interface Project {
  id: string;
  title: string;
  description: string;
  status: "todo" | "inProgress" | "done";
  dueDate: string;
  priority: "low" | "medium" | "high";
  team: TeamMember[];
  projectId?: string; // Reference to parent project (for tasks)
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface Column {
  id: string;
  title: string;
  status: "todo" | "inProgress" | "done";
  projects: Project[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  team: TeamMember[];
}
