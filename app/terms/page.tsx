import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Jeffrey Smith Used Bikes
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold"
          >
            Back Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
          Legal
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Terms & Conditions
        </h1>

        <p className="mt-4 text-slate-400">
          Last updated: August 9, 2026
        </p>

        <div className="mt-12 space-y-10 leading-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white">
              1. Acceptance of Terms
            </h2>

            <p className="mt-4">
              By accessing or using the Jeffrey Smith Used Bikes
              website, you agree to comply with these Terms &
              Conditions. If you do not agree with these terms, you
              should not use the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              2. Motorcycle Listings
            </h2>

            <p className="mt-4">
              We aim to provide accurate information regarding
              motorcycles, including specifications, mileage,
              condition, availability, photographs, and pricing.
              Information may occasionally contain errors or require
              updating.
            </p>

            <p className="mt-4">
              Motorcycle availability may change at any time and a
              listing displayed as available does not guarantee that
              the vehicle remains available until an order or sale is
              confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              3. Orders
            </h2>

            <p className="mt-4">
              Submitting an order through this website does not
              necessarily constitute final acceptance of a sale.
              Orders may be subject to availability, verification,
              payment confirmation, and other applicable requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              4. Pricing
            </h2>

            <p className="mt-4">
              Prices displayed on the website are subject to change.
              Any applicable taxes, registration costs, delivery
              charges, processing charges, or other fees should be
              disclosed as applicable before a transaction is
              finalized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              5. Payments
            </h2>

            <p className="mt-4">
              Where online payments are offered, payments may be
              processed by third-party payment providers. Additional
              terms imposed by those payment providers may apply.
            </p>

            <p className="mt-4">
              An order should not be treated as paid solely because a
              customer reaches a confirmation page. Payment must be
              independently confirmed through the applicable payment
              system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              6. Vehicle Condition
            </h2>

            <p className="mt-4">
              Used motorcycles may show normal wear consistent with
              their age, mileage, and prior use. Customers should
              review the information available for each motorcycle
              and ask questions about condition before completing a
              purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              7. Delivery and Collection
            </h2>

            <p className="mt-4">
              Delivery or collection arrangements, availability,
              timing, costs, and applicable conditions should be
              confirmed as part of the individual transaction.
              Estimated dates are not guarantees unless expressly
              agreed otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              8. Cancellations and Refunds
            </h2>

            <p className="mt-4">
              Cancellation, deposit, and refund eligibility may
              depend on the circumstances of the transaction and
              applicable law. Customers should obtain the applicable
              terms before submitting a non-refundable payment or
              completing a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              9. Website Use
            </h2>

            <p className="mt-4">
              Users may not misuse the website, attempt unauthorized
              access, interfere with website security, submit
              fraudulent information, or use the website for
              unlawful purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              10. Intellectual Property
            </h2>

            <p className="mt-4">
              Website branding, original text, graphics, photographs,
              and other content may be protected by intellectual
              property laws and may not be copied or redistributed
              without appropriate authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              11. Privacy
            </h2>

            <p className="mt-4">
              Use of personal information submitted through the
              website is also governed by our Privacy Policy.
            </p>

            <Link
              href="/privacy"
              className="mt-3 inline-block font-semibold text-orange-400 hover:text-orange-300"
            >
              Read the Privacy Policy →
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              12. Changes to These Terms
            </h2>

            <p className="mt-4">
              These Terms & Conditions may be updated when website
              services or business practices change. Updated terms
              may be published on this page with a revised update
              date.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <h2 className="text-2xl font-bold text-white">
              13. Contact
            </h2>

            <div className="mt-5 space-y-2">
              <p className="font-bold text-white">
                Jeffrey Smith Used Bikes
              </p>

              <p>New York, United States</p>

              <p>
                Phone:{" "}
                <a
                  href="tel:+19294963037"
                  className="text-orange-400"
                >
                  (929) 496-3037
                </a>
              </p>

              <p>
                Email:{" "}
                <a
                  href="mailto:marieperez2371@gmail.com"
                  className="text-orange-400"
                >
                  marieperez2371@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}