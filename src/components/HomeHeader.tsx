import { AddActionMenu } from "@/components/AddActionMenu";
import { NotificationBell } from "@/components/NotificationBell";

type HomeHeaderProps = {
  onEditClick?: () => void;
  isEditActive?: boolean;
};

export function HomeHeader({ onEditClick, isEditActive }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur">
      <div className="justify-self-start">
        <NotificationBell />
      </div>

      <h1 className="justify-self-center text-xl font-bold tracking-tight text-foreground">
        latest IF
      </h1>

      <div className="flex items-center justify-end gap-2">
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className={`min-h-[40px] rounded-full px-3.5 text-sm font-medium transition-colors ${
              isEditActive
                ? "bg-main/20 text-main"
                : "bg-card text-muted hover:text-foreground"
            }`}
          >
            編集
          </button>
        )}
        <AddActionMenu />
      </div>
    </header>
  );
}
