"use client";

import {
  BarChart3,
  Home,
  ListChecks,
  Menu,
  PanelLeftClose,
  Plus,
  Settings,
  Tags,
  WalletCards,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const desktopItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Transactions", href: "/transactions", icon: ListChecks },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Advanced", href: "/advanced", icon: WalletCards },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Import / Export", href: "/import-export", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

const mobileItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Add", href: "/transactions/new", icon: Plus },
  { label: "List", href: "/transactions", icon: ListChecks },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface AppShellProps {
  activePath?: string;
  children: ReactNode;
  phaseLabel?: string;
  title?: string;
}

function isActivePath(itemHref: string, activePath: string) {
  if (itemHref === "/") {
    return activePath === "/";
  }

  return activePath === itemHref || activePath.startsWith(`${itemHref}/`);
}

export function AppShell({
  activePath = "/",
  children,
  phaseLabel: _phaseLabel = "Phase 0",
  title = "Foundation and app shell",
}: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("trackpaisa-sidebar") === "collapsed",
  );

  function toggleSidebar() {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(
        "trackpaisa-sidebar",
        next ? "collapsed" : "expanded",
      );
      return next;
    });
  }

  return (
    <div className="min-h-screen text-[var(--text)]">
      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-[var(--border)] bg-[var(--surface)]/92 px-4 py-6 shadow-[8px_0_32px_rgb(15_23_42_/_0.04)] backdrop-blur-xl transition-[width] duration-200 lg:block ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div
          className={`mb-8 flex items-center gap-3 ${isSidebarCollapsed ? "justify-center" : ""}`}
        >
          <Image
            src="/trackpaisa-logo.svg"
            alt=""
            width={44}
            height={44}
            priority
            className="rounded-lg"
          />
          <div className={isSidebarCollapsed ? "sr-only" : ""}>
            <p className="text-lg font-extrabold leading-none tracking-[-0.02em]">TrackPaisa</p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              Every rupee, clearly tracked
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="secondary-action mb-5 h-11 w-full px-3 text-[var(--muted)]"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <Menu aria-hidden="true" size={18} />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>

        <nav aria-label="Primary navigation" className="grid gap-1">
          {desktopItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              aria-label={isSidebarCollapsed ? item.label : undefined}
              aria-current={
                isActivePath(item.href, activePath) ? "page" : undefined
              }
              title={isSidebarCollapsed ? item.label : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)] aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--primary)] aria-[current=page]:shadow-sm ${
                isSidebarCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <item.icon aria-hidden="true" size={18} />
              <span className={isSidebarCollapsed ? "sr-only" : ""}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* <div className={`absolute bottom-6 left-5 right-5 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 text-sm text-[var(--muted)] ${isSidebarCollapsed ? "hidden" : ""}`}>
          <p className="font-semibold text-[var(--text)]">Local-first by default</p>
          <p className="mt-2 leading-6">
            No account needed. Your data stays on this device, with export,
            restore, and offline shell support built in.
          </p>
        </div> */}
      </aside>

      <main
        className={`pb-[calc(7.5rem+env(safe-area-inset-bottom))] transition-[margin] duration-200 lg:pb-0 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
      >
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/82 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <Image
                src="/trackpaisa-logo.svg"
                alt=""
                width={36}
                height={36}
                priority
                className="rounded-lg"
              />
              <span className="font-extrabold tracking-[-0.02em]">TrackPaisa</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/94 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-soft backdrop-blur-xl lg:hidden">
        <nav
          aria-label="Mobile navigation"
          className="grid grid-cols-5 gap-1"
        >
          {mobileItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              aria-current={
                isActivePath(item.href, activePath) ? "page" : undefined
              }
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-extrabold text-[var(--muted)] transition aria-[current=page]:bg-[var(--surface-muted)] aria-[current=page]:text-[var(--primary)]"
            >
              <item.icon aria-hidden="true" size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
