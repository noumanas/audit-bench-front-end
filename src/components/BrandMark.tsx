/** The redesign's wordmark: a lavender shield tile and "Audit Bench Ai" with the Ai in italic serif. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-white ${className}`}>
      <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-lavender">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0E0612"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </svg>
      </span>
      <span className="font-ab text-[17px] font-semibold tracking-[-0.01em]">
        Audit Bench <span className="font-display font-medium italic">Ai</span>
      </span>
    </span>
  );
}
