import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge taught about the custom font-size / radius / shadow tokens so `text-h2`
 * isn't mistaken for a colour and dropped when combined with `text-ink`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['2xs', 'caption', 'body-sm', 'body', 'title', 'h3', 'h2', 'h1', 'display', 'hero'] }],
      rounded: [{ rounded: ['xs', 'sm', 'md', 'lg', 'card', 'xl', '2xl', '3xl', 'full', 'none'] }],
      shadow: [{ shadow: ['sm', 'md', 'lg', 'brand', 'none'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
