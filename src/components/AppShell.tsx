type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto min-h-dvh max-w-md px-4 pb-8 pt-6">
        {children}
      </main>
    </div>
  );
}
