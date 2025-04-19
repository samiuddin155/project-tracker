import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamMember } from "@/types/kanban";
import { supabase } from '@/lib/supabase';

type TeamMembersContextType = {
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => Promise<void>;
  updateTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (memberId: string) => Promise<void>;
  getTeamMemberById: (memberId: string) => TeamMember | undefined;
};

const TeamMembersContext = createContext<TeamMembersContextType | undefined>(undefined);

export function TeamMembersProvider({ children }: { children: React.ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    console.log('Fetching team members...');
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    console.log('Attempting to fetch team members from Supabase...');
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
    
    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }
    
    console.log('Fetched team members:', data);
    setTeamMembers(data || []);
  };

  const addTeamMember = async (member: TeamMember) => {
    console.log('Attempting to add team member:', member);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          name: member.name,
          role: member.role || null
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding team member:', error);
        throw error;
      }
      
      console.log('Successfully added team member:', data);
      setTeamMembers(prev => [...prev, data]);
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  };

  const updateTeamMember = async (member: TeamMember) => {
    console.log('Attempting to update team member:', member);
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: member.name,
        role: member.role || null
      })
      .eq('id', member.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team member:', error);
      return;
    }
    
    console.log('Successfully updated team member:', data);
    setTeamMembers(prev => prev.map(m => m.id === data.id ? data : m));
  };

  const deleteTeamMember = async (memberId: string) => {
    console.log('Attempting to delete team member:', memberId);
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);
    
    if (error) {
      console.error('Error deleting team member:', error);
      return;
    }
    
    console.log('Successfully deleted team member');
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const getTeamMemberById = (memberId: string) => {
    return teamMembers.find(m => m.id === memberId);
  };

  return (
    <TeamMembersContext.Provider value={{
      teamMembers,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      getTeamMemberById
    }}>
      {children}
    </TeamMembersContext.Provider>
  );
}

export function useTeamMembers() {
  const context = useContext(TeamMembersContext);
  if (context === undefined) {
    throw new Error('useTeamMembers must be used within a TeamMembersProvider');
  }
  return context;
}
