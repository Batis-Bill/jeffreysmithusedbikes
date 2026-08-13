import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import FavoriteButton from "@/components/FavoriteButton";
import BikeGallery from "@/components/BikeGallery";

export default async function BikeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const adminSupabase =
    createAdminClient();

  const { data: bike, error } =
    await supabase
      .from("bikes")
      .select(`
        id,
        stock_number,
        make,
        model,
        model_year,
        price_cents,
        mileage,
        engine_capacity_cc,
        transmission,
        fuel_type,
        bike_type,
        condition,
        description,
        status,
        published,
        bike_images (
          storage_path,
          alt_text,
          display_order
        )
      `)
      .eq("id", id)
      .eq("published", true)
      .single();

  if (error || !bike) {
    notFound();
  }

  const sortedImages = [
    ...(bike.bike_images ?? []),
  ].sort(
    (a, b) =>
      (a.display_order ?? 0) -
      (b.display_order ?? 0)
  );

  const galleryImages =
    await Promise.all(
      sortedImages.map(
        async (image, index) => {
          const { data } =
            await adminSupabase.storage
              .from("bike-images")
              .createSignedUrl(
                image.storage_path,
                60 * 60
              );

          return {
            url:
              data?.signedUrl ?? "",
            alt:
              image.alt_text ??
              `${bike.model_year} ${bike.make} ${bike.model} photo ${index + 1}`,
          };
        }
      )
    );

  const validGalleryImages =
    galleryImages.filter(
      (image) => image.url
    );

  const { data: related } =
    await supabase
      .from("bikes")
      .select(`
        id,
        make,
        model,
        model_year,
        price_cents,
        mileage,
        bike_type,
        bike_images (
          storage_path,
          alt_text,
          display_order
        )
      `)
      .eq("published", true)
      .in("status", [
        "available",
        "reserved",
      ])
      .neq("id", bike.id)
      .or(
        `bike_type.eq.${bike.bike_type},make.eq.${bike.make}`
      )
      .limit(3);

  const relatedBikes =
    await Promise.all(
      (related ?? []).map(
        async (relatedBike) => {
          const firstImage =
            relatedBike.bike_images
              ?.sort(
                (a, b) =>
                  (a.display_order ??
                    0) -
                  (b.display_order ??
                    0)
              )[0];

          let imageUrl:
            | string
            | null = null;

          if (
            firstImage?.storage_path
          ) {
            const { data } =
              await adminSupabase.storage
                .from("bike-images")
                .createSignedUrl(
                  firstImage.storage_path,
                  3600
                );

            imageUrl =
              data?.signedUrl ?? null;
          }

          return {
            ...relatedBike,
            imageUrl,
          };
        }
      )
    );

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold"
          >
            Jeffrey Smith Used Bikes
          </Link>

          <Link
            href="/shop"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Back to Inventory
          </Link>
        </div>
      </header>

      {/* MOTORCYCLE */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* GALLERY */}
          <BikeGallery
            images={validGalleryImages}
          />

          {/* DETAILS */}
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-400">
                Used Bike
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold capitalize text-slate-300">
                {bike.status}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold capitalize text-slate-300">
                {bike.bike_type?.replaceAll(
                  "_",
                  " "
                )}
              </span>
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              {bike.model_year} Used
              Motorcycle
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              {bike.make} {bike.model}
            </h1>

            <p className="mt-5 text-4xl font-bold text-orange-400">
              $
              {(
                bike.price_cents / 100
              ).toLocaleString(
                "en-US"
              )}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Mileage
                </p>

                <p className="mt-2 font-bold">
                  {bike.mileage?.toLocaleString() ??
                    0}{" "}
                  miles
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Engine
                </p>

                <p className="mt-2 font-bold">
                  {bike.engine_capacity_cc
                    ? `${bike.engine_capacity_cc} cc`
                    : "Not listed"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Transmission
                </p>

                <p className="mt-2 font-bold capitalize">
                  {bike.transmission?.replaceAll(
                    "_",
                    " "
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Condition
                </p>

                <p className="mt-2 font-bold capitalize">
                  {bike.condition ===
                  "used"
                    ? "Used Bike"
                    : `Used - ${bike.condition}`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Fuel
                </p>

                <p className="mt-2 font-bold capitalize">
                  {bike.fuel_type}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Stock #
                </p>

                <p className="mt-2 font-bold">
                  {bike.stock_number}
                </p>
              </div>
            </div>

            {bike.description && (
              <div className="mt-8">
                <h2 className="text-xl font-bold">
                  About This Used Bike
                </h2>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                  {bike.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "available",
                "reserved",
              ].includes(
                bike.status
              ) && (
                <Link
                  href={`/order/${bike.id}`}
                  className="rounded-xl bg-orange-500 px-7 py-3 font-bold transition hover:bg-orange-400"
                >
                  Order This Bike
                </Link>
              )}

              <FavoriteButton
                bikeId={bike.id}
              />
            </div>
          </div>
        </div>
      </section>

      {/* RELATED MOTORCYCLES */}
      {relatedBikes.length > 0 && (
        <section className="border-t border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              You May Also Like
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Related Used Motorcycles
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedBikes.map(
                (relatedBike) => (
                  <article
                    key={
                      relatedBike.id
                    }
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  >
                    <div className="aspect-[16/10] bg-slate-900">
                      {relatedBike.imageUrl ? (
                        <img
                          src={
                            relatedBike.imageUrl
                          }
                          alt={`${relatedBike.model_year} ${relatedBike.make} ${relatedBike.model}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                          No image
                          available
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-sm text-orange-400">
                        {
                          relatedBike.model_year
                        }{" "}
                        · Used{" "}
                        {relatedBike.bike_type?.replaceAll(
                          "_",
                          " "
                        )}
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {
                          relatedBike.make
                        }{" "}
                        {
                          relatedBike.model
                        }
                      </h3>

                      <p className="mt-3 text-lg font-bold">
                        $
                        {(
                          relatedBike.price_cents /
                          100
                        ).toLocaleString(
                          "en-US"
                        )}
                      </p>

                      <Link
                        href={`/bikes/${relatedBike.id}`}
                        className="mt-5 block rounded-xl bg-white/10 px-4 py-3 text-center font-semibold transition hover:bg-white/15"
                      >
                        View Motorcycle
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}