import { useState } from "react";
import { Column as ColumnType, Project, TeamMember } from "@/types/kanban";
import { ProjectCard } from "./ProjectCard";
import { Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import styles from "./Column.module.css";

interface ColumnProps {
  column: ColumnType;
  teamMembers: TeamMember[];
  onDragStart: (e: React.DragEvent, taskId: string, fromColumn: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onAddProject: (task: Project) => void;
  onEditProject: (task: Project) => void;
  onDeleteProject: (taskId: string, columnId: string) => void;
}

export function Column({ 
  column, 
  teamMembers,
  onDragStart, 
  onDragOver, 
  onDrop,
  onAddProject,
  onEditProject,
  onDeleteProject
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Project | null>(null);

  const handleAddTask = (task: Project) => {
    onAddProject(task);
    setIsAddingTask(false);
  };

  const handleEditTask = (task: Project) => {
    setTaskToEdit(task);
  };

  const handleSaveEdit = (task: Project) => {
    onEditProject({
      ...taskToEdit!,
      ...task
    });
    setTaskToEdit(null);
  };

  const handleDeleteTask = (taskId: string) => {
    onDeleteProject(taskId, column.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove(styles.dragging);
    }
  };

  const columnColors = {
    todo: "from-gray-900 to-gray-800",
    inProgress: "from-orange-950 to-orange-900",
    done: "from-green-950 to-green-900"
  };

  const columnHeaderColors = {
    todo: "text-gray-100",
    inProgress: "text-orange-100",
    done: "text-green-100"
  };

  const badgeColors = {
    todo: "bg-gray-700/50 text-gray-300 border-gray-600/50",
    inProgress: "bg-orange-900/30 text-orange-200 border-orange-700/50",
    done: "bg-green-900/30 text-green-200 border-green-700/50"
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full rounded-lg p-4",
        "bg-gradient-to-br",
        columnColors[column.status]
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={cn("text-lg font-semibold", columnHeaderColors[column.status])}>
            {column.title}
          </h3>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            badgeColors[column.status]
          )}>
            {column.projects.length}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full",
            columnHeaderColors[column.status],
            "hover:bg-white/10"
          )}
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {column.projects.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task.id, column.id)}
            onDragEnd={handleDragEnd}
          >
            <ProjectCard
              project={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>
        ))}
      </div>

      {isAddingTask && (
        <TaskForm
          open={isAddingTask}
          onOpenChange={setIsAddingTask}
          onSubmit={handleAddTask}
          teamMembers={teamMembers}
          status={column.status}
        />
      )}

      {taskToEdit && (
        <TaskForm
          task={taskToEdit}
          open={!!taskToEdit}
          onOpenChange={(open) => !open && setTaskToEdit(null)}
          onSubmit={handleSaveEdit}
          teamMembers={teamMembers}
          status={column.status}
        />
      )}
    </div>
  );
}
