import { Text } from "@motanos/ui";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <Text tone="muted">Loading MotanOS Foundation…</Text>
    </div>
  );
}
