import { describe, expect, it } from 'vitest';
import type { ContentBlock } from '../types';
import { blocksToPlainText, countWords, initials, readingTime, slugify, truncate } from './text';

describe('slugify', () => {
  it('creates lowercase, dash-separated slugs', () => {
    expect(slugify('Parliament Approves New Housing Reform')).toBe('parliament-approves-new-housing-reform');
  });

  it('removes diacritics and punctuation', () => {
    expect(slugify('Łódź café: “Zażółć” gęślą jaźń!')).toBe('lodz-cafe-zazolc-gesla-jazn');
  });

  it('collapses whitespace and trims dashes', () => {
    expect(slugify('  --Hello   world--  ')).toBe('hello-world');
  });

  it('limits the slug to 80 characters', () => {
    expect(slugify('a '.repeat(100)).length).toBeLessThanOrEqual(80);
  });
});

describe('blocksToPlainText', () => {
  it('joins text, list items and media captions', () => {
    const blocks: ContentBlock[] = [
      { id: '1', type: 'heading', text: 'Title' },
      { id: '2', type: 'paragraph', text: 'Body text.' },
      { id: '3', type: 'list', items: ['one', 'two'] },
      { id: '4', type: 'image', mediaId: 'ph-1', caption: 'A caption' },
      { id: '5', type: 'video', mediaId: 'vid-1' },
    ];
    expect(blocksToPlainText(blocks)).toBe('Title Body text. one two A caption');
  });
});

describe('countWords / readingTime', () => {
  it('counts words separated by any whitespace', () => {
    expect(countWords('  one two\nthree\tfour ')).toBe(4);
    expect(countWords('')).toBe(0);
  });

  it('returns at least one minute', () => {
    expect(readingTime(0)).toBe(1);
    expect(readingTime(440)).toBe(2);
  });
});

describe('helpers', () => {
  it('truncates with an ellipsis', () => {
    expect(truncate('Hello world', 6)).toBe('Hello…');
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('builds initials from a name', () => {
    expect(initials('Morgan Blake')).toBe('MB');
    expect(initials('priya')).toBe('P');
  });
});
