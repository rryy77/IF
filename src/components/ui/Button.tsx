import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-main text-background font-semibold hover:bg-sky-300 active:scale-[0.98]",
  secondary:
    "bg-card text-foreground border border-muted/30 hover:border-main/50",
  ghost: "bg-transparent text-muted hover:text-foreground",
  danger: "bg-red-500/20 text-red-300 border border-red-500/30",
};

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3.5 text-base transition-all disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = {
  children: React.ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
};

export function LinkButton({
  children,
  href,
  variant = "primary",
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-base transition-all active:scale-[0.98] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
