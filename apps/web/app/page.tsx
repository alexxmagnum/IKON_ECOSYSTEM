import { PLATFORM_NAME } from "@motanos/core";
import { IKON_BRAND } from "@motanos/ikon";
import { Badge, Button, Stack, Surface, Text } from "@motanos/ui";

export default function HomePage() {
  return (
    <Stack gap="lg">
      <Stack gap="sm">
        <Badge>Application Shell</Badge>
        <Text as="h1" size="3xl" className="font-semibold">
          MotanOS Foundation
        </Text>
        <Text tone="muted" size="lg" className="max-w-2xl">
          Design System Runtime, theme architecture, and PWA foundation are online.
          Business modules stay out of this layer.
        </Text>
      </Stack>

      <Surface className="p-[var(--motan-space-lg)]" elevated>
        <Stack gap="md">
          <Text as="h2" size="xl" className="font-medium">
            Layer check
          </Text>
          <Text tone="muted">
            Platform: {PLATFORM_NAME}. First implementation context: {IKON_BRAND.name}.
          </Text>
          <Stack direction="row" gap="sm">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Stack>
        </Stack>
      </Surface>
    </Stack>
  );
}
