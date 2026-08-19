import { Suspense } from "react";
import { SearchClient } from "./search-client";

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
