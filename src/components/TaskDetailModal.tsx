import { Project, TeamMember } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar, Flag, MessageSquare, Clock, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "./ui/button";

interface TaskDetailModalProps {
  task: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Project) => void;
}

export function TaskDetailModal({ task, open, onOpenChange, onEdit }: TaskDetailModalProps) {
  const priorityColors = {
    low: "text-blue-300 bg-blue-900/20",
    medium: "text-yellow-300 bg-yellow-900/20",
    high: "text-red-600 bg-red-900/20"
  };

  const priorityLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority"
  };

  const statusColors = {
    todo: "bg-gray-500/10 text-gray-100",
    inProgress: "bg-orange-500/10 text-orange-100",
    done: "bg-green-500/10 text-green-100"
  };

  const statusLabels = {
    todo: "To Do",
    inProgress: "In Progress",
    done: "Completed"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-gray-100 border-gray-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium", statusColors[task.status])}>
              {statusLabels[task.status]}
            </span>
            <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5", priorityColors[task.priority])}>
              <Flag className="h-3.5 w-3.5" />
              {priorityLabels[task.priority]}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </h3>
            <div className="flex flex-wrap gap-2">
              {task.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700/50"
                >
                  <Avatar name={member.name} className="h-6 w-6" />
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              Due by {format(new Date(task.dueDate), "MMMM d, yyyy")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              onClick={() => onEdit(task)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              Edit Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 