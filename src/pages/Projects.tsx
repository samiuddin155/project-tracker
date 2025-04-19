import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectMetadata } from "@/types/kanban";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";
import { ProjectForm } from "@/components/ProjectForm";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronRight } from "lucide-react";
import { useProjects } from "@/context/ProjectsContext";
import { Navbar } from "@/components/Navbar";

export default function Projects() {
  const [isCreating, setIsCreating] = useState(false);
  const { projects, createProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCreateProject = (project: ProjectMetadata) => {
    createProject(project);
    setIsCreating(false);
    toast({
      title: "Project created",
      description: `Project "${project.name}" has been created successfully.`,
    });
  };
  
  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Team:</p>
                  <div className="flex -space-x-2">
                    {project.team.map((member) => (
                      <Avatar 
                        key={member.id}
                        name={member.name}
                        className="border-2 border-white"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleViewProject(project.id)}
                >
                  <span>View Project</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-blue-50 p-6 mb-4">
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">No projects yet</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Create your first project to start organizing tasks and assigning team members.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create First Project
            </Button>
          </div>
        )}
      </div>
      
      <ProjectForm
        open={isCreating}
        onOpenChange={setIsCreating}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
