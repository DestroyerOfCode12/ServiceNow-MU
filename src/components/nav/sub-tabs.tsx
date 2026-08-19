"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { NavLink } from "./nav-links";

export function SubTabs({ tabs }: { tabs: NavLink[] }) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On narrow screens the tab strip can overflow further than a glance reveals
  // (no scrollbar, no visible cue) — scroll the active tab into view on mount/
  // navigation so a mobile user always lands on a strip that already shows
  // where they are, instead of having to discover the overflow themselves.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <div className="border-b border-border">
      <div className="container-page relative">
        <nav
          ref={scrollerRef}
          className="-mb-px flex gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:[mask-image:none]"
          aria-label="Section"
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                ref={active ? activeRef : undefined}
                href={tab.href}
                className={clsx(
                  "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-accent text-accent"
                    : "border-transparent text-foreground-muted hover:border-border hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
