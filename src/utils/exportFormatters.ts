import { BrandKit } from '../types';

export function toMarkdown(brandKit: BrandKit, projectName: string): string {
  const { colors, typography, spacing, components, layoutRules } = brandKit;
  const date = new Date(brandKit.generatedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });

  const colorRows = [
    ['Primary', colors.primary, 'Page backgrounds, hero sections'],
    ['Secondary', colors.secondary, 'Headings, nav, key UI elements'],
    ['Accent', colors.accent, 'CTAs, highlights, hover states'],
    ['Background', colors.background, 'App/page background'],
    ['Surface', colors.surface ?? '#FFFFFF', 'Cards, modals, panels'],
    ['Text', colors.text, 'Body copy, labels'],
    ['Muted', colors.muted ?? '#8B8B86', 'Captions, placeholders, disabled'],
    ['Border', colors.border ?? '#E8E8E5', 'Dividers, input borders'],
    ['Success', colors.success, 'Confirmation, positive states'],
    ['Warning', colors.warning, 'Alerts, caution'],
    ['Error', colors.error, 'Errors, destructive actions'],
  ].map(([role, hex, usage]) => `| ${role} | \`${hex}\` | ${usage} |`).join('\n');

  const compSections = components.map(c =>
    `### ${c.name}\n${c.description}${c.cssExample ? `\n\`\`\`css\n${c.cssExample}\n\`\`\`` : ''}`
  ).join('\n\n');

  return `# ${projectName} — Brand Kit

> Generated ${date} | Mood: ${brandKit.moodName}

## Brief
${brandKit.brief}

---

## Colour Palette

| Role | Hex | Usage |
|------|-----|-------|
${colorRows}

---

## Typography

- **Heading font**: ${typography.headingFont}
- **Body font**: ${typography.bodyFont}
- **Heading weight**: ${typography.headingWeight}
- **Body weight**: ${typography.bodyWeight}
- **Scale ratio**: ${typography.scaleRatio}
- **Base size**: ${typography.baseSizePx}px
- **Body line-height**: ${typography.lineHeightBody}
- **Heading line-height**: ${typography.lineHeightHeading}
- **Heading letter-spacing**: ${typography.letterSpacingHeading}

---

## Spacing Scale

Base unit: ${spacing.baseUnit}px

Scale: ${spacing.scale.join(', ')}px

- Container max-width: ${spacing.containerMaxWidth}px
- Card padding: ${spacing.cardPadding}
- Section gap: ${spacing.sectionGap}

---

## Layout Rules

${layoutRules.map(r => `- ${r}`).join('\n')}

---

## Component Guidance

${compSections}
`;
}

export function toJSON(brandKit: BrandKit): string {
  return JSON.stringify(brandKit, null, 2);
}

export function toCSSTokens(brandKit: BrandKit, projectName: string): string {
  const { colors, typography, spacing } = brandKit;
  const date = new Date(brandKit.generatedAt).toLocaleDateString('en-AU');

  return `/* ${projectName} — Design Tokens — ${date} */
/* Mood: ${brandKit.moodName} */

:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-surface: ${colors.surface ?? '#FFFFFF'};
  --color-text: ${colors.text};
  --color-muted: ${colors.muted ?? '#8B8B86'};
  --color-border: ${colors.border ?? '#E8E8E5'};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};

  /* Typography */
  --font-heading: ${typography.headingFont};
  --font-body: ${typography.bodyFont};
  --font-weight-heading: ${typography.headingWeight};
  --font-weight-body: ${typography.bodyWeight};
  --font-size-base: ${typography.baseSizePx}px;
  --line-height-body: ${typography.lineHeightBody};
  --line-height-heading: ${typography.lineHeightHeading};
  --letter-spacing-heading: ${typography.letterSpacingHeading};

  /* Spacing */
  --spacing-base: ${spacing.baseUnit}px;
${spacing.scale.map((val, i) => {
    const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
    const name = names[i] ?? `step-${i + 1}`;
    return `  --spacing-${name}: ${val}px;`;
  }).join('\n')}

  /* Layout */
  --container-max: ${spacing.containerMaxWidth}px;
  --card-padding: ${spacing.cardPadding};
  --section-gap: ${spacing.sectionGap};

  /* Border Radius */
  --radius-sm: ${spacing.borderRadius.sm};
  --radius-md: ${spacing.borderRadius.md};
  --radius-lg: ${spacing.borderRadius.lg};
  --radius-full: ${spacing.borderRadius.full};
}
`;
}
