import React from "react";
import Link from "next/link";
import { Locale, getDictionary, isRtlLocale } from "@/lib/i18n";
import { Button } from "@/ui/primitives/Button";
import { Card } from "@/ui/primitives/Card";
import { Badge } from "@/ui/primitives/Badge";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Award,
  Layers,
  Sparkles,
  History,
  Target,
  LineChart,
  ShieldCheck,
} from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale === "ar" ? "ar" : "en") as Locale;
  const dict = getDictionary(locale);
  const isRTL = isRtlLocale(locale);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Clock,
      title: locale === "ar" ? "محاكاة موقوتة تحاكي واقع المقابلات" : "Realistic Timed Pressure",
      description:
        locale === "ar"
          ? "تدرّب تحت ظروف زمنية مماثلة لاختبارات التوظيف في الشركات التقنية لاكتساب سرعة الاستجابة وثقة الأداء."
          : "Practice under realistic time constraints replicating authentic technical assessments to build interview readiness.",
    },
    {
      icon: Award,
      title: locale === "ar" ? "تقييم منهجي وتحليل دقيق للدرجات" : "Objective Rubric Scoring",
      description:
        locale === "ar"
          ? "تصحيح دقيق من 100 نقطة يوزع الدرجات وفق معايير موضوعية توضح نقاط قوتك والفرص التي تحتاج لتطويرها."
          : "Standardized 100-point scoring providing detailed breakdown of your technical answers across core domain competencies.",
    },
    {
      icon: Target,
      title: locale === "ar" ? "تخصيص كامل للمسار ومستوى الخبرة" : "Tailored Role & Stack Alignment",
      description:
        locale === "ar"
          ? "اختبارات مصممة خصيصاً لمسارك الوظيفي ومستواك، سواء كنت مبتدئاً، متوسطاً، أو مهندساً متقدماً."
          : "Assessments tailored directly to your seniority level and technology focus, ensuring challenges match the role.",
    },
    {
      icon: Layers,
      title: locale === "ar" ? "تنوع متوازن بين الاختيارات والتحليل" : "Balanced Format Diversity",
      description:
        locale === "ar"
          ? "مزيج متكامل من الأسئلة السريعة والأسئلة التحليلية العميقة لقياس فهمك النظري وقدرتك على حل المسائل المعقدة."
          : "A calculated balance of rapid conceptual questions and open-ended technical reasoning to evaluate engineering depth.",
    },
    {
      icon: LineChart,
      title: locale === "ar" ? "سجل تراكمي ومقارنة دقيقة للمحاولات" : "Attempt Tracking & Progress",
      description:
        locale === "ar"
          ? "احتفظ بجميع جلساتك السابقة وقارن نتائجك لمعرفة مدى تطور مستواك وجاهزيتك للمقابلة الحقيقية."
          : "Review past test attempts and compare performance side-by-side to track your progress and interview readiness.",
    },
    {
      icon: ShieldCheck,
      title: locale === "ar" ? "خصوصية كاملة وبدء فوري بلا تعقيد" : "Zero Friction, Complete Privacy",
      description:
        locale === "ar"
          ? "ابدأ جلسة تقييمك فوراً وبكل سهولة دون قيود تسجيل أو مشاركة بيانات شخصية، بتركيز خالص على مهاراتك."
          : "Launch focused assessment sessions immediately with zero onboarding barriers and total data privacy.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-14 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-[2.75rem] font-bold text-stone-900 dark:text-stone-50 leading-tight">
          {dict.common.appName}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-normal">
          {dict.common.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href={`/${locale}/setup`}>
            <Button size="lg" className="group shadow-xs">
              <span>{dict.nav.newExam}</span>
              <ArrowIcon className="h-4 w-4 ms-1.5 transition-transform duration-150 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Button>
          </Link>

          <Link href={`/${locale}/history`}>
            <Button variant="outline" size="lg" className="group">
              <History className="h-4 w-4 me-1.5 text-stone-500 transition-transform duration-150 group-hover:rotate-[-15deg]" />
              <span>{dict.nav.history}</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card
              key={idx}
              padding="md"
              className="group flex flex-col justify-between transition-all duration-200 ease-out hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md"
            >
              <div className="space-y-3.5">
                <div className="h-10 w-10 rounded-xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] flex items-center justify-center border border-[#e8c676]/30 shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
