/**
 * Normalize to MSISDN without + (e.g. 250788123456) for MTN/Airtel APIs.
 */
export function normalizeRwandaMsisdn(input) {
  if (!input || typeof input !== 'string') return null;
  let d = input.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 10) d = `250${d.slice(1)}`;
  if (d.length === 9 && d.startsWith('7')) d = `250${d}`;
  if (d.length === 12 && d.startsWith('250')) return d;
  return null;
}
