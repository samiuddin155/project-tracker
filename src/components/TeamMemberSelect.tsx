import { TeamMember } from "@/types/kanban";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

interface TeamMemberSelectProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelect: (memberId: string) => void;
  onDeselect: (memberId: string) => void;
  placeholder?: string;
  className?: string;
}

export function TeamMemberSelect({
  teamMembers,
  selectedMembers,
  onSelect,
  onDeselect,
  placeholder = "Select team members",
  className,
}: TeamMemberSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMemberNames = teamMembers
    .filter(member => selectedMembers.includes(member.id))
    .map(member => member.name);

  const handleSelect = (memberId: string) => {
    onSelect(memberId);
    setIsOpen(false);
  };

  const handleDeselect = (memberId: string) => {
    onDeselect(memberId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
            "border border-slate-200 dark:border-slate-700",
            "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
            "transition-all duration-200",
            "group",
            !selectedMembers.length && "text-slate-500 dark:text-slate-400",
            className
          )}
        >
          {selectedMembers.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedMemberNames.map((name, index) => (
                <span
                  key={index}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1",
                    "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md text-sm font-medium",
                    "transition-all duration-200",
                    "hover:bg-slate-300 dark:hover:bg-slate-600 hover:scale-105",
                    "group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                  )}
                >
                  {name}
                  <X
                    className="h-3.5 w-3.5 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const member = teamMembers.find(m => m.name === name);
                      if (member) handleDeselect(member.id);
                    }}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:opacity-100" />
        </Button>
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
        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              type="search"
              placeholder="Search team members..."
              className={cn(
                "pl-8 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
                "focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600",
                "transition-all duration-200"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md cursor-pointer",
                    "transition-all duration-200",
                    "hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
                    "active:scale-[0.98]",
                    isSelected && "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  )}
                  onClick={() => {
                    if (isSelected) {
                      handleDeselect(member.id);
                    } else {
                      handleSelect(member.id);
                    }
                  }}
                >
                  <Avatar 
                    name={member.name} 
                    className={cn(
                      "h-7 w-7 transition-all duration-200",
                      isSelected && "ring-2 ring-slate-400 dark:ring-slate-600 ring-offset-2 scale-110"
                    )} 
                  />
                  <span className="flex-1 font-medium">{member.name}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-slate-900 dark:text-slate-100 animate-in fade-in-0 zoom-in-95" />
                  )}
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-4 animate-in fade-in-0">
                No team members found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 