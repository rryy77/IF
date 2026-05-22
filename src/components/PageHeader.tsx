import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "戻る",
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-main"
        >
          ← {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
      )}
    </header>
  );
}
