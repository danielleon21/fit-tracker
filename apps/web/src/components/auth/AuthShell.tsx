export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-blob-violet blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-52 right-24 h-[400px] w-[400px] rounded-full bg-blob-blue blur-[70px]" />
      <div className="relative flex min-h-screen items-center justify-center px-6 lg:justify-start lg:pl-36">
        <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-[20px] border border-border bg-surface p-8 shadow-[0_20px_48px_rgba(0,0,0,0.45)] sm:p-11">
          {children}
        </div>
      </div>
    </div>
  );
}
