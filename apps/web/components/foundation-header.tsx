import { Badge, Stack, Text } from "@motanos/ui";

export function FoundationHeader() {
  return (
    <Stack direction="row" gap="md" className="justify-between">
      <Text as="span" size="sm" className="font-semibold tracking-[0.18em] uppercase">
        MotanOS
      </Text>
      <Badge tone="accent">Foundation</Badge>
    </Stack>
  );
}
