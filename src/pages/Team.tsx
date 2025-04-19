import { useState } from "react";
import { TeamMember } from "@/types/kanban";
import { Avatar } from "@/components/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { TeamMemberForm } from "@/components/TeamMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/context/TeamMembersContext";
import { Navbar } from "@/components/Navbar";

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  
  // Filter team members based on search
  const filteredMembers = searchQuery 
    ? teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teamMembers;

  const handleAddMember = (member: TeamMember) => {
    addTeamMember(member);
    setIsAddingMember(false);
    toast({
      title: "Team member added",
      description: `${member.name} has been added to the team.`,
    });
  };

  const handleUpdateMember = (member: TeamMember) => {
    updateTeamMember(member);
    setMemberToEdit(null);
    toast({
      title: "Team member updated",
      description: `${member.name}'s information has been updated.`,
    });
  };

  const handleDeleteMember = (memberId: string) => {
    deleteTeamMember(memberId);
    toast({
      title: "Team member removed",
      description: "The team member has been removed.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <Button onClick={() => setIsAddingMember(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
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
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMemberToEdit(member)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-600" 
                    onClick={() => handleDeleteMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-blue-50 p-6 mb-4">
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">No team members found</h2>
            <p className="text-gray-500 max-w-md mb-6">
              {searchQuery ? "Try a different search term" : "Add your first team member to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddingMember(true)}>
                Add Team Member
              </Button>
            )}
          </div>
        )}
      </div>

      <TeamMemberForm
        open={isAddingMember}
        onOpenChange={setIsAddingMember}
        onSubmit={handleAddMember}
      />
      
      {memberToEdit && (
        <TeamMemberForm
          teamMember={memberToEdit}
          open={!!memberToEdit}
          onOpenChange={() => setMemberToEdit(null)}
          onSubmit={handleUpdateMember}
        />
      )}
    </div>
  );
}
