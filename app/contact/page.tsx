import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with our support team for bookings, refunds or agent queries.",
};

export default function ContactPage() {
  return (
    <>
      <CommonHeader variant="b2c" />
      <main className="min-h-screen pt-20 bg-muted/20">
        <ContactForm variant="public" />
      </main>
      <CommonFooter />
    </>
  );
}