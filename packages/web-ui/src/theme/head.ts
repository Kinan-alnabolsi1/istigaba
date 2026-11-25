// Inline <head> theme/language script (DESIGN_TOKENS.md §8.2) and the Vite plugin that injects it
// with a strict, hash-based Content-Security-Policy. No next-themes (owner rule).
import { createHash } from 'node:crypto';
import { LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY } from '@istigaba/config';
import type { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * Runs before CSS so the first paint already has the right theme and direction.
 * Reads only the two allowed preference keys; any storage error falls back to system + Arabic.
 */
export const THEME_HEAD_SCRIPT =
  '(function(){try{var d=document.documentElement;' +
  `var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"system";` +
  'var k=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);' +
  'd.classList.toggle("dark",k);d.style.colorScheme=k?"dark":"light";' +
  `var l=localStorage.getItem(${JSON.stringify(LANGUAGE_STORAGE_KEY)})==="en"?"en":"ar";` +
  'd.lang=l;d.dir=l==="ar"?"rtl":"ltr";}catch(e){}})();';

export interface CspOptions {
  /** Extra origins the app may call (API base URL, Reverb in S6). */
  connectSrc: string[];
  /** Extra image origins (map tiles in S3). */
  imgSrc?: string[];
}

/** Strict CSP: scripts only from self plus the exact hash of the inline theme script. */
export function buildCsp({ connectSrc, imgSrc = [] }: CspOptions): string {
  const hash = createHash('sha256').update(THEME_HEAD_SCRIPT, 'utf8').digest('base64');
  return [
    "default-src 'self'",
    `script-src 'self' 'sha256-${hash}'`,
    "style-src 'self'",
    ["img-src 'self' data: blob:", ...imgSrc].join(' '),
    "font-src 'self'",
    ["connect-src 'self'", ...connectSrc].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const CHARSET = /<meta\s+charset=["']?utf-8["']?\s*\/?>/i;

const escapeAttr = (value: string): string => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** The tags to inject: CSP <meta> (builds only) followed by the theme script. */
export function headTags(options: CspOptions, dev: boolean): HtmlTagDescriptor[] {
  const script: HtmlTagDescriptor = {
    tag: 'script',
    children: THEME_HEAD_SCRIPT,
    injectTo: 'head-prepend',
  };
  if (dev) return [script];
  const meta: HtmlTagDescriptor = {
    tag: 'meta',
    attrs: { 'http-equiv': 'Content-Security-Policy', content: buildCsp(options) },
    injectTo: 'head-prepend',
  };
  return [meta, script];
}

/**
 * Vite plugin: injects the theme script in dev and build, and the CSP <meta> only in builds
 * (Vite's dev server needs its own inline scripts). Production servers also send CSP headers.
 * The tags go right after <meta charset>, which must stay within the first 1024 bytes.
 */
export function istigabaHead(options: CspOptions): Plugin {
  return {
    name: 'istigaba-head',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const tags = headTags(options, Boolean((ctx as { server?: unknown }).server));
        const charset = CHARSET.exec(html);
        if (!charset) return tags;
        const markup = tags
          .map((t) =>
            t.tag === 'meta'
              ? `\n    <meta http-equiv="Content-Security-Policy" content="${escapeAttr(String(t.attrs?.content))}" />`
              : `\n    <script>${THEME_HEAD_SCRIPT}</script>`,
          )
          .join('');
        const at = charset.index + charset[0].length;
        return html.slice(0, at) + markup + html.slice(at);
      },
    },
  };
}
