import { Project, TeamMember } from "@/types/kanban";
import { Avatar } from "./Avatar";
import { Calendar, Edit, Trash2, Flag, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { TaskDetailModal } from "./TaskDetailModal";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusColors = {
    todo: "from-gray-800 to-gray-900 text-gray-100 hover:from-gray-700 hover:to-gray-800",
    inProgress: "from-orange-800 to-orange-900 text-orange-100 hover:from-orange-700 hover:to-orange-800",
    done: "from-green-800 to-green-900 text-green-100 hover:from-green-700 hover:to-green-800"
  };

  const priorityColors = {
    low: "text-blue-300",
    medium: "text-yellow-300",
    high: "text-red-600"
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  return (
    <>
      <div 
        className={cn(
          "rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer",
          "border border-gray-700/50 backdrop-blur-sm bg-gradient-to-br",
          "transform hover:-translate-y-1",
          statusColors[project.status]
        )}
        onClick={() => setShowDetailModal(true)}
        draggable="true"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }} 
                className="cursor-pointer text-gray-100 hover:bg-gray-700"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="cursor-pointer text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{project.description}</p>
        
        <div className="mt-3 flex items-center text-xs">
          <Flag className={cn("h-4 w-4 mr-1", priorityColors[project.priority])} />
          <span className={cn("font-medium", priorityColors[project.priority])}>
            {priorityLabels[project.priority]}
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2 hover:space-x-1 transition-all duration-200">
            {project.team.map((member) => (
              <Avatar
                key={member.id}
                name={member.name}
                className="h-8 w-8 border-2 border-current/10 transition-transform hover:scale-110"
              />
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={project}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onEdit={onEdit}
      />
    </>
  );
}
