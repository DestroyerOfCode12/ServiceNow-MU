"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { clsx } from "clsx";

export interface OAuthProvidersEnabled {
  github: boolean;
  google: boolean;
  microsoftEntraId: boolean;
}

const PROVIDER_META = {
  github: {
    id: "github",
    label: "GitHub",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
    className: "bg-[#24292f] text-white hover:bg-[#1a1e22]",
  },
  google: {
    id: "google",
    label: "Google",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A11.998 11.998 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.93.46 3.76 1.26 5.38l4.01-3.1Z" />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
        />
      </svg>
    ),
    className: "border border-border bg-surface text-foreground hover:bg-surface-muted",
  },
  microsoftEntraId: {
    id: "microsoft-entra-id",
    label: "Microsoft",
    icon: (
      <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
        <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
      </svg>
    ),
    className: "border border-border bg-surface text-foreground hover:bg-surface-muted",
  },
} as const;

/**
 * Renders one button per OAuth provider that's actually configured on this
 * deployment (see OAUTH_PROVIDERS_ENABLED in auth.ts) — a provider whose env
 * vars aren't set never shows a button here, so there's no dead click that
 * would 500 or silently fail.
 */
export function OAuthButtons({ providers, callbackUrl }: { providers: OAuthProvidersEnabled; callbackUrl: string }) {
  const [pending, setPending] = useState<string | null>(null);
  const enabled = (Object.keys(providers) as (keyof OAuthProvidersEnabled)[]).filter((k) => providers[k]);

  if (enabled.length === 0) return null;

  return (
    <div>
      <div className="my-4 flex items-center gap-3 text-xs text-foreground-muted">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        {enabled.map((key) => {
          const meta = PROVIDER_META[key];
          return (
            <button
              key={meta.id}
              type="button"
              disabled={pending !== null}
              onClick={() => {
                setPending(meta.id);
                signIn(meta.id, { callbackUrl }).finally(() => setPending(null));
              }}
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                meta.className,
              )}
            >
              {meta.icon}
              {pending === meta.id ? "Redirecting…" : `Continue with ${meta.label}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
