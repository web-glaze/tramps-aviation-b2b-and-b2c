import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";

const API = process.env.NEXT_PUBLIC_API_URL || "https://tramps-aviation-backend.onrender.com/api";

async function getPage(slug: string) {
  try {
    const res = await fetch(`${API}/pages/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    openGraph: page.coverImage
      ? { images: [{ url: page.coverImage }] }
      : undefined,
  };
}

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  const formattedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <CommonHeader variant="b2c" />

      <main className="min-h-screen bg-background">
        {/* ── Cover / Hero image ─────────────────────────────────────── */}
        {page.coverImage && (
          <div className="w-full overflow-hidden" style={{ maxHeight: 380 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.coverImage}
              alt={page.title}
              className="w-full object-cover"
              style={{
                maxHeight: 380,
                width: "100%",
                display: "block",
              }}
            />
          </div>
        )}

        <div
          className="max-w-4xl mx-auto px-4 sm:px-6"
          style={{
            paddingTop: page.coverImage ? "2rem" : "6rem",
            paddingBottom: "4rem",
          }}
        >
          {/* Breadcrumb */}
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <span>/</span>
            <span className="text-foreground font-medium">{page.title}</span>
          </nav>

          {/* Content card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Page header */}
            <div className="px-8 py-6 border-b border-border bg-muted/30">
              <h1 className="text-2xl font-bold text-foreground">
                {page.title}
              </h1>
              {formattedDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {formattedDate}
                </p>
              )}
            </div>

            {/* Rich content body */}
            <div
              className="px-8 py-8 cms-content"
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          </div>
        </div>
      </main>

      <CommonFooter />
    </>
  );
}
