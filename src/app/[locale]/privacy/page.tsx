import React from "react";
import Link from "next/link";
import { Locale, getDictionary } from "@/lib/i18n";
import { Card } from "@/ui/primitives/Card";
import { Badge } from "@/ui/primitives/Badge";
import { Button } from "@/ui/primitives/Button";
import { ShieldCheck, Database, Cpu, Lock, ArrowLeft } from "lucide-react";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale === "ar" ? "ar" : "en") as Locale;
  const dict = getDictionary(locale);

  const sections = [
    {
      icon: Database,
      title: dict.privacy.heading1,
      content: dict.privacy.p1,
    },
    {
      icon: Cpu,
      title: dict.privacy.heading2,
      content: dict.privacy.p2,
    },
    {
      icon: Lock,
      title: dict.privacy.heading3,
      content: dict.privacy.p3,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-3 text-start">
        <Badge variant="success" size="md">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{dict.privacy.badge}</span>
        </Badge>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {dict.privacy.title}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl">
          {dict.privacy.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <Card key={idx} padding="lg" className="flex flex-col sm:flex-row gap-5 items-start transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-700">
              <div className="h-12 w-12 rounded-xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {sec.title}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Back button */}
      <div className="pt-4 text-start">
        <Link href={`/${locale}`}>
          <Button variant="outline">
            <span>{dict.privacy.backHome}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
