"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/shared/context/auth-context";

export default function LogoutPage() {
  const { signOut } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await signOut();
      router.push('/login');
    };

    performLogout();
  }, [signOut, router]);

  return null;
}
