import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/auth";

export async function handle(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      return NextResponse.json(
        { error: `${first.path.join(".") || "input"}: ${first.message}` },
        { status: 400 }
      );
    }
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[dayflow] unhandled API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
