"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/ui/providers/I18nProvider";
import {
  ExamSetup,
  ExamAttempt,
  ExperienceLevel,
  QuestionTypeFilter,
  DifficultyFilter,
} from "@/types/exam";
import { Input } from "@/ui/primitives/Input";
import { Textarea } from "@/ui/primitives/Textarea";
import { Button } from "@/ui/primitives/Button";
import { Card } from "@/ui/primitives/Card";
import { Badge } from "@/ui/primitives/Badge";
import { saveActiveAttempt } from "@/persistence/repositories/examRepository";
import {
  Sparkles,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  Award,
  CheckSquare,
  PenTool,
  Check,
  ShieldCheck,
  Gauge,
  User,
  Code,
  Compass,
  Globe,
  Play,
  CheckCircle2,
  Info,
  RotateCcw,
  Zap,
} from "lucide-react";

export function ExamSetupForm() {
  const { locale, dict } = useI18n();
  const router = useRouter();

  // No pre-selected defaults: user must actively choose each option
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [questionType, setQuestionType] = useState<QuestionTypeFilter | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyFilter | null>(null);
  const [questionCount, setQuestionCount] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<string | null>(null);
  const [examLanguage, setExamLanguage] = useState<"en" | "ar" | null>(null);

  // Loading & generation state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Ready gate state (exam generated successfully, awaiting user readiness)
  const [readyAttempt, setReadyAttempt] = useState<ExamAttempt | null>(null);

  // Validation & Error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    jobTitle?: boolean;
    experienceLevel?: boolean;
    questionType?: boolean;
    difficulty?: boolean;
    questionCount?: boolean;
    durationMinutes?: boolean;
    examLanguage?: boolean;
  }>({});

  // Cycle loading messages during AI generation
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % 4);
    }, 2400);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Loading stage messages (bilingual)
  const loadingStepsAr = [
    "جارٍ تحليل المسمى الوظيفي والمهارات والتقنيات المطلوبة...",
    "جارٍ هندسة سيناريوهات واقعية وتحديات معمارية متقدمة...",
    "جارٍ صياغة وتدقيق أسئلة المقابلة الهندسية بدقة...",
    "جارٍ ضبط معايير التقييم وأدلة الإجابة النموذجية...",
  ];

  const loadingStepsEn = [
    "Analyzing target job role and required tech stack...",
    "Architecting real-world production scenarios and edge cases...",
    "Synthesizing high-signal engineering interview questions...",
    "Calibrating standardized evaluation rubrics and grading criteria...",
  ];

  const currentLoadingStep =
    locale === "ar" ? loadingStepsAr[loadingStepIndex] : loadingStepsEn[loadingStepIndex];

  // Form submission & validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: typeof fieldErrors = {};
    const missingItems: string[] = [];

    const isAr = locale === "ar";

    if (!jobTitle.trim() || jobTitle.trim().length < 3) {
      errors.jobTitle = true;
      missingItems.push(isAr ? "المسمى الوظيفي (3 أحرف كحد أدنى)" : "Target Job Title");
    }

    if (!experienceLevel) {
      errors.experienceLevel = true;
      missingItems.push(isAr ? "مستوى الخبرة" : "Experience Level");
    }

    if (!questionType) {
      errors.questionType = true;
      missingItems.push(isAr ? "نوع الأسئلة" : "Question Format");
    }

    if (!difficulty) {
      errors.difficulty = true;
      missingItems.push(isAr ? "مستوى الصعوبة" : "Difficulty Curve");
    }

    if (!questionCount) {
      errors.questionCount = true;
      missingItems.push(isAr ? "عدد الأسئلة" : "Number of Questions");
    }

    if (!durationMinutes) {
      errors.durationMinutes = true;
      missingItems.push(isAr ? "مدة الجلسة" : "Session Duration");
    }

    if (!examLanguage) {
      errors.examLanguage = true;
      missingItems.push(isAr ? "لغة الامتحان" : "Exam Language");
    }

    if (missingItems.length > 0) {
      setFieldErrors(errors);
      setErrorMessage(
        isAr
          ? `يرجى تحديد الخيارات الإلزامية التالية للبدء: ${missingItems.join("، ")}.`
          : `Please configure the following required options to begin: ${missingItems.join(", ")}.`
      );
      // Scroll smoothly to top of form to see notification
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setFieldErrors({});

    const count = parseInt(questionCount!, 10);
    const duration = parseInt(durationMinutes!, 10);

    setIsLoading(true);

    const setupPayload: ExamSetup = {
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim() || undefined,
      experienceLevel: experienceLevel!,
      questionType: questionType!,
      difficulty: difficulty!,
      questionCount: count,
      durationMinutes: duration,
      language: examLanguage!,
    };

    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.attempt) {
        throw new Error(data.error || "Failed to generate exam");
      }

      // Instead of navigating immediately, hold in "Ready Gate" state
      setIsLoading(false);
      setReadyAttempt(data.attempt);
    } catch (err) {
      console.error("Setup form submit error:", err);
      setErrorMessage((err as Error).message || dict.common.error);
      setIsLoading(false);
    }
  };

  // Launch the exam session once user confirms they are ready
  const handleConfirmReadyAndStart = async () => {
    if (!readyAttempt) return;

    // Recalculate timestamps fresh from the exact moment user confirms
    const now = new Date();
    const durationMs = readyAttempt.setup.durationMinutes * 60 * 1000;
    const endAt = new Date(now.getTime() + durationMs);

    const activeAttempt: ExamAttempt = {
      ...readyAttempt,
      state: "READY",
      startedAt: now.toISOString(),
      endAt: endAt.toISOString(),
    };

    // Save active attempt locally in IndexedDB
    await saveActiveAttempt(activeAttempt);

    // Navigate to exam view
    router.push(`/${locale}/exam/${activeAttempt.id}`);
  };

  const experienceOptions: {
    value: ExperienceLevel;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      value: "junior",
      title: locale === "ar" ? "مبتدئ" : "Junior",
      subtitle: "1-2 yrs",
      icon: User,
    },
    {
      value: "mid",
      title: locale === "ar" ? "متوسط" : "Mid-Level",
      subtitle: "3-5 yrs",
      icon: Code,
    },
    {
      value: "senior",
      title: locale === "ar" ? "متقدم" : "Senior",
      subtitle: "5+ yrs",
      icon: Compass,
    },
  ];

  const typeOptions: {
    value: QuestionTypeFilter;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      value: "mixed",
      label: dict.setup.mixed,
      desc: locale === "ar" ? "اختيارات + تحليلي" : "MCQ + Technical Written",
      icon: Layers,
    },
    {
      value: "mcq",
      label: dict.setup.mcq,
      desc: locale === "ar" ? "اختيارات متعددة فقط" : "Multiple Choice Only",
      icon: CheckSquare,
    },
    {
      value: "written",
      label: dict.setup.written,
      desc: locale === "ar" ? "إجابات تقنية تحريرية" : "Open-ended Technical",
      icon: PenTool,
    },
  ];

  const difficultyOptions: {
    value: DifficultyFilter;
    label: string;
    dotColor: string;
    activeClass: string;
  }[] = [
    {
      value: "mixed",
      label: dict.setup.mixedDifficulty,
      dotColor: "bg-[#e8c676]",
      activeClass:
        "border-[#e8c676] bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] ring-2 ring-[#e8c676]/20",
    },
    {
      value: "easy",
      label: dict.setup.easy,
      dotColor: "bg-emerald-500",
      activeClass:
        "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20",
    },
    {
      value: "medium",
      label: dict.setup.medium,
      dotColor: "bg-[#c59b27]",
      activeClass:
        "border-[#c59b27] bg-[#c59b27]/10 text-stone-900 dark:text-[#f0dfa8] ring-2 ring-[#c59b27]/20",
    },
    {
      value: "hard",
      label: dict.setup.hard,
      dotColor: "bg-rose-500",
      activeClass:
        "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20",
    },
  ];

  const countPills = ["3", "5", "10", "15", "20"];
  const durationPills = ["5", "10", "15", "30", "45", "60"];

  return (
    <>
      <Card padding="none" className="max-w-3xl mx-auto overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-7 text-start">
            {/* Header summary */}
            <div className="border-b border-stone-200/80 dark:border-stone-800/80 pb-5 space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {dict.setup.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed font-normal">
                {dict.setup.subtitle}
              </p>
            </div>

            {/* Error notification banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-900 dark:text-red-200">
                    {locale === "ar" ? "تنبيه استكمال الإعداد" : "Incomplete Configuration"}
                  </p>
                  <p className="text-xs leading-relaxed text-red-700 dark:text-red-300 font-normal">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Role Specification */}
            <div className="space-y-4">
              {/* Target Job Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                    {dict.setup.jobTitleLabel}
                  </span>
                  {fieldErrors.jobTitle && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "ar" ? "مطلوب" : "Required"}
                    </span>
                  )}
                </div>
                <Input
                  placeholder={dict.setup.jobTitlePlaceholder}
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    if (fieldErrors.jobTitle) {
                      setFieldErrors((prev) => ({ ...prev, jobTitle: false }));
                      setErrorMessage(null);
                    }
                  }}
                  icon={<Briefcase className="h-4 w-4" />}
                  disabled={isLoading}
                  className={
                    fieldErrors.jobTitle
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                      : ""
                  }
                />
              </div>

              {/* Job Description (Optional) */}
              <Textarea
                label={dict.setup.jobDescLabel}
                placeholder={dict.setup.jobDescPlaceholder}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
                helperText={dict.setup.jobDescNote}
                className="min-h-[100px]"
              />
            </div>

            {/* Section 2: Interactive Parameter Grids */}
            <div className="space-y-6 pt-1">
              {/* 1. Experience Level Selector */}
              <div
                className={`p-3 rounded-2xl transition-all duration-150 ${
                  fieldErrors.experienceLevel
                    ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                    {dict.setup.experienceLabel}
                  </label>
                  {fieldErrors.experienceLevel && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "ar" ? "يرجى اختيار المستوى" : "Selection required"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {experienceOptions.map((opt) => {
                    const isSelected = experienceLevel === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          setExperienceLevel(opt.value);
                          if (fieldErrors.experienceLevel) {
                            setFieldErrors((prev) => ({ ...prev, experienceLevel: false }));
                            setErrorMessage(null);
                          }
                        }}
                        className={`relative flex items-center justify-between p-3.5 rounded-xl border text-start transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer select-none ${
                          isSelected
                            ? "border-[#e8c676] bg-[#e8c676]/10 shadow-xs ring-2 ring-[#e8c676]/20 text-stone-900 dark:text-[#f0dfa8]"
                            : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              isSelected
                                ? "bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] text-stone-950 font-bold"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{opt.title}</p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 font-normal">
                              {opt.subtitle}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-[#e8c676] text-stone-950 flex items-center justify-center shrink-0 animate-in zoom-in-75 duration-150">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Question Format Selector */}
              <div
                className={`p-3 rounded-2xl transition-all duration-150 ${
                  fieldErrors.questionType
                    ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                    {dict.setup.questionTypeLabel}
                  </label>
                  {fieldErrors.questionType && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "ar" ? "يرجى اختيار النوع" : "Selection required"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {typeOptions.map((opt) => {
                    const isSelected = questionType === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          setQuestionType(opt.value);
                          if (fieldErrors.questionType) {
                            setFieldErrors((prev) => ({ ...prev, questionType: false }));
                            setErrorMessage(null);
                          }
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-start transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer select-none ${
                          isSelected
                            ? "border-[#e8c676] bg-[#e8c676]/10 shadow-xs ring-2 ring-[#e8c676]/20 text-stone-900 dark:text-[#f0dfa8]"
                            : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] text-stone-950 font-bold"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{opt.label}</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate font-normal">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Difficulty Level Selector */}
              <div
                className={`p-3 rounded-2xl transition-all duration-150 ${
                  fieldErrors.difficulty
                    ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                    {dict.setup.difficultyLabel}
                  </label>
                  {fieldErrors.difficulty && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "ar" ? "يرجى تحديد الصعوبة" : "Selection required"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {difficultyOptions.map((opt) => {
                    const isSelected = difficulty === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          setDifficulty(opt.value);
                          if (fieldErrors.difficulty) {
                            setFieldErrors((prev) => ({ ...prev, difficulty: false }));
                            setErrorMessage(null);
                          }
                        }}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer select-none ${
                          isSelected
                            ? `${opt.activeClass} shadow-xs`
                            : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${opt.dotColor} shrink-0`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Question Count & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Question Count */}
                <div
                  className={`p-3 rounded-2xl transition-all duration-150 ${
                    fieldErrors.questionCount
                      ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                      {dict.setup.questionCountLabel}
                    </label>
                    {fieldErrors.questionCount && (
                      <span className="text-[11px] font-semibold text-rose-500">
                        {locale === "ar" ? "مطلوب" : "Required"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {countPills.map((count) => {
                      const isSelected = questionCount === count;
                      return (
                        <button
                          type="button"
                          key={count}
                          onClick={() => {
                            setQuestionCount(count);
                            if (fieldErrors.questionCount) {
                              setFieldErrors((prev) => ({ ...prev, questionCount: false }));
                              setErrorMessage(null);
                            }
                          }}
                          className={`py-2 rounded-xl border text-xs font-medium transition-all duration-100 ease-out active:scale-[0.95] cursor-pointer select-none ${
                            isSelected
                              ? "border-[#e8c676] bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] text-stone-950 font-bold shadow-xs"
                              : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700"
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Minutes */}
                <div
                  className={`p-3 rounded-2xl transition-all duration-150 ${
                    fieldErrors.durationMinutes
                      ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                      {dict.setup.durationLabel}
                    </label>
                    {fieldErrors.durationMinutes && (
                      <span className="text-[11px] font-semibold text-rose-500">
                        {locale === "ar" ? "مطلوب" : "Required"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {durationPills.map((dur) => {
                      const isSelected = durationMinutes === dur;
                      return (
                        <button
                          type="button"
                          key={dur}
                          onClick={() => {
                            setDurationMinutes(dur);
                            if (fieldErrors.durationMinutes) {
                              setFieldErrors((prev) => ({ ...prev, durationMinutes: false }));
                              setErrorMessage(null);
                            }
                          }}
                          className={`py-2 rounded-xl border text-xs font-medium transition-all duration-100 ease-out active:scale-[0.95] cursor-pointer select-none ${
                            isSelected
                              ? "border-[#e8c676] bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] text-stone-950 font-bold shadow-xs"
                              : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700"
                          }`}
                        >
                          {dur}m
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. Exam Language Selector */}
              <div
                className={`p-3 rounded-2xl transition-all duration-150 ${
                  fieldErrors.examLanguage
                    ? "border border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
                    {dict.setup.examLanguageLabel}
                  </label>
                  {fieldErrors.examLanguage && (
                    <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {locale === "ar" ? "يرجى تحديد لغة الاختبار" : "Selection required"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setExamLanguage("en");
                      if (fieldErrors.examLanguage) {
                        setFieldErrors((prev) => ({ ...prev, examLanguage: false }));
                        setErrorMessage(null);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-medium transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer select-none ${
                      examLanguage === "en"
                        ? "border-[#e8c676] bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] ring-2 ring-[#e8c676]/20 shadow-xs"
                        : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                    <span>English (US/UK)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExamLanguage("ar");
                      if (fieldErrors.examLanguage) {
                        setFieldErrors((prev) => ({ ...prev, examLanguage: false }));
                        setErrorMessage(null);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-medium transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer select-none ${
                      examLanguage === "ar"
                        ? "border-[#e8c676] bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] ring-2 ring-[#e8c676]/20 shadow-xs"
                        : "border-stone-200 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                    <span>اللغة العربية الفصحى</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Live Blueprint Specifications HUD */}
            <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-gradient-to-b from-stone-50/80 to-white/90 dark:from-stone-900/60 dark:to-stone-950/80 p-4.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676]">
                    <Gauge className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {locale === "ar" ? "مواصفات جلسة التقييم" : "Assessment Specifications"}
                  </span>
                </div>
                <Badge variant="primary" size="sm">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{locale === "ar" ? "تصحيح منهجي دقيق" : "Standardized Rubric"}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Stat 1: Total Points */}
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-stone-400">
                      {locale === "ar" ? "مجموع الدرجات" : "Total Scale"}
                    </p>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      100 {dict.common.pts}
                    </p>
                  </div>
                </div>

                {/* Stat 2: Timer Duration */}
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-stone-400">
                      {locale === "ar" ? "المدة المحددة" : "Duration"}
                    </p>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {durationMinutes ? `${durationMinutes} ${dict.common.mins}` : "--"}
                    </p>
                  </div>
                </div>

                {/* Stat 3: Questions & Level */}
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-stone-400">
                      {locale === "ar" ? "الأسئلة والمستوى" : "Questions & Tier"}
                    </p>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 capitalize">
                      {questionCount && experienceLevel
                        ? `${questionCount}Q • ${experienceLevel}`
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Submit button */}
            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-sm font-semibold tracking-wide"
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 me-2 text-stone-900" />
                <span>{dict.setup.generateBtn}</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* 1. MODAL OVERLAY: AI GENERATION IN PROGRESS               */}
      {/* ========================================================= */}
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Ambient Backdrop */}
          <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" />

          {/* Luxury Loading Card */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#111218] border border-stone-200/90 dark:border-stone-800 p-7 sm:p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Animated Gold Orb */}
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#e8c676]/30 animate-ping" />
              <div className="absolute inset-1 rounded-full border-2 border-t-[#e8c676] border-r-[#e8c676]/60 border-b-transparent border-l-transparent animate-spin" />
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] flex items-center justify-center shadow-lg text-stone-950">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            {/* Heading & Status Text */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50">
                {locale === "ar"
                  ? "جارٍ تحضير وصياغة الامتحان المخصص"
                  : "Synthesizing Custom Assessment"}
              </h2>
              <div className="min-h-[44px] flex items-center justify-center px-4">
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed transition-all duration-300 animate-in fade-in">
                  {currentLoadingStep}
                </p>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#daa945] via-[#e8c676] to-[#f5e4b3] transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${Math.min(96, (loadingStepIndex + 1) * 25)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-400 font-medium">
                <span>{locale === "ar" ? "نسبة التجهيز" : "Preparation Progress"}</span>
                <span>{Math.min(96, (loadingStepIndex + 1) * 25)}%</span>
              </div>
            </div>

            {/* Selected Spec Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700/60">
                {jobTitle}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] font-semibold border border-[#e8c676]/30 capitalize">
                {experienceLevel}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700/60">
                {questionCount} {locale === "ar" ? "أسئلة" : "Questions"}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-medium border border-stone-200/60 dark:border-stone-700/60">
                {durationMinutes} {dict.common.mins}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. READY GATE CONFIRMATION MODAL ("هل أنت جاهز؟")         */}
      {/* ========================================================= */}
      {readyAttempt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Dark Blurred Backdrop */}
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" />

          {/* Ready Card */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#111218] border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-2xl space-y-6 text-start animate-in zoom-in-95 duration-200">
            {/* Header with Success Icon */}
            <div className="flex items-start gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-b from-[#f5e4b3] to-[#e8c676] text-stone-950 flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-50">
                    {locale === "ar"
                      ? "تم تجهيز الامتحان بنجاح!"
                      : "Assessment is Ready!"}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-normal">
                  {locale === "ar"
                    ? "هل أنت مستعد لبدء الجلسة الآن؟ سيبدأ العد التنازلي للمؤقت فور تأكيدك."
                    : "Are you ready to begin? The session countdown timer will start as soon as you confirm."}
                </p>
              </div>
            </div>

            {/* Assessment Blueprint Summary */}
            <div className="rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                <span>{locale === "ar" ? "بيانات الاختبار المعتمدة" : "Session Parameters"}</span>
              </p>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60">
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {locale === "ar" ? "المسمى الوظيفي" : "Target Role"}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 truncate block mt-0.5">
                    {readyAttempt.setup.jobTitle}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60">
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {locale === "ar" ? "المستوى وعدد الأسئلة" : "Tier & Questions"}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize block mt-0.5">
                    {readyAttempt.setup.experienceLevel} &bull; {readyAttempt.questions.length}Q
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60">
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {locale === "ar" ? "المدة المتاحة" : "Total Duration"}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">
                    {readyAttempt.setup.durationMinutes} {dict.common.mins}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60">
                  <span className="text-[10px] text-stone-400 block font-medium">
                    {locale === "ar" ? "لغة الأسئلة" : "Language"}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mt-0.5">
                    {readyAttempt.setup.language === "ar" ? "العربية الفصحى" : "English"}
                  </span>
                </div>
              </div>
            </div>

            {/* Essential Guidelines Note */}
            <div className="p-3.5 rounded-xl bg-[#e8c676]/10 border border-[#e8c676]/25 text-xs space-y-1 text-stone-800 dark:text-[#f0dfa8]">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 dark:text-[#fbf3d5]">
                <Info className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676] shrink-0" />
                <span>{locale === "ar" ? "تعليمات قبل الانطلاق:" : "Before you begin:"}</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 text-stone-600 dark:text-stone-300 ps-1 font-normal">
                <li>
                  {locale === "ar"
                    ? "سيبدأ العداد التنازلي للوقت فوراً ولن تتمكن من إيقافه مؤقتاً."
                    : "The timer begins immediately and cannot be paused."}
                </li>
                <li>
                  {locale === "ar"
                    ? "يمكنك التنقل بحرية بين الأسئلة ومراجعتها قبل التسليم النهائي."
                    : "You can navigate freely and review your answers before submitting."}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleConfirmReadyAndStart}
                className="flex-1 h-12 text-sm font-semibold tracking-wide"
              >
                <Play className="h-4 w-4 me-2 fill-stone-950 text-stone-950" />
                <span>
                  {locale === "ar" ? "أنا جاهز، ابدأ الامتحان الآن" : "I'm Ready, Start Assessment"}
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setReadyAttempt(null)}
                className="h-12 text-xs font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5 me-1.5 text-stone-400" />
                <span>{locale === "ar" ? "تعديل الإعدادات" : "Adjust Settings"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
