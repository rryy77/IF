type EventDescriptionBoxProps = {
  text: string;
  className?: string;
  onClick?: () => void;
};

/** 予定カード内のメモ / 詳細（description）表示 */
export function EventDescriptionBox({
  text,
  className = "",
  onClick,
}: EventDescriptionBoxProps) {
  const interactive = Boolean(onClick);

  const content = (
    <>
      <p className="line-clamp-5 whitespace-pre-wrap text-base leading-relaxed text-slate-200 sm:text-[17px] sm:leading-7">
        {text}
      </p>
      {interactive && (
        <span className="mt-1.5 block text-[10px] text-slate-400">
          タップしてメモを編集
        </span>
      )}
    </>
  );

  const boxClass = `mt-3 w-full rounded-xl border border-slate-600/40 bg-slate-800/60 px-3 py-2.5 text-left sm:px-3.5 sm:py-3 ${className} ${
    interactive
      ? "cursor-pointer transition-colors hover:border-slate-500/60 hover:bg-slate-800/80 active:scale-[0.99] active:bg-slate-700/60"
      : ""
  }`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={boxClass}
        aria-label="メモを編集"
      >
        {content}
      </button>
    );
  }

  return <div className={boxClass}>{content}</div>;
}
