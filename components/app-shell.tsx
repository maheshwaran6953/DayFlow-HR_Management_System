"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  CircleUserRoundIcon,
  ClockIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/components/providers/session-provider";
import type { Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin / HR Officer",
  employee: "Employee",
};

function useNavItems() {
  const { session } = useSession();
  return React.useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
      {
        href: `/profile/${session?.user.id ?? ""}`,
        label: "Profile",
        icon: CircleUserRoundIcon,
      },
      { href: "/attendance", label: "Attendance", icon: ClockIcon },
      { href: "/leave", label: "Leave Requests", icon: CalendarDaysIcon },
      { href: "/payroll", label: "Payroll", icon: WalletIcon },
    ],
    [session?.user.id],
  );
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        D
      </span>
      <span className="font-heading text-base font-semibold tracking-tight">
        Dayflow
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = useNavItems();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-col gap-1 px-2 py-2">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            isActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function UserMenu() {
  const { session, signOut } = useSession();
  const router = useRouter();
  if (!session) return null;

  function handleSignOut() {
    signOut();
    router.replace("/sign-in");
  }

  const initials = session.user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="gap-2 pl-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden sm:inline">{session.user.name}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-sm font-medium">{session.user.name}</div>
          <div className="text-xs font-normal text-muted-foreground">
            {session.user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {ROLE_LABELS[session.user.role]} · {session.user.employeeCode}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { session } = useSession();

  return (
    <div className="flex min-h-svh w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="px-3 py-4">
          <BrandMark />
        </div>
        <NavLinks />
        <div className="mt-auto p-4 text-xs text-muted-foreground">
          Signed in as{" "}
          <Badge variant="secondary" className="ml-1">
            {session ? ROLE_LABELS[session.user.role] : ""}
          </Badge>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon />
                  <span className="sr-only">Open navigation</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Dayflow</SheetTitle>
              </SheetHeader>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="md:hidden">
            <BrandMark />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground lg:inline">
              {session ? ROLE_LABELS[session.user.role] : ""}
            </span>
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
