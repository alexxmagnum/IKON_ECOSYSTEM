import { PLATFORM_NAME } from "@motanos/core";
import { IKON_BRAND } from "@motanos/ikon";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
        {PLATFORM_NAME}
      </p>
      <h1 className="text-5xl font-semibold tracking-tight">MotanOS Foundation</h1>
      <p className="max-w-xl text-lg text-white/75">
        Platform bootstrap is online. Shared engines, domains, and the IKON experience
        layer are scaffolded without business logic.
      </p>
      <p className="text-sm text-white/50">
        First implementation context: {IKON_BRAND.name}
      </p>
    </main>
  );
}
