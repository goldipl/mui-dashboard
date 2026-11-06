import type { ContentBlock } from '../types';

const WORDS_PER_MINUTE = 220;

/** Letters that do not decompose into ASCII with Unicode normalisation. */
const SPECIAL_LETTERS: Record<string, string> = { ł: 'l', Ł: 'L', ø: 'o', Ø: 'O', ß: 'ss', æ: 'ae', Æ: 'AE', đ: 'd', Đ: 'D' };

/** Converts a headline into a URL-friendly slug. */
export function slugify(value: string): string {
  return value
    .replace(/[łŁøØßæÆđĐ]/g, (letter) => SPECIAL_LETTERS[letter] ?? letter)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Extracts the readable text of the article body. */
export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'list') return (block.items ?? []).join(' ');
      if (block.type === 'image' || block.type === 'video') return block.caption ?? '';
      return block.text ?? '';
    })
    .filter(Boolean)
    .join(' ');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Estimated reading time in minutes (minimum 1). */
export function readingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/** Returns up to two initials for an avatar. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Stable colour derived from a string – used for avatars. */
export function stringToColor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 55% 45%)`;
}
