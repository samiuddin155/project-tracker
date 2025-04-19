import { useState, useEffect } from "react";
import { Column as ColumnType, Project, TeamMember } from "@/types/kanban";
import { Column } from "./Column";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/context/TeamMembersContext";
import { supabase } from "@/lib/supabase";
import styles from "./KanbanBoard.module.css";

// Initial data structure for the columns
const initialColumns: ColumnType[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    projects: []
  },
  {
    id: "inProgress",
    title: "In Progress",
    status: "inProgress",
    projects: []
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    projects: []
  }
];

interface KanbanBoardProps {
  projectId?: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [draggedProject, setDraggedProject] = useState<{
    projectId: string;
    fromColumn: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { teamMembers } = useTeamMembers();

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId || null);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    const tasks = data || [];
    const newColumns = initialColumns.map(column => ({
      ...column,
      projects: tasks.filter(task => task.status === column.status)
    }));
    
    setColumns(newColumns);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, fromColumn: string) => {
    setDraggedProject({ projectId: taskId, fromColumn });
    if (e.target instanceof HTMLElement) {
      e.target.classList.add(styles.dragging);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add(styles.dragOver);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove(styles.dragOver);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove(styles.dragging);
    }
    const dropTargets = document.querySelectorAll(`.${styles.dragOver}`);
    dropTargets.forEach(target => target.classList.remove(styles.dragOver));
  };

  const handleDrop = async (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault();
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove(styles.dragOver);
    }
    
    if (!draggedProject) return;

    const { projectId: taskId, fromColumn } = draggedProject;
    
    const toColumn = columns.find(col => col.id === toColumnId);
    if (!toColumn) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: toColumn.status })
      .eq('id', taskId);
    
    if (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
      return;
    }

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      const fromColumnIndex = newColumns.findIndex(col => col.id === fromColumn);
      const taskIndex = newColumns[fromColumnIndex].projects.findIndex(
        p => p.id === taskId
      );
      
      if (taskIndex === -1) return prevColumns;
      
      const [task] = newColumns[fromColumnIndex].projects.splice(taskIndex, 1);
      
      const toColumnIndex = newColumns.findIndex(col => col.id === toColumnId);
      newColumns[toColumnIndex].projects.push({
        ...task,
        status: newColumns[toColumnIndex].status
      });
      
      return newColumns;
    });
    
    setDraggedProject(null);
    
    toast({
      title: "Task moved",
      description: "The task has been moved successfully.",
    });
  };

  const handleAddTask = async (task: Project) => {
    // First check authentication status
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Authentication error:', authError);
      toast({
        title: "Error",
        description: "You must be authenticated to create tasks.",
        variant: "destructive",
      });
      return;
    }

    console.log('Current session:', session);
    console.log('Adding task with data:', { ...task, project_id: projectId });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...task,
        project_id: projectId
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
      return;
    }

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.status === task.status);
      
      newColumns[columnIndex].projects.push(data);
      
      return newColumns;
    });
    
    toast({
      title: "Task added",
      description: "New task has been created successfully.",
    });
  };

  const handleEditTask = async (updatedTask: Project) => {
    const { error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id);
    
    if (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
      return;
    }

    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        projects: column.projects.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      }));
    });
    
    toast({
      title: "Task updated",
      description: "The task has been updated successfully.",
    });
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
      return;
    }

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const columnIndex = newColumns.findIndex(col => col.id === columnId);
      
      newColumns[columnIndex].projects = newColumns[columnIndex].projects.filter(
        task => task.id !== taskId
      );
      
      return newColumns;
    });
    
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="relative h-[calc(100vh-120px)] p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50" />
      <div className="relative grid grid-cols-3 gap-6 h-full">
        {columns.map(column => (
          <Column
            key={column.id}
            column={column}
            teamMembers={teamMembers}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onAddProject={handleAddTask}
            onEditProject={handleEditTask}
            onDeleteProject={handleDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
