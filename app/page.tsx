import Portfolio from "@/components/Portfolio";
import { cookies } from "next/headers";

export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const query = (await searchParams).lang;
  const saved = (await cookies()).get("jcl-locale")?.value;
  const locale = query === "en" || query === "zh" ? query : saved === "zh" ? "zh" : "en";
  return <Portfolio initialLocale={locale} />;
}
