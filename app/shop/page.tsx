import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FavoriteButton from "@/components/FavoriteButton";

type SearchParams = Promise<{
  search?: string;
  make?: string;
  type?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const search = params.search?.trim() ?? "";
  const make = params.make?.trim() ?? "";
  const type = params.type?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const minPrice = Number(params.minPrice ?? 0);
  const maxPrice = Number(params.maxPrice ?? 0);
  const sort = params.sort ?? "newest";

  let query = supabase
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
      created_at,
      bike_images (
        storage_path,
        alt_text,
        display_order
      )
    `)
    .eq("published", true);

  if (search) {
    query = query.or(
      `make.ilike.%${search}%,model.ilike.%${search}%,stock_number.ilike.%${search}%`
    );
  }

  if (make) {
    query = query.eq("make", make);
  }

  if (type) {
    query = query.eq("bike_type", type);
  }

  if (status) {
    query = query.eq("status", status);
  } else {
    query = query.in("status", ["available", "reserved"]);
  }

  if (minPrice > 0) {
    query = query.gte(
      "price_cents",
      Math.round(minPrice * 100)
    );
  }

  if (maxPrice > 0) {
    query = query.lte(
      "price_cents",
      Math.round(maxPrice * 100)
    );
  }

  if (sort === "price-low") {
    query = query.order("price_cents", {
      ascending: true,
    });
  } else if (sort === "price-high") {
    query = query.order("price_cents", {
      ascending: false,
    });
  } else if (sort === "mileage") {
    query = query.order("mileage", {
      ascending: true,
    });
  } else if (sort === "year") {
    query = query.order("model_year", {
      ascending: false,
    });
  } else {
    query = query.order("created_at", {
      ascending: false,
    });
  }

  const { data: bikes } = await query;

  const { data: filterBikes } = await supabase
    .from("bikes")
    .select("make, bike_type")
    .eq("published", true);

  const makes = Array.from(
    new Set(
      (filterBikes ?? [])
        .map((bike) => bike.make)
        .filter(Boolean)
    )
  ).sort();

  const bikeTypes = Array.from(
    new Set(
      (filterBikes ?? [])
        .map((bike) => bike.bike_type)
        .filter(Boolean)
    )
  ).sort();

  const bikesWithImages = await Promise.all(
    (bikes ?? []).map(async (bike) => {
      const firstImage = bike.bike_images
        ?.sort(
          (a, b) =>
            (a.display_order ?? 0) -
            (b.display_order ?? 0)
        )[0];

      let imageUrl: string | null = null;

      if (firstImage?.storage_path) {
        const { data } = await supabase.storage
          .from("bike-images")
          .createSignedUrl(
            firstImage.storage_path,
            60 * 60
          );

        imageUrl = data?.signedUrl ?? null;
      }

      return {
        ...bike,
        imageUrl,
        imageAlt:
          firstImage?.alt_text ??
          `${bike.model_year} ${bike.make} ${bike.model}`,
      };
    })
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Jeffrey Smith Used Bikes
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
          Inventory
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Shop Motorcycles
        </h1>

        <p className="mt-3 text-slate-400">
          Search and filter the current inventory.
        </p>

        <form className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search make, model or stock #"
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
            />

            <select
              name="make"
              defaultValue={make}
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            >
              <option value="">All Makes</option>

              {makes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              name="type"
              defaultValue={type}
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            >
              <option value="">All Types</option>

              {bikeTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={status}
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            >
              <option value="">Available & Reserved</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>

            <input
              type="number"
              name="minPrice"
              defaultValue={params.minPrice}
              min="0"
              placeholder="Minimum price"
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            />

            <input
              type="number"
              name="maxPrice"
              defaultValue={params.maxPrice}
              min="0"
              placeholder="Maximum price"
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            />

            <select
              name="sort"
              defaultValue={sort}
              className="rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
            >
              <option value="newest">
                Newest Listings
              </option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="mileage">
                Lowest Mileage
              </option>
              <option value="year">
                Newest Model Year
              </option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold hover:bg-orange-400"
            >
              Search Inventory
            </button>
          </div>

          <div className="mt-4">
            <Link
              href="/shop"
              className="text-sm font-semibold text-slate-400 hover:text-white"
            >
              Clear Filters
            </Link>
          </div>
        </form>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-slate-400">
            {bikesWithImages.length} motorcycle
            {bikesWithImages.length === 1 ? "" : "s"} found
          </p>
        </div>

        {bikesWithImages.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bikesWithImages.map((bike) => (
              <article
                key={bike.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-[16/10] bg-slate-900">
                  {bike.imageUrl ? (
                    <img
                      src={bike.imageUrl}
                      alt={bike.imageAlt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                      No image available
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-[#07111f]/90 px-3 py-1 text-xs font-bold capitalize">
                    {bike.status}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-sm font-semibold text-orange-400">
                    {bike.model_year} · {bike.bike_type}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {bike.make} {bike.model}
                  </h2>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold">
                      $
                      {(
                        bike.price_cents / 100
                      ).toLocaleString("en-US")}
                    </p>

                    <p className="text-sm text-slate-400">
                      {bike.mileage?.toLocaleString() ?? 0} miles
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href={`/bikes/${bike.id}`}
                      className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-center font-bold hover:bg-orange-400"
                    >
                      View Details
                    </Link>

                    <FavoriteButton bikeId={bike.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-xl font-bold">
              No motorcycles found
            </h2>

            <p className="mt-2 text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}