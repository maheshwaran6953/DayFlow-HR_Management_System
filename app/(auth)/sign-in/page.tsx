"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { ApiError, signIn } from "@/lib/api";

const DEMO_ACCOUNTS = [
  { label: "Admin / HR Officer", email: "alice@dayflow.com", password: "Admin@1234" },
  { label: "Employee", email: "rahul@dayflow.com", password: "Emp@1234" },
];

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await signIn({ email, password });
      toast.success(`Welcome back, ${session.user.name}`);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your work email and password.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <Separator />
          <div className="w-full rounded-lg bg-muted/60 p-3 text-xs">
            <p className="mb-1.5 font-medium">Demo accounts (mock data)</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="block w-full rounded px-1 py-0.5 text-left text-muted-foreground hover:text-foreground"
              >
                <span className="font-medium">{acc.label}:</span> {acc.email} /{" "}
                {acc.password}
              </button>
            ))}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
