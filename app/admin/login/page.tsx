"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 font-bold text-white">
            JS
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Jeffrey Smith Used Bikes
          </p>

          <h1 className="text-3xl font-bold">
            Owner Login
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Sign in to manage inventory, orders, customers, and analytics.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-5">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized administrators only.
        </p>
      </div>
    </main>
  );
}