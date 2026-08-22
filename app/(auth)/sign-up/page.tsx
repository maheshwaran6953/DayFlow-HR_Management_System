"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, MailIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, signUp, verifyEmail } from "@/lib/api";
import { PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_ITEMS: { value: Role; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Admin / HR Officer" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("employee");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await signUp({ employeeCode, email, password, role });
      setPendingEmail(result.email);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMockVerify() {
    if (!pendingEmail) return;
    try {
      await verifyEmail(pendingEmail);
      toast.success("Email verified. You can sign in now.");
      router.replace("/sign-in");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Verification failed.");
    }
  }

  if (pendingEmail) {
    return (
      <Card>
        <CardHeader className="items-center pt-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="size-6 text-primary" />
          </span>
          <CardTitle className="mt-2">Check your email to verify</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>. Verify
            your address before signing in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-4 flex-col gap-2 pb-6">
          <Button className="w-full" render={<Link href="/sign-in" />}>
            Back to sign in
          </Button>
          <Button variant="ghost" size="sm" onClick={handleMockVerify}>
            Demo shortcut: mark email as verified
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Sign up with the employee ID you received from HR.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not sign up</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeCode">Employee ID</Label>
            <Input
              id="employeeCode"
              placeholder="e.g. DF-1003"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@dayflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Select<Role>
              value={role}
              onValueChange={(v) => setRole(v ?? "employee")}
              items={ROLE_ITEMS}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ul className="mt-1 grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {ok ? <CheckIcon className="size-3" /> : <XIcon className="size-3" />}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
