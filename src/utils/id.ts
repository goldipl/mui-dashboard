/** Creates a short, collision-resistant id with an optional prefix, e.g. `art-lx2k9f-4h1z`. */
export function createId(prefix = 'id'): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${time}-${random}`;
}
