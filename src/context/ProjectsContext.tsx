import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectMetadata, Project, TeamMember } from "@/types/kanban";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

type ProjectsContextType = {
  projects: ProjectMetadata[];
  createProject: (project: ProjectMetadata) => Promise<void>;
  updateProject: (project: ProjectMetadata) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  getProjectById: (projectId: string) => ProjectMetadata | undefined;
  isLoading: boolean;
  error: string | null;
};

const initialTeamMembers: TeamMember[] = [
  { id: "1", name: "Alice Cooper", role: "Project Manager", avatar: "/placeholder.svg" },
  { id: "2", name: "Bob Smith", role: "Developer", avatar: "/placeholder.svg" },
  { id: "3", name: "Charlie Johnson", role: "Designer", avatar: "/placeholder.svg" },
  { id: "4", name: "Diana Williams", role: "Developer", avatar: "/placeholder.svg" },
  { id: "5", name: "Eve Brown", role: "Marketing", avatar: "/placeholder.svg" }
];

const initialProjectsData: ProjectMetadata[] = [
  {
    id: "project1",
    name: "Website Redesign",
    description: "Redesign the company website with new branding",
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    team: [initialTeamMembers[0], initialTeamMembers[1], initialTeamMembers[2]]
  },
  {
    id: "project2",
    name: "Mobile App Development",
    description: "Create a new mobile app for customers",
    startDate: "2024-03-15",
    endDate: "2024-06-30",
    team: [initialTeamMembers[0], initialTeamMembers[3], initialTeamMembers[4]]
  }
];

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await retryOperation(() => 
        supabase.from('projects').select('*')
      );
      
      if (error) throw error;
      
      setProjects((data || []).map(project => ({
        ...project,
        startDate: project.start_date,
        endDate: project.end_date
      })));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (project: ProjectMetadata) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await retryOperation(() =>
        supabase
          .from('projects')
          .insert([{
            name: project.name,
            description: project.description,
            start_date: project.startDate,
            end_date: project.endDate,
            team: project.team
          }])
          .select()
          .single()
      );
      
      if (error) throw error;
      
      setProjects(prev => [...prev, {
        ...data,
        startDate: data.start_date,
        endDate: data.end_date
      }]);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to create project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (project: ProjectMetadata) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await retryOperation(() =>
        supabase
          .from('projects')
          .update({
            name: project.name,
            description: project.description,
            start_date: project.startDate,
            end_date: project.endDate,
            team: project.team
          })
          .eq('id', project.id)
          .select()
          .single()
      );
      
      if (error) throw error;
      
      setProjects(prev => prev.map(p => p.id === data.id ? {
        ...data,
        startDate: data.start_date,
        endDate: data.end_date
      } : p));
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to update project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // First delete all tasks associated with the project
      const { error: tasksError } = await retryOperation(() =>
        supabase
          .from('tasks')
          .delete()
          .eq('project_id', projectId)
      );
      
      if (tasksError) throw tasksError;

      // Then delete the project
      const { error: projectError } = await retryOperation(() =>
        supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
      );
      
      if (projectError) throw projectError;
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  return (
    <ProjectsContext.Provider value={{
      projects,
      createProject,
      updateProject,
      deleteProject,
      getProjectById,
      isLoading,
      error
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
