import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "admin" ||
    profile.is_active !== true
  ) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const { id } = await context.params;


  const { count: orderCount, error: orderCheckError } = await supabase
  .from("orders")
  .select("*", { count: "exact", head: true })
  .eq("bike_id", id);

if (orderCheckError) {
  console.error("Could not check bike orders:", orderCheckError);

  return NextResponse.json(
    { error: "Could not verify bike orders." },
    { status: 500 }
  );
}

if ((orderCount ?? 0) > 0) {
  return NextResponse.json(
    {
      error:
        "This bike has existing orders and cannot be deleted. Mark it as archived instead.",
    },
    { status: 409 }
  );
}

  const { data: images, error: imageFetchError } = await supabase
    .from("bike_images")
    .select("storage_path")
    .eq("bike_id", id);

  if (imageFetchError) {
    console.error(
      "Could not fetch bike images before deletion:",
      imageFetchError
    );

    return NextResponse.json(
      { error: "Could not delete bike." },
      { status: 500 }
    );
  }

  const storagePaths =
    images
      ?.map((image) => image.storage_path)
      .filter(Boolean) ?? [];

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("bike-images")
      .remove(storagePaths);

    if (storageError) {
      console.error(
        "Could not delete bike images from storage:",
        storageError
      );

      return NextResponse.json(
        { error: "Could not delete bike images." },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("bikes")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Could not delete bike:", deleteError);

    return NextResponse.json(
      { error: "Could not delete bike." },
      { status: 500 }
    );
  }

  await supabase.from("audit_logs").insert({
    admin_user_id: user.id,
    action: "delete_bike",
    entity_type: "bike",
    entity_id: id,
    details: {
      deleted_at: new Date().toISOString(),
    },
  });

  return NextResponse.redirect(
    new URL("/admin/inventory", request.url),
    303
  );
}