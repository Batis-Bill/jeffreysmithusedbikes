import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Jeffrey Smith Used Bikes
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
          Legal
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-slate-400">
          Last updated: August 9, 2026
        </p>

        <div className="mt-12 space-y-10 leading-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white">
              1. Introduction
            </h2>

            <p className="mt-4">
              Jeffrey Smith Used Bikes respects the privacy of visitors and
              customers who use this website. This Privacy Policy explains the
              types of information that may be collected when you use the
              website, how that information may be used, and the choices
              available to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              2. Information We Collect
            </h2>

            <p className="mt-4">
              When you submit an order request or otherwise provide information
              through the website, we may collect information such as:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Your name</li>
              <li>Email address</li>
              <li>Telephone number</li>
              <li>Delivery or contact address</li>
              <li>Information related to the motorcycle you are interested in</li>
              <li>Your selected payment method</li>
              <li>Messages or additional information you submit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              3. How We Use Information
            </h2>

            <p className="mt-4">
              Information collected through the website may be used to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Process and review order requests</li>
              <li>Respond to customer questions</li>
              <li>Communicate about motorcycle availability</li>
              <li>Provide information related to an order</li>
              <li>Maintain and improve the website</li>
              <li>Prevent misuse, fraud, or unauthorized activity</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              4. Payment Information
            </h2>

            <p className="mt-4">
              If online payment processing is made available, payment
              information may be processed by third-party payment providers.
              Jeffrey Smith Used Bikes should not directly store complete
              payment card numbers or sensitive authentication information when
              payments are handled through a third-party payment processor.
            </p>

            <p className="mt-4">
              Payment providers may process information according to their own
              privacy policies and terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              5. How Information Is Stored
            </h2>

            <p className="mt-4">
              Reasonable technical and organizational measures may be used to
              protect information submitted through the website. However, no
              internet transmission or electronic storage system can be
              guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              6. Sharing of Information
            </h2>

            <p className="mt-4">
              Personal information is not intended to be sold to third parties.
              Information may be shared with service providers when necessary
              to operate the website, process orders or payments, provide
              technical services, comply with legal requirements, or protect
              the website and its users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              7. Cookies and Technical Information
            </h2>

            <p className="mt-4">
              The website and its service providers may use cookies or similar
              technologies that are necessary for website functionality,
              authentication, security, performance, or other website
              operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              8. Third-Party Services
            </h2>

            <p className="mt-4">
              The website may rely on third-party services for hosting,
              databases, authentication, payment processing, or other technical
              functions. Those companies may process information under their
              own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              9. Data Retention
            </h2>

            <p className="mt-4">
              Information may be retained for as long as reasonably necessary
              to process orders, maintain business records, resolve disputes,
              protect the website, and meet applicable legal or accounting
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              10. Your Privacy Choices
            </h2>

            <p className="mt-4">
              Depending on your location and applicable law, you may have
              certain rights regarding your personal information, which may
              include requesting access, correction, or deletion of certain
              information.
            </p>

            <p className="mt-4">
              You may contact us using the information below to make a privacy
              request or ask questions about this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              11. Children's Privacy
            </h2>

            <p className="mt-4">
              This website is not intended to knowingly collect personal
              information from children in violation of applicable law. If you
              believe information has been submitted improperly, please contact
              us so the matter can be reviewed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">
              12. Changes to This Privacy Policy
            </h2>

            <p className="mt-4">
              This Privacy Policy may be updated from time to time. When the
              policy is updated, the revised version may be posted on this page
              with a new “Last updated” date.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <h2 className="text-2xl font-bold text-white">
              13. Contact Us
            </h2>

            <p className="mt-4">
              If you have questions about this Privacy Policy or the handling
              of your information, contact:
            </p>

            <div className="mt-5 space-y-2">
              <p>
                <strong className="text-white">
                  Jeffrey Smith Used Bikes
                </strong>
              </p>

              <p>New York, United States</p>

              <p>
                Phone:{" "}
                <a
                  href="tel:+19294963037"
                  className="text-orange-400 hover:text-orange-300"
                >
                  (929) 496-3037
                </a>
              </p>

              <p>
                Email:{" "}
                <a
                  href="mailto:marieperez2371@gmail.com"
                  className="text-orange-400 hover:text-orange-300"
                >
                  marieperez2371@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-14">
          <Link
            href="/"
            className="inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold transition hover:bg-orange-400"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}