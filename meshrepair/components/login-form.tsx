"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  redirectTo,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const nextPath =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/admin";
      router.replace(nextPath);
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className} {...props}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography component="h2" sx={{ fontSize: 30, fontWeight: 800 }}>
            Admin Login
          </Typography>
          <Typography color="text.secondary">
            Enter your email and password to continue.
          </Typography>
        </Stack>
        <form onSubmit={handleLogin}>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                type="email"
                value={email}
              />
            </Stack>
            <Stack spacing={1}>
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  href="/auth/forgot-password"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </Stack>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
}
