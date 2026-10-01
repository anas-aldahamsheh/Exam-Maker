"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/ui/providers/I18nProvider";
import { useTheme } from "@/ui/providers/ThemeProvider";
import { Button } from "@/ui/primitives/Button";
import {
  GraduationCap,
  History,
  GitCompare,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";

export function Navbar() {
  const { locale, dict } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Switch locale while preserving the remaining path
  const targetLocale = locale === "en" ? "ar" : "en";
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "";
  const switchedHref = `/${targetLocale}${pathWithoutLocale}`;

  const navLinks = [
    {
      href: `/${locale}/setup`,
      label: dict.nav.newExam,
      icon: PlusCircle,
    },
    {
      href: `/${locale}/history`,
      label: dict.nav.history,
      icon: History,
    },
    {
      href: `/${locale}/compare`,
      label: dict.nav.compare,
      icon: GitCompare,
    },
    {
      href: `/${locale}/privacy`,
      label: dict.nav.privacy,
      icon: ShieldCheck,
    },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };


  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-[#0a0b10]/85 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 font-bold text-lg text-stone-900 dark:text-stone-100 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#f5e4b3] via-[#e8c676] to-[#daa945] text-stone-950 font-bold shadow-sm shadow-[#e8c676]/20 border border-[#fbf3d5]/70 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-xs sm:text-sm font-bold tracking-tight">
              {dict.common.appName}
            </span>
            <span className="text-[10px] font-semibold text-[#b58c1c] dark:text-[#e8c676] leading-none">
              {locale === "ar" ? "منصة التقييم الاحترافي" : "Assessment Platform"}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 ease-out active:scale-[0.98] ${
                  isActive
                    ? "bg-[#e8c676]/10 text-[#b58c1c] dark:text-[#f0dfa8] font-semibold border border-[#e8c676]/30 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/70 dark:hover:bg-stone-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Language & Theme toggles */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Switcher */}
          <Link
            href={switchedHref}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200/80 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 backdrop-blur-xs transition-all duration-150 ease-out active:scale-95 shadow-xs"
            title={dict.nav.toggleLanguage}
          >
            <Globe className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{locale === "en" ? "العربية" : "English"}</span>
          </Link>

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-xs text-stone-700 dark:text-stone-200 active:scale-95"
            title={dict.nav.toggleTheme}
            aria-label={dict.nav.toggleTheme}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-[#e8c676] fill-[#e8c676]/20" />
            ) : (
              <Sun className="h-4 w-4 text-[#c59b27] fill-[#c59b27]/20" />
            )}
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={switchedHref}
            className="px-2 py-1 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200 active:scale-95 transition-all"
          >
            {locale === "en" ? "العربية" : "EN"}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#0a0b10]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#e8c676]/10 text-[#b58c1c] dark:text-[#f0dfa8] font-semibold border border-[#e8c676]/30"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {dict.nav.toggleTheme}:
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant={theme === "light" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme("light")}
                className="h-7 px-2 text-xs"
              >
                <Sun className="h-3.5 w-3.5 me-1 text-[#c59b27]" />
                {dict.nav.themeLight}
              </Button>
              <Button
                variant={theme === "dark" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="h-7 px-2 text-xs"
              >
                <Moon className="h-3.5 w-3.5 me-1 text-[#e8c676]" />
                {dict.nav.themeDark}
              </Button>
              <Button
                variant={theme === "system" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTheme("system")}
                className="h-7 px-2 text-xs"
              >
                <Laptop className="h-3.5 w-3.5 me-1 text-stone-400" />
                {dict.nav.themeSystem}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
