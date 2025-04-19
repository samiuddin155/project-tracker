import { useNavigate } from "react-router-dom";
import { useProjects } from "@/context/ProjectsContext";
import { useTeamMembers } from "@/context/TeamMembersContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, ClipboardList, CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { teamMembers } = useTeamMembers();

  // Calculate project statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(project => 
    new Date(project.endDate) > new Date()
  ).length;

  // Calculate completed projects based on end date
  const completedProjects = projects.filter(project => 
    new Date(project.endDate) <= new Date()
  ).length;

  // Calculate team statistics
  const totalTeamMembers = teamMembers.length;
  const activeTeamMembers = teamMembers.filter(member => 
    projects.some(project => project.team.some(tm => tm.id === member.id))
  ).length;

  // Get recent projects (last 3)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

  // Calculate completion percentage
  const completionPercentage = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;

  // Get gradient colors based on project status
  const getProjectGradient = (project: any) => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const isCompleted = endDate <= today;
    const isActive = endDate > today;

    if (isCompleted) {
      return "from-green-50 to-green-100 border-green-200";
    } else if (isActive) {
      return "from-blue-50 to-blue-100 border-blue-200";
    } else {
      return "from-gray-50 to-gray-100 border-gray-200";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Project Tracker</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Projects</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{totalProjects}</div>
              <p className="text-xs text-blue-700">
                {activeProjects} active, {completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{totalTeamMembers}</div>
              <p className="text-xs text-purple-700">
                {activeTeamMembers} active in projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{activeProjects}</div>
              <p className="text-xs text-orange-700">
                {Math.round((activeProjects / totalProjects) * 100)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Completed Projects</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{completedProjects}</div>
              <div className="mt-2">
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-green-700 mt-1">
                  {completionPercentage}% completion rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects and Team Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest projects you're working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-colors",
                      "bg-gradient-to-br",
                      getProjectGradient(project),
                      "hover:shadow-md"
                    )}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="flex items-center gap-1 bg-white/50 hover:bg-white/70"
                    >
                      <span>View</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {recentProjects.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No projects yet. Create your first project to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Overview */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar name={member.name} className="h-10 w-10" />
                    <div className="flex-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {projects.filter(p => p.team.some(tm => tm.id === member.id)).length} projects
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No team members yet. Add team members to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/projects')} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
              <ClipboardList className="h-5 w-5" />
            <span>View All Projects</span>
            </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/team')} 
            className="flex items-center gap-2 border-blue-200 hover:bg-blue-50"
          >
              <Users className="h-5 w-5" />
              <span>Manage Team</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
