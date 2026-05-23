import { AddActionMenu } from "@/components/AddActionMenu";

type HomeHeaderProps = {
  onEditClick?: () => void;
  isEditActive?: boolean;
};

export function HomeHeader({ onEditClick, isEditActive }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between bg-background/95 px-4 py-3 backdrop-blur">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        latest IF
      </h1>
      <div className="flex items-center gap-2">
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
