import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/context/ProjectsContext";
import { ProjectForm } from "@/components/ProjectForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/Avatar";
import { ProjectMetadata } from "@/types/kanban";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, updateProject, deleteProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [project, setProject] = useState<ProjectMetadata | null>(null);

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast({
          title: "Project not found",
          description: "The requested project could not be found",
          variant: "destructive",
        });
        navigate("/projects");
      }
    }
  }, [projectId, projects, navigate, toast]);

  const handleUpdateProject = (updatedProject: ProjectMetadata) => {
    updateProject(updatedProject);
    setIsEditing(false);
    toast({
      title: "Project updated",
      description: "Project details have been updated successfully",
    });
  };

  const handleDeleteProject = () => {
    if (project) {
      deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: `Project "${project.name}" has been deleted`,
        variant: "destructive",
      });
      navigate("/projects");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading project...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/projects")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-600"
                onClick={() => setIsDeleting(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="flex mt-4 text-sm">
            <div className="flex items-center mr-6">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500 mr-1">Duration:</span>
              <span>
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-500 mr-1">Team:</span>
              <div className="flex -space-x-2 ml-1">
                {project.team.map((member) => (
                  <Avatar
                    key={member.id}
                    name={member.name}
                    className="border-2 border-white w-6 h-6"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KanbanBoard projectId={projectId} />
      </div>

      {project && (
        <ProjectForm
          project={project}
          open={isEditing}
          onOpenChange={setIsEditing}
          onSubmit={handleUpdateProject}
        />
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and all associated tasks will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
