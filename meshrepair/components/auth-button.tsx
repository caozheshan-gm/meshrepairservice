import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

type AuthButtonProps = {
  showLoggedOut?: boolean;
};

export async function AuthButton({ showLoggedOut = true }: AuthButtonProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <Button asChild size="sm" variant="outline">
        <Link href="/admin">Admin</Link>
      </Button>
      <LogoutButton />
    </div>
    );
  }

  if (!showLoggedOut) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Admin Login</Link>
      </Button>
    </div>
  );
}
