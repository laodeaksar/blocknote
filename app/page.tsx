import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("better-auth.session_token");
  if (hasSession) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center">
              <span className="text-background text-2xl font-bold">N</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Notion Clone
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            The connected workspace where better, faster work happens. Write,
            plan, and get organized.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Log in
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8 text-left">
          {[
            {
              icon: "✏️",
              title: "Rich text editing",
              desc: "Powered by BlockNote with slash commands, markdown, and more.",
            },
            {
              icon: "📁",
              title: "Organized pages",
              desc: "Create, archive and manage your documents in a sidebar.",
            },
            {
              icon: "☁️",
              title: "Real-time sync",
              desc: "All changes sync instantly with Convex backend.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 rounded-xl border border-border bg-muted"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
