export const dynamic = "force-dynamic";

import { CommerceForm } from "@/components/website/CommerceForms";
import { FiPhone, FiMail, FiClock, FiMapPin } from "react-icons/fi";

export const metadata = {
  title: "Contact Nestro Furniture",
  description:
    "Contact Nestro Furniture for product, delivery, assembly, returns and showroom support in India.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact Nestro Furniture",
    description:
      "Get help with Nestro products, delivery, returns and showroom enquiries.",
  },
};

export default async function ContactPage() {
  let settings = {};

  try {
    const response = await fetch(
      (process.env.API_BASE_URL || "http://localhost:5000/api") +
        "/commerce/settings",
      {
        cache: "no-store",
      },
    );

    if (response.ok) {
      settings = (await response.json()).data || {};
    }
  } catch {
    settings = {};
  }

  const businessAddress =
    settings.businessAddress || "Malviya Nagar, Jaipur, Rajasthan 302017";

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#faf8f4] text-[#2b1b11]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[6px] text-[#9a6a43]">
            Get in Touch
          </p>

          <h1 className="text-3xl font-medium leading-tight tracking-tight text-[#2b1b11] sm:text-5xl">
            We&apos;d love to hear from you
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-[#786454] sm:text-[16px]">
            Whether it&apos;s a question, a custom order, or just a love note —
            we&apos;re here.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 sm:p-7">
              <div className="divide-y divide-[#e8ded0] [&>div]:py-5 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0">
                <InfoItem
                  icon={<FiPhone />}
                  label="Phone"
                  value={settings.supportPhone || "Use the contact form"}
                />

                <InfoItem
                  icon={<FiMail />}
                  label="Email"
                  value={settings.supportEmail || "Use the contact form"}
                />

                <InfoItem
                  icon={<FiClock />}
                  label="Hours"
                  value={
                    settings.businessHours ||
                    "Please contact us for availability"
                  }
                />

                <InfoItem
                  icon={<FiMapPin />}
                  label="Business address"
                  value={businessAddress}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-white shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28477.39522738805!2d75.8179064!3d26.85030645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db67377871437%3A0x6d191b0b94eae76b!2sMalviya%20Nagar%2C%20Jaipur%2C%20Rajasthan%20302017!5e0!3m2!1sen!2sin!4v1789131713886!5m2!1sen!2sin"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Nestro Business Location"
                className="block h-[300px] w-full sm:h-[350px] lg:h-[380px]"
              />
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-8 lg:p-10">
            <h2 className="text-2xl font-medium text-[#2b1b11]">
              Send us a message
            </h2>

            <p className="mb-7 mt-2 text-sm leading-6 text-[#786454]">
              We typically respond within 24 hours.
            </p>

            <CommerceForm kind="contact" />
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 min-w-11 items-center justify-center rounded-lg bg-[#f0ebe3] text-[18px] text-[#98663e]">
        {icon}
      </div>

      <div className="min-w-0 break-words">
        <p className="text-[12px] uppercase tracking-[3px] text-[#786454]">
          {label}
        </p>

        <h3 className="mt-1 text-[15px] font-semibold text-[#2b1b11]">
          {value}
        </h3>
      </div>
    </div>
  );
}
