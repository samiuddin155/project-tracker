import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project, TeamMember } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { TeamMemberSelect } from "./TeamMemberSelect";

const formSchema = z.object({
  title: z.string().min(1, { message: "Task title is required" }),
  description: z.string().optional(),
  dueDate: z.date(),
  priority: z.enum(["low", "medium", "high"]),
  team: z.array(z.string()).min(1, { message: "Select at least one team member" }),
});

interface TaskFormProps {
  task?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Project) => void;
  teamMembers: TeamMember[];
  status: "todo" | "inProgress" | "done";
}

export function TaskForm({
  task,
  open,
  onOpenChange,
  onSubmit,
  teamMembers,
  status,
}: TaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: task 
      ? { 
          title: task.title, 
          description: task.description, 
          dueDate: new Date(task.dueDate), 
          priority: task.priority,
          team: task.team.map(member => member.id)
        } 
      : { 
          title: "", 
          description: "", 
          dueDate: new Date(), 
          priority: "medium",
          team: [], 
        },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const selectedMembers = teamMembers.filter(member => 
      values.team.includes(member.id)
    );
    
    const newTask: Project = {
      id: task?.id || crypto.randomUUID(),
      title: values.title,
      description: values.description || "",
      dueDate: values.dueDate.toISOString().split('T')[0],
      priority: values.priority,
      status: status,
      team: selectedMembers,
    };
    
    onSubmit(newTask);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
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
                    <Textarea placeholder="Enter task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
                            "border border-slate-200 dark:border-slate-700",
                            "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
                            "transition-all duration-200",
                            !field.value && "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {field.value ? field.value.charAt(0).toUpperCase() + field.value.slice(1) : "Select priority"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:opacity-100" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className={cn(
                        "w-full p-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
                        "border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg",
                        "animate-in fade-in-0 zoom-in-95",
                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                      )}
                      align="start"
                    >
                      <div className="p-2 space-y-1">
                        {["low", "medium", "high"].map((priority) => (
                          <div
                            key={priority}
                            className={cn(
                              "flex items-center space-x-2 p-2 rounded-md cursor-pointer",
                              "transition-all duration-200",
                              "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
                              "active:scale-[0.98]",
                              field.value === priority && "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            )}
                            onClick={() => {
                              field.onChange(priority);
                              // Close the popover after selection
                              const popoverTrigger = document.querySelector('[role="combobox"]');
                              if (popoverTrigger) {
                                (popoverTrigger as HTMLElement).click();
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 transition-all duration-200",
                                field.value === priority ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
                  <FormControl>
                    <TeamMemberSelect
                      teamMembers={teamMembers}
                      selectedMembers={field.value}
                      onSelect={(memberId) => {
                        const newValue = [...field.value, memberId];
                        field.onChange(newValue);
                      }}
                      onDeselect={(memberId) => {
                        const newValue = field.value.filter(id => id !== memberId);
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">
                {task ? "Update" : "Create"} Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 