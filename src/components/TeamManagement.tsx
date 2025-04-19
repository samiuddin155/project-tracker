import { useState } from "react";
import { Project, ProjectMetadata, TeamMember } from "@/types/kanban";
import { Avatar } from "./Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamManagementProps {
  projects: Project[];
  teamMembers: TeamMember[];
  projectsMetadata: ProjectMetadata[];
  onCreateProject: (project: ProjectMetadata) => void;
}

const projectFormSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  team: z.array(z.string()).min(1, { message: "Select at least one team member" }),
});

export function TeamManagement({ 
  projects, 
  teamMembers, 
  projectsMetadata, 
  onCreateProject 
}: TeamManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      team: [],
    },
  });

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => {
      const newSelection = prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      form.setValue('team', newSelection);
      return newSelection;
    });
  };

  function onSubmit(values: z.infer<typeof projectFormSchema>) {
    const selectedMembers = teamMembers.filter(member => 
      values.team.includes(member.id)
    );
    
    const newProject: ProjectMetadata = {
      id: crypto.randomUUID(),
      name: values.name,
      description: values.description || "",
      startDate: values.startDate.toISOString().split('T')[0],
      endDate: values.endDate.toISOString().split('T')[0],
      team: selectedMembers,
    };
    
    onCreateProject(newProject);
    form.reset();
    setSelectedTeamMembers([]);
    setNewProjectDialogOpen(false);
  }

  // Calculate tasks per team member
  const memberTasks = teamMembers.map(member => {
    const assignedTasks = projects.filter(project => 
      project.team.some(teamMember => teamMember.id === member.id)
    );
    
    const todoTasks = assignedTasks.filter(task => task.status === "todo").length;
    const inProgressTasks = assignedTasks.filter(task => task.status === "inProgress").length;
    const doneTasks = assignedTasks.filter(task => task.status === "done").length;
    
    const primaryProject = assignedTasks[0]?.title || "None";
    
    return {
      ...member,
      tasksCount: assignedTasks.length,
      todoTasks,
      inProgressTasks,
      doneTasks,
      primaryProject
    };
  });

  // Filter team members based on search
  const filteredMembers = searchQuery 
    ? memberTasks.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : memberTasks;

  // Filter projects based on selected project
  const filteredProjects = selectedProjectId 
    ? projects.filter(project => project.projectId === selectedProjectId)
    : projects;

  return (
    <div className="p-6">
      <Tabs defaultValue="team">
        <TabsList className="mb-4">
          <TabsTrigger value="team">Team Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search team members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <Card key={member.id}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar name={member.name} className="h-12 w-12" />
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription>{member.role || "Team Member"}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="font-medium">{member.tasksCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Primary Project</p>
                      <p className="font-medium truncate" title={member.primaryProject}>{member.primaryProject}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Task Breakdown:</p>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">To Do</p>
                        <p className="font-medium">{member.todoTasks}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">In Progress</p>
                        <p className="font-medium">{member.inProgressTasks}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Done</p>
                        <p className="font-medium">{member.doneTasks}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {selectedProjectId 
                      ? projectsMetadata.find(p => p.id === selectedProjectId)?.name
                      : "Filter by Project"}
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <div className="p-2">
                    <div 
                      className="rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedProjectId(null)}
                    >
                      All Projects
                    </div>
                    {projectsMetadata.map((project) => (
                      <div
                        key={project.id}
                        className={cn(
                          "rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                          selectedProjectId === project.id && "bg-accent"
                        )}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        {project.name}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={() => setNewProjectDialogOpen(true)}>
                Create New Project
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectsMetadata.map((project) => (
              <Card key={project.id} className={selectedProjectId && selectedProjectId !== project.id ? "opacity-50" : ""}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter project description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="team"
                render={() => (
                  <FormItem>
                    <FormLabel>Team Members</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !selectedTeamMembers.length && "text-muted-foreground"
                            )}
                          >
                            {selectedTeamMembers.length
                              ? `${selectedTeamMembers.length} team members selected`
                              : "Select team members"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <div className="max-h-[200px] overflow-auto p-2">
                          {teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className={cn(
                                "flex items-center space-x-2 p-2 rounded-md cursor-pointer",
                                selectedTeamMembers.includes(member.id) ? "bg-accent" : "hover:bg-muted"
                              )}
                              onClick={() => toggleTeamMember(member.id)}
                            >
                              <Avatar name={member.name} className="h-6 w-6" />
                              <span>{member.name}</span>
                              {selectedTeamMembers.includes(member.id) && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setNewProjectDialogOpen(false);
                  form.reset();
                  setSelectedTeamMembers([]);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
