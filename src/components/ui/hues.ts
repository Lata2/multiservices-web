/**
 * Colour "hues" used by illustrations, category tiles and hero slides.
 * Every class string is written out in full so Tailwind can see it; the colours
 * themselves come from the tokens in `src/styles/index.css`.
 */
export type Hue = 'primary' | 'accent' | 'success' | 'highlight' | 'danger' | 'info';

/** Category tint index (0–5) → hue. Keeps category colours stable everywhere. */
export const HUE_ORDER: Hue[] = ['primary', 'accent', 'success', 'highlight', 'danger', 'info'];
export const hueAt = (i: number): Hue => HUE_ORDER[((i % 6) + 6) % 6];

interface HueClasses {
  /** Soft illustrated surface (cards, thumbs). */
  surface: string;
  /** Icon / accent text on light surfaces. */
  ink: string;
  /** Medallion background on light surfaces. */
  medal: string;
  /** Decorative rings / back plates on light surfaces. */
  line: string;
  plate: string;
  /** Rich gradient for hero slides and promo banners (white text on top). */
  bold: string;
  /** Solid chip / dot colour. */
  solid: string;
}

export const HUES: Record<Hue, HueClasses> = {
  primary: {
    surface: 'bg-[linear-gradient(140deg,var(--color-primary-50),var(--color-primary-100))]',
    ink: 'text-primary-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-primary-50))]',
    line: 'border-primary-200',
    plate: 'bg-primary-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-primary-800),var(--color-primary-600)_45%,var(--color-highlight-600))]',
    solid: 'bg-primary-500',
  },
  accent: {
    surface: 'bg-[linear-gradient(140deg,var(--color-accent-50),var(--color-accent-100))]',
    ink: 'text-accent-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-accent-50))]',
    line: 'border-accent-200',
    plate: 'bg-accent-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-accent-800),var(--color-accent-600)_50%,var(--color-danger-600))]',
    solid: 'bg-accent-500',
  },
  success: {
    surface: 'bg-[linear-gradient(140deg,var(--color-success-50),var(--color-success-100))]',
    ink: 'text-success-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-success-50))]',
    line: 'border-success-200',
    plate: 'bg-success-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-success-800),var(--color-success-600)_50%,var(--color-info-600))]',
    solid: 'bg-success-500',
  },
  highlight: {
    surface: 'bg-[linear-gradient(140deg,var(--color-highlight-50),var(--color-highlight-100))]',
    ink: 'text-highlight-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-highlight-50))]',
    line: 'border-highlight-200',
    plate: 'bg-highlight-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-highlight-800),var(--color-highlight-600)_50%,var(--color-danger-500))]',
    solid: 'bg-highlight-500',
  },
  danger: {
    surface: 'bg-[linear-gradient(140deg,var(--color-danger-50),var(--color-danger-100))]',
    ink: 'text-danger-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-danger-50))]',
    line: 'border-danger-200',
    plate: 'bg-danger-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-danger-800),var(--color-danger-600)_50%,var(--color-accent-600))]',
    solid: 'bg-danger-500',
  },
  info: {
    surface: 'bg-[linear-gradient(140deg,var(--color-info-50),var(--color-info-100))]',
    ink: 'text-info-600',
    medal: 'bg-[linear-gradient(150deg,#fff,var(--color-info-50))]',
    line: 'border-info-200',
    plate: 'bg-info-200/70',
    bold: 'bg-[linear-gradient(125deg,var(--color-info-800),var(--color-info-600)_50%,var(--color-success-600))]',
    solid: 'bg-info-500',
  },
};
