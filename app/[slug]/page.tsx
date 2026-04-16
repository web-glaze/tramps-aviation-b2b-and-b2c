import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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
  };
}

export default async function SlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <>
      <CommonHeader variant="b2c" />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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
            {/* Header */}
            <div className="px-8 py-6 border-b border-border bg-muted/30">
              <h1 className="text-2xl font-bold text-foreground">
                {page.title}
              </h1>
              {page.updatedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Body */}
            <div
              className="px-8 py-8 prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-table:text-sm prose-td:border prose-td:p-2
                prose-th:border prose-th:p-2 prose-th:bg-muted"
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
            />
          </div>
        </div>
      </main>
      <CommonFooter />
    </>
  );
}