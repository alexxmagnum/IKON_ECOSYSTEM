"use client";

import { Button, Stack, Text } from "@motanos/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6" role="alert">
      <Stack gap="md" className="max-w-md text-center">
        <Text as="h2" size="xl">
          Something went wrong
        </Text>
        <Text tone="muted">{error.message || "Unexpected application error."}</Text>
        <div>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </Stack>
    </div>
  );
}
