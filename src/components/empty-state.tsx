import type { LucideIcon } from "lucide-react";

/**
 * Friendly empty state with a soft illustration ring — keeps fresh accounts
 * feeling intentional rather than broken.
 */
export function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 -m-3 rounded-full bg-primary/5" />
        <div className="absolute inset-0 -m-1.5 rounded-full bg-primary/10" />
        <div className="relative grid h-12 w-12 place-items-center rounded-full bg-primary/15">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
