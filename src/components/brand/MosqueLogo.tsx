import { cn } from '@/lib/utils';

interface MosqueLogoProps {
  className?: string;
  iconClassName?: string;
}

export const MosqueLogo = ({ className, iconClassName }: MosqueLogoProps) => {
  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700',
        className,
      )}
    >
      <svg
        viewBox='0 0 24 24'
        className={cn('h-5 w-5 text-white', iconClassName)}
        fill='currentColor'
        aria-hidden='true'
      >
        <path d='M4 19h16v2H4z' />
        <path d='M5.25 11.5h2.5V19h-2.5z' />
        <path d='M16.25 11.5h2.5V19h-2.5z' />
        <path d='M9.5 13.5h5V19h-5z' />
        <path d='M12 4.25a4.6 4.6 0 0 0-4.6 4.6v.65h9.2v-.65A4.6 4.6 0 0 0 12 4.25z' />
        <path d='M6.25 7h-1V4.5a1.25 1.25 0 1 1 2.5 0V7h-1V4.5a.25.25 0 1 0-.5 0z' />
        <path d='M17.25 7h-1V4.5a1.25 1.25 0 1 1 2.5 0V7h-1V4.5a.25.25 0 1 0-.5 0z' />
        <path d='M11.15 2.9h1.7v1.5h-1.7z' />
        <path d='M11 1.5h2v1.4h-2z' />
      </svg>
    </div>
  );
};
