// app/admin/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { siteConfig } from "@/config/site";

export const dynamic = 'force-dynamic';

async function getSession() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export default async function AdminIndexPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = Number(session.user.user_metadata.role_id);

  const visibleItems = siteConfig.sidebarItems.filter((item) =>
    item.allowedRoles?.includes(role),
  );

  if (visibleItems.length === 0) {
    redirect("/");
  }

  const firstHref = visibleItems[0].href;

  redirect(firstHref);
}