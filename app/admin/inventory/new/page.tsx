"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function NewBikePage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    async function checkAdmin() {
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

      setCheckingAuth(false);
    }

    checkAdmin();
  }, [router, supabase]);

  function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    setErrorMessage("");

    if (files.length > MAX_IMAGES) {
      setSelectedImages([]);
      event.target.value = "";
      setErrorMessage(
        `You can upload a maximum of ${MAX_IMAGES} pictures per motorcycle.`
      );
      return;
    }

    for (const file of files) {
      if (!allowedImageTypes.includes(file.type)) {
        setSelectedImages([]);
        event.target.value = "";
        setErrorMessage(
          "Only JPG, PNG, and WebP pictures are allowed."
        );
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setSelectedImages([]);
        event.target.value = "";
        setErrorMessage(
          `Each picture must be smaller than 8 MB. "${file.name}" is too large.`
        );
        return;
      }
    }

    setSelectedImages(files);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

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
    ).trim();

    const fuelType = String(
      formData.get("fuel_type") ?? ""
    ).trim();

    const bikeType = String(
      formData.get("bike_type") ?? ""
    ).trim();

    const condition = String(
      formData.get("condition") ?? ""
    ).trim();

    const status = String(
      formData.get("status") ?? ""
    ).trim();

    const description = String(
      formData.get("description") ?? ""
    ).trim();

    const published =
      formData.get("published") === "on";

    if (
      !stockNumber ||
      !make ||
      !model ||
      !modelYear ||
      !price ||
      !transmission ||
      !fuelType ||
      !bikeType ||
      !condition ||
      !status
    ) {
      setErrorMessage(
        "Please complete all required fields."
      );
      setSubmitting(false);
      return;
    }

    if (selectedImages.length > MAX_IMAGES) {
      setErrorMessage(
        `You can upload a maximum of ${MAX_IMAGES} pictures.`
      );
      setSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const { data: newBike, error: bikeError } =
      await supabase
        .from("bikes")
        .insert({
          stock_number: stockNumber,
          make,
          model,
          model_year: modelYear,
          price_cents: Math.round(price * 100),
          mileage: Number.isFinite(mileage)
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
          created_by: user.id,
        })
        .select("id")
        .single();

    if (bikeError || !newBike) {
      console.error(
        "Create bike error:",
        bikeError
      );

      setErrorMessage(
        bikeError?.message ??
          "Could not create the motorcycle."
      );

      setSubmitting(false);
      return;
    }

    const uploadedPaths: string[] = [];
    const imageRows: {
      bike_id: string;
      storage_path: string;
      alt_text: string;
      display_order: number;
    }[] = [];

    try {
      for (
        let index = 0;
        index < selectedImages.length;
        index++
      ) {
        const file = selectedImages[index];

        const extension =
          file.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const storagePath =
          `${newBike.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("bike-images")
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);

        imageRows.push({
          bike_id: newBike.id,
          storage_path: storagePath,
          alt_text:
            `${modelYear} ${make} ${model} - photo ${index + 1}`,
          display_order: index,
        });
      }

      if (imageRows.length > 0) {
        const { error: imageInsertError } =
          await supabase
            .from("bike_images")
            .insert(imageRows);

        if (imageInsertError) {
          throw imageInsertError;
        }
      }
    } catch (error) {
      console.error(
        "Gallery upload error:",
        error
      );

      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("bike-images")
          .remove(uploadedPaths);
      }

      await supabase
        .from("bikes")
        .delete()
        .eq("id", newBike.id);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The motorcycle pictures could not be uploaded."
      );

      setSubmitting(false);
      return;
    }

    router.push("/admin/inventory");
    router.refresh();
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111f] text-white">
        <p className="text-slate-400">
          Loading...
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
              Add Motorcycle
            </h1>

            <p className="mt-2 text-slate-400">
              Add a used motorcycle and upload
              its photo gallery.
            </p>
          </div>

          <Link
            href="/admin/inventory"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Back to Inventory
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"
        >
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
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
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
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
                min="1900"
                max="2100"
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Make *
              </label>

              <input
                name="make"
                required
                placeholder="Honda"
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Model *
              </label>

              <input
                name="model"
                required
                placeholder="Gold Wing"
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
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
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
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
                defaultValue="0"
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
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
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Transmission *
              </label>

              <select
                name="transmission"
                required
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="" disabled>
                  Select transmission
                </option>

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
                required
                defaultValue="gasoline"
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
                required
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3"
              >
                <option value="" disabled>
                  Select bike type
                </option>

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
                required
                defaultValue="used"
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
                required
                defaultValue="available"
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
                placeholder="Describe the motorcycle, condition, features, service history, etc."
                className="w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Motorcycle Gallery
              </label>

              <input
                type="file"
                name="bike_images"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelection}
                className="block w-full rounded-xl border border-white/10 bg-[#0c1728] px-4 py-3 text-sm"
              />

              <p className="mt-2 text-sm text-slate-500">
                Upload up to {MAX_IMAGES} JPG,
                PNG, or WebP pictures. Each
                picture can be up to 8 MB.
              </p>

              {selectedImages.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold">
                    {selectedImages.length} picture
                    {selectedImages.length === 1
                      ? ""
                      : "s"}{" "}
                    selected
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    {selectedImages.map(
                      (file, index) => (
                        <p key={`${file.name}-${index}`}>
                          {index + 1}. {file.name}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked
                />

                <span className="font-semibold">
                  Publish this motorcycle on the
                  website
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 rounded-xl bg-orange-500 px-7 py-3 font-bold transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Saving Motorcycle..."
              : "Add Motorcycle"}
          </button>
        </form>
      </div>
    </main>
  );
}