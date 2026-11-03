import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";

// Root layout's title template already appends "· CSA Prep Platform" —
// repeating it here would double it up in the rendered <title>.
export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-bold text-foreground">Search</h1>
      <div className="mt-6">
        <Suspense>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
