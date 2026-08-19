import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardBody className="py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Page not found</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            That page doesn&apos;t exist, or may have moved. Check the link, or head back to somewhere useful.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton href="/dashboard">Go to dashboard</LinkButton>
            <LinkButton href="/study" variant="secondary">
              Browse study content
            </LinkButton>
          </div>
          <p className="mt-6 text-xs text-foreground-muted">
            <Link href="/" className="font-medium text-accent hover:underline">
              Or return to the homepage →
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
