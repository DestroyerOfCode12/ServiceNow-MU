"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";
import { PRIMARY_NAV } from "./nav-links";
import { Button, LinkButton } from "@/components/ui/button";

export function TopNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = PRIMARY_NAV.filter((l) => !l.adminOnly || session?.user?.role === "ADMIN");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">CSA</span>
          <span className="hidden sm:inline">CSA Prep Platform</span>
        </Link>

        {status === "authenticated" && (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary text-white" : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {status === "authenticated" ? (
            <>
              <Link
                href="/search"
                aria-label="Search"
                className="rounded-md p-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </Link>
              <span className="hidden text-sm text-foreground-muted md:inline">{session.user?.name ?? session.user?.email}</span>
              <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
              <button
                className="rounded-md p-2 text-foreground-muted hover:bg-surface-muted lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <MenuIcon open={open} />
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <LinkButton href="/login" variant="secondary" size="sm">
                Sign in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get started
              </LinkButton>
            </>
          ) : null}
        </div>
      </div>

      {open && status === "authenticated" && (
        <nav className="border-t border-border bg-surface lg:hidden" aria-label="Primary mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
