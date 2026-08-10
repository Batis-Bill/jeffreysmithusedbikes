import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


async function logout() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/admin/login");
}


export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "admin" ||
    profile.is_active !== true
  ) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const { count: inventoryCount } = await supabase
  .from("bikes")
  .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

  const { count: viewCount } = await supabase
  .from("bike_events")
  .select("*", { count: "exact", head: true })
  .eq("event_type", "view");

  const { count: likeCount } = await supabase
  .from("bike_events")
  .select("*", { count: "exact", head: true })
  .eq("event_type", "like");


  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Jeffrey Smith Used Bikes
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-400">
            Welcome, {profile.full_name || profile.email}.
          </p>
        </div>

        <div className="mb-8">
            <Link
                href="/admin/inventory"
                className="inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-400"
            >
                Manage Inventory
            </Link>
        </div>


        <form action={logout}>
            <button type="submit"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
                Logout
            </button>
        </form>
        
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Inventory</p>
            <p className="mt-2 text-3xl font-bold">{inventoryCount ?? 0}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Orders</p>
            <p className="mt-2 text-3xl font-bold">{orderCount ?? 0}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Views</p>
            <p className="mt-2 text-3xl font-bold">{viewCount ?? 0}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Likes</p>
            <p className="mt-2 text-3xl font-bold">{likeCount ?? 0}</p>
          </div>
        </div>
      </div>
    </main>
  );
}