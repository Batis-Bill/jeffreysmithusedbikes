import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const reviews = [
  {
    name: "David Preston",
    rating: 5,
    text: "The website is clean, easy to navigate, and makes browsing motorcycles really simple.",
  },
  {
    name: "Liam Carter",
    rating: 5,
    text: "I really like how clearly the prices, mileage, and motorcycle details are displayed.",
  },
  {
    name: "Ethan Brooks",
    rating: 5,
    text: "This Jeffrey Smith guy is soo legit. My order came right on time, no delay.",
  },
  {
    name: "Henry Vargas",
    rating: 5,
    text: "I was skeptical at first because I've been scammed of my money several times before. But I got to say, Jeffrey Smith is LEGIT!",
  },
  {
    name: "William Kim",
    rating: 5,
    text: "Best bike-buying experience I've ever had! I was nervous about ordering a bike online, but this site made it completely stress-free. Huge selection of road, hybrid and mountain bikes, clear photos and specs, and the prices were genuinely better than anything I found locally.",
  },
  {
    name: "Wayne Delgado",
    rating: 5,
    text: "Incredible value and fast shipping. Found exactly the e-bike I wanted at a price that beat every other retailer. Ordering took 2 minutes, tracking was clear, and the bike showed up 2 days earlier than expected",
  },
  {
    name: "Daniel Ross",
    rating: 5,
    text: "Compared prices everywhere and this site was the clear winner. The bike I ordered looks and rides better than I expected for the price. Saved me hundreds and the bike is amazing.",
  },
  {
    name: "Emily Lawson",
    rating: 5,
    text: "The ordering process is clear and doesn't feel complicated. Great website design.",
  },
  {
    name: "Serdrick Danso",
    rating: 5,
    text: "I like being able to see the price and important motorcycle information immediately.",
  },
  {
    name: "Edward Keoni",
    rating: 5,
    text: "I’ve bought bikes from shops and online before, but this was by far the best experience. The selection is massive, the descriptions are honest and detailed, and the price I paid was excellent.",
  },
  {
    name: "Emmanuel Nonso",
    rating: 3,
    text: "The website is easy to use, although I would like to see even more motorcycles added to the inventory.",
  },
  {
    name: "Lucas Nguyen",
    rating: 3,
    text: "I shopped around for weeks and kept coming back here because the deals were consistently better. Unbeatable prices without sacrificing quality.",
  },
  {
    name: "Richard Collins",
    rating: 3,
    text: "Excellent prices, great buying experience and excellent tracking.",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-1 text-orange-400"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < rating ? "text-orange-400" : "text-slate-600"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: bikes } = await supabase
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
    .in("status", ["available", "reserved"])
    .order("created_at", { ascending: false })
    .limit(3);

  const featuredBikes = await Promise.all(
    (bikes ?? []).map(async (bike) => {
      const firstImage = bike.bike_images
        ?.sort(
          (a, b) =>
            (a.display_order ?? 0) - (b.display_order ?? 0)
        )[0];

      let imageUrl: string | null = null;

      if (firstImage?.storage_path) {
        const { data } = await supabase.storage
          .from("bike-images")
          .createSignedUrl(firstImage.storage_path, 60 * 60);

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
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Jeffrey Smith Used Bikes
          </Link>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold">
            <Link
              href="/shop"
              className="text-slate-300 transition hover:text-white"
            >
              Shop Bikes
            </Link>

            <a
              href="#about"
              className="text-slate-300 transition hover:text-white"
            >
              About Us
            </a>

            <a
              href="#contact"
              className="text-slate-300 transition hover:text-white"
            >
              Contact
            </a>

            <Link
              href="/privacy"
              className="text-slate-300 transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
             href="/terms"
             className="text-slate-300 transition hover:text-white"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
              Quality Used Motorcycles
            </p>

            <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
              Find your next ride.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Browse used motorcycles with clear pricing, detailed vehicle
              information, and a simple way to submit an order request.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
              >
                Browse Motorcycles
              </Link>

              <a
                href="#about"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold transition hover:bg-white/10"
              >
                Learn About Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MOTORCYCLES */}
      <section
        id="featured"
        className="border-t border-white/10 bg-white/[0.02]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                Inventory
              </p>

              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Featured Motorcycles
              </h2>
            </div>

            <Link
              href="/shop"
              className="font-semibold text-orange-400 hover:text-orange-300"
            >
              View All Bikes →
            </Link>
          </div>

          {featuredBikes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredBikes.map((bike) => (
                <article
                  key={bike.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  <div className="aspect-[16/10] bg-slate-900">
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
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-semibold text-orange-400">
                      {bike.model_year} · {bike.bike_type}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      {bike.make} {bike.model}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xl font-bold">
                        $
                        {(bike.price_cents / 100).toLocaleString(
                          "en-US"
                        )}
                      </p>

                      <p className="text-sm text-slate-400">
                        {bike.mileage?.toLocaleString() ?? 0} miles
                      </p>
                    </div>

                    <Link
                      href={`/bikes/${bike.id}`}
                      className="mt-6 block rounded-xl bg-white/10 px-4 py-3 text-center font-semibold transition hover:bg-white/15"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <h3 className="text-xl font-bold">
                Inventory coming soon
              </h3>

              <p className="mt-2 text-slate-400">
                Check back soon for newly listed motorcycles.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              About Us
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              A simpler way to shop for used motorcycles.
            </h2>

            <p className="mt-6 leading-8 text-slate-300">
              Jeffrey Smith Used Bikes is a New York-based motorcycle website
              designed to make browsing used motorcycles straightforward and
              convenient. Our goal is to give shoppers the important
              information they need without making the buying process confusing
              or difficult.
            </p>

            <p className="mt-5 leading-8 text-slate-300">
              Every listing is designed to clearly present information such as
              the motorcycle's model year, mileage, engine size, transmission,
              condition, price, photos, and availability. Customers can browse
              inventory online, review individual motorcycles, and submit an
              order request directly through the website.
            </p>

            <p className="mt-5 leading-8 text-slate-300">
              We believe motorcycle shoppers should be able to understand what
              they are looking at before making a decision. That is why the
              website focuses on clear listings, straightforward pricing, and
              an easy-to-follow ordering process.
            </p>

            <p className="mt-5 leading-8 text-slate-300">
              As inventory changes, available motorcycles can be added,
              updated, reserved, or removed so visitors can see the most
              current listings available through the site.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
            >
              Explore Inventory
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-3xl">🏍️</div>
              <h3 className="mt-4 text-xl font-bold">
                Motorcycle Focused
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Listings are built around the information motorcycle shoppers
                care about most.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-3xl">📋</div>
              <h3 className="mt-4 text-xl font-bold">
                Detailed Listings
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Review specifications, pricing, mileage, condition, and images
                before submitting an order.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-3xl">💬</div>
              <h3 className="mt-4 text-xl font-bold">
                Direct Contact
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Customers can contact us directly by telephone or email with
                questions about a motorcycle.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-3xl">📍</div>
              <h3 className="mt-4 text-xl font-bold">
                New York
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Jeffrey Smith Used Bikes is based in New York.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold">Clear Pricing</h3>
            <p className="mt-3 leading-7 text-slate-400">
              See listed motorcycle pricing and important details before
              submitting an order request.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold">
              Detailed Listings
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Review mileage, engine size, transmission, condition, and other
              vehicle information.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold">
              Simple Ordering
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Select a motorcycle, submit your contact information, and receive
              an order confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20">
        <div className="mx-auto mb-10 max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Customer Feedback
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            What Customers Say
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            These are actual reviews from customers who have used the website to order their bikes.
          </p>
        </div>

        <div className="review-window">
          <div className="review-track">
            {[...reviews, ...reviews].map((review, index) => (
              <article
                key={`${review.name}-${index}`}
                className="review-card"
              >
                <div className="flex items-center justify-between gap-4">
                  <Stars rating={review.rating} />

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                    Customer Review
                  </span>
                </div>

                <p className="mt-5 leading-7 text-slate-200">
                  “{review.text}”
                </p>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold">
                    {review.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Customer feedback
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="border-y border-white/10 bg-white/[0.02]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Contact Us
            </p>

            <h2 className="mt-3 text-4xl font-bold md:text-5xl">
              Have a question about a motorcycle?
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Contact Jeffrey Smith Used Bikes for questions about inventory,
              motorcycle details, order requests, or general information.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <a
              href="tel:+19294963037"
              className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:bg-white/10"
            >
              <div className="text-3xl">☎️</div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Phone
              </p>

              <p className="mt-2 text-xl font-bold">
                (929) 496-3037
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Tap or click to call.
              </p>
            </a>

            <a
              href="mailto:marieperez2371@gmail.com"
              className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:bg-white/10"
            >
              <div className="text-3xl">✉️</div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Email
              </p>

              <p className="mt-2 break-all text-xl font-bold">
                marieperez2371@gmail.com
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Send us an email with your questions.
              </p>
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="text-3xl">📍</div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Location
              </p>

              <p className="mt-2 text-xl font-bold">
                New York
              </p>

              <p className="mt-3 text-sm text-slate-400">
                United States
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-orange-500/20 bg-orange-500/5 p-6 text-center">
            <p className="text-sm leading-7 text-slate-300">
              For questions about a specific motorcycle, include the make,
              model, model year, or stock number when contacting us so we can
              identify the listing more easily.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Current Inventory
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Ready to find your next motorcycle?
          </h2>

          <p className="mt-4 max-w-2xl text-slate-400">
            Browse available listings and view detailed information for each
            motorcycle.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
          >
            Browse Motorcycles
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-white">
              Jeffrey Smith Used Bikes
            </p>

            <p className="mt-2 text-sm text-slate-500">
              New York, United States
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <Link
              href="/shop"
              className="transition hover:text-white"
            >
              Shop
            </Link>

            <a
              href="#about"
              className="transition hover:text-white"
            >
              About Us
            </a>

            <a
              href="#contact"
              className="transition hover:text-white"
            >
              Contact
            </a>

            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>
            
            <Link
             href="/terms"
             className="transition hover:text-white"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/admin"
              className="transition hover:text-white"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-500">
            © {new Date().getFullYear()} Jeffrey Smith Used Bikes. All rights
            reserved.
          </div>
        </div>
      </footer>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .review-window {
          width: 100%;
          overflow: hidden;
        }

        .review-track {
          display: flex;
          width: max-content;
          gap: 24px;
          animation: reviewScroll 90s linear infinite;
        }

        .review-window:hover .review-track {
          animation-play-state: paused;
        }

        .review-card {
          width: 360px;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.05);
          padding: 24px;
        }

        @keyframes reviewScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-50% - 12px));
          }
        }

        @media (max-width: 640px) {
          .review-card {
            width: 300px;
          }

          .review-track {
            gap: 16px;
            animation-duration: 75s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .review-track {
            animation: none;
          }

          .review-window {
            overflow-x: auto;
          }
        }
      `}</style>
    </main>
  );
}