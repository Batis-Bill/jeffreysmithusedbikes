"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_NEW_IMAGES = 10;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type Bike = {
  id: string;
  stock_number: string;
  make: string;
  model: string;
  model_year: number;
  price_cents: number;
  mileage: number | null;
  engine_capacity_cc: number | null;
  transmission: string;
  fuel_type: string;
  bike_type: string;
  condition: string;
  status: string;
  description: string | null;
  published: boolean;
};

type ExistingImage = {
  storage_path: string;
  alt_text: string | null;
  display_order: number | null;
  signedUrl: string | null;
};

export default function EditBikePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [bike, setBike] =
    useState<Bike | null>(null);

  const [existingImages, setExistingImages] =
    useState<ExistingImage[]>([]);

  const [newImages, setNewImages] =
    useState<File[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadBike() {
      if (!id) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
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
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const {
        data: bikeData,
        error: bikeError,
      } = await supabase
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
          status,
          description,
          published
        `)
        .eq("id", id)
        .single();

      if (bikeError || !bikeData) {
        setErrorMessage(
          "Motorcycle could not be found."
        );
        setLoading(false);
        return;
      }

      const {
        data: imageData,
        error: imageError,
      } = await supabase
        .from("bike_images")
        .select(`
          storage_path,
          alt_text,
          display_order
        `)
        .eq("bike_id", id)
        .order("display_order", {
          ascending: true,
        });

      if (imageError) {
        console.error(
          "Load gallery error:",
          imageError
        );
      }

      const imagesWithUrls =
        await Promise.all(
          (imageData ?? []).map(
            async (image) => {
              const { data } =
                await supabase.storage
                  .from("bike-images")
                  .createSignedUrl(
                    image.storage_path,
                    3600
                  );

              return {
                ...image,
                signedUrl:
                  data?.signedUrl ?? null,
              };
            }
          )
        );

      setBike(bikeData);
      setExistingImages(imagesWithUrls);
      setLoading(false);
    }

    loadBike();
  }, [id, router, supabase]);

  function handleNewImages(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    setErrorMessage("");

    if (files.length > MAX_NEW_IMAGES) {
      event.target.value = "";
      setNewImages([]);

      setErrorMessage(
        `You can add a maximum of ${MAX_NEW_IMAGES} pictures at one time.`
      );

      return;
    }

    for (const file of files) {
      if (
        !allowedImageTypes.includes(file.type)
      ) {
        event.target.value = "";
        setNewImages([]);

        setErrorMessage(
          "Only JPG, PNG, and WebP pictures are allowed."
        );

        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        event.target.value = "";
        setNewImages([]);

        setErrorMessage(
          `Each picture must be under 8 MB. "${file.name}" is too large.`
        );

        return;
      }
    }

    setNewImages(files);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id || !bike) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(
      event.currentTarget
    );

    const stockNumber = String(
      formData.get("stock_number") ?? ""
    ).trim();

    const make = String(
      formData.get("make") ?? ""
    ).trim();

    const model = String(
      formData.get("model") ?? ""
    ).trim();

    const modelYear = Number(
      formData.get("model_year")
    );

    const price = Number(
      formData.get("price")
    );

    const mileage = Number(
      formData.get("mileage")
    );

    const engineCapacity = Number(
      formData.get("engine_capacity_cc")
    );

    const transmission = String(
      formData.get("transmission") ?? ""
    );

    const fuelType = String(
      formData.get("fuel_type") ?? ""
    );

    const bikeType = String(
      formData.get("bike_type") ?? ""
    );

    const condition = String(
      formData.get("condition") ?? ""
    );

    const status = String(
      formData.get("status") ?? ""
    );

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const published =
      formData.get("published") === "on";

    const { error: updateError } =
      await supabase
        .from("bikes")
        .update({
          stock_number: stockNumber,
          make,
          model,
          model_year: modelYear,
          price_cents: Math.round(
            price * 100
          ),
          mileage:
            Number.isFinite(mileage)
              ? mileage
              : 0,
          engine_capacity_cc:
            Number.isFinite(engineCapacity)
              ? engineCapacity
              : null,
          transmission,
          fuel_type: fuelType,
          bike_type: bikeType,
          condition,
          status,
          description:
            description || null,
          published,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id);

    if (updateError) {
      console.error(
        "Update bike error:",
        updateError
      );

      setErrorMessage(
        updateError.message
      );

      setSubmitting(false);
      return;
    }

    const uploadedPaths: string[] = [];
    const rows: {
      bike_id: string;
      storage_path: string;
      alt_text: string;
      display_order: number;
    }[] = [];

    try {
      const startingOrder =
        existingImages.length;

      for (
        let index = 0;
        index < newImages.length;
        index++
      ) {
        const file = newImages[index];

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const path =
          `${id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("bike-images")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(path);

        rows.push({
          bike_id: id,
          storage_path: path,
          alt_text:
            `${modelYear} ${make} ${model} - photo ${startingOrder + index + 1}`,
          display_order:
            startingOrder + index,
        });
      }

      if (rows.length > 0) {
        const { error: rowError } =
          await supabase
            .from("bike_images")
            .insert(rows);

        if (rowError) {
          throw rowError;
        }
      }
    } catch (error) {
      console.error(
        "Add gallery images error:",
        error
      );

      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("bike-images")
          .remove(uploadedPaths);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not upload the new pictures."
      );

      setSubmitting(false);
      return;
    }

    router.push("/admin/inventory");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white">
        <p className="text-slate-400">
          Loading motorcycle...
        </p>
      </main>
    );
  }

  if (!bike) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-6 text-white">
        <p>
          {errorMessage ||
            "Motorcycle not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Jeffrey Smith Used Bikes
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Edit Motorcycle
            </h1>

            <p className="mt-2 text-slate-400">
              Update the motorcycle and add
              pictures to its gallery.
            </p>
          </div>

          <Link
            href="/admin/inventory"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Back to Inventory
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Stock Number *
              </label>

              <input
                name="stock_number"
                required
                defaultValue={
                  bike.stock_number
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Model Year *
              </label>

              <input
                type="number"
                name="model_year"
                required
                defaultValue={
                  bike.model_year
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Make *
              </label>

              <input
                name="make"
                required
                defaultValue={bike.make}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Model *
              </label>

              <input
                name="model"
                required
                defaultValue={bike.model}
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price ($) *
              </label>

              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                defaultValue={
                  bike.price_cents / 100
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Mileage
              </label>

              <input
                type="number"
                name="mileage"
                min="0"
                defaultValue={
                  bike.mileage ?? 0
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Engine Capacity (cc)
              </label>

              <input
                type="number"
                name="engine_capacity_cc"
                min="0"
                defaultValue={
                  bike.engine_capacity_cc ??
                  ""
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Transmission *
              </label>

              <select
                name="transmission"
                defaultValue={
                  bike.transmission
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="manual">
                  Manual
                </option>

                <option value="automatic">
                  Automatic
                </option>

                <option value="semi_automatic">
                  Semi-Automatic
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Fuel Type *
              </label>

              <select
                name="fuel_type"
                defaultValue={
                  bike.fuel_type
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="gasoline">
                  Gasoline
                </option>

                <option value="electric">
                  Electric
                </option>

                <option value="hybrid">
                  Hybrid
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Bike Type *
              </label>

              <select
                name="bike_type"
                defaultValue={
                  bike.bike_type
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="cruiser">
                  Cruiser
                </option>

                <option value="sport">
                  Sport
                </option>

                <option value="touring">
                  Touring
                </option>

                <option value="adventure">
                  Adventure
                </option>

                <option value="standard">
                  Standard
                </option>

                <option value="scooter">
                  Scooter
                </option>

                <option value="dual_sport">
                  Dual Sport
                </option>

                <option value="trike">
                  Trike
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Condition *
              </label>

              <select
                name="condition"
                defaultValue={
                  bike.condition
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="used">
                  Used Bike
                </option>

                <option value="excellent">
                  Used - Excellent
                </option>

                <option value="good">
                  Used - Good
                </option>

                <option value="fair">
                  Used - Fair
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Status *
              </label>

              <select
                name="status"
                defaultValue={bike.status}
                required
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="available">
                  Available
                </option>

                <option value="reserved">
                  Reserved
                </option>

                <option value="sold">
                  Sold
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                rows={6}
                defaultValue={
                  bike.description ?? ""
                }
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />
            </div>

            {/* CURRENT GALLERY */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold">
                Current Gallery
              </h2>

              {existingImages.length >
              0 ? (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {existingImages.map(
                    (image, index) => (
                      <div
                        key={
                          image.storage_path
                        }
                        className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                      >
                        {image.signedUrl ? (
                          <img
                            src={
                              image.signedUrl
                            }
                            alt={
                              image.alt_text ??
                              `Motorcycle photo ${index + 1}`
                            }
                            className="aspect-square h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
                            Image unavailable
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-slate-400">
                  This motorcycle does not
                  have any pictures yet.
                </p>
              )}
            </div>

            {/* ADD MORE */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Add More Pictures
              </label>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleNewImages}
                className="block w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              />

              <p className="mt-2 text-sm text-slate-500">
                Select multiple pictures to
                add to this motorcycle's
                existing gallery.
              </p>

              {newImages.length > 0 && (
                <p className="mt-3 text-sm text-orange-400">
                  {newImages.length} new
                  picture
                  {newImages.length === 1
                    ? ""
                    : "s"}{" "}
                  selected.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={
                    bike.published
                  }
                />

                <span className="font-semibold">
                  Published on website
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 rounded-xl bg-orange-500 px-7 py-3 font-bold hover:bg-orange-400 disabled:opacity-50"
          >
            {submitting
              ? "Saving Changes..."
              : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}