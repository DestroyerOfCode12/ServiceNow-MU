"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { NavLink } from "./nav-links";

export function SubTabs({ tabs }: { tabs: NavLink[] }) {
  const pathname = usePathname();
  return (
    <div className="border-b border-border">
      <div className="container-page">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Section">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
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
