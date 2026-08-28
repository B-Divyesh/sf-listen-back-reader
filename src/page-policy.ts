export const copyRestrictedMessage = 'This page asks readers not to copy its text. Listen Back will not read it.';

/** Detect page-level requests not to copy or archive displayed text. */
export function isCopyRestricted(document: Document): boolean {
  const robots = [...document.querySelectorAll('meta[name="robots" i], meta[name="googlebot" i]')]
    .map((meta) => meta.getAttribute('content')?.toLowerCase() ?? '')
    .join(',');
  return /(?:^|[\s,])(?:noarchive|nocache|nosnippet)(?:$|[\s,])/.test(robots)
    || Boolean(document.querySelector('[data-listen-back-no-copy], [data-no-copy]'));
}
