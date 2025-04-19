import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
        "bg-zinc-900 text-zinc-50",
        "border border-zinc-800",
        "flex items-center justify-center",
        "font-medium text-sm",
        "shadow-sm",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
