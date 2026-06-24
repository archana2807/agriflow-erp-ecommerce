import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, MapPin, Phone, Clock, Mail, ArrowRight, Send } from "lucide-react";
import StorefrontNavbar from "../components/storefront/StorefrontNavbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const contactCards = [
  {
    icon: MapPin,
    title: "Address",
    content: "Jangdiya Talaw, 7/1, Barnagar - Badnawar Rd, Barnagar, Madhya Pradesh 456771",
  },
  {
    icon: Phone,
    title: "Phone",
    content: "089896 96971",
    href: "tel:08989696971",
  },
  {
    icon: Clock,
    title: "Hours",
    content: "Opens 8:30 AM",
    sub: "Ashura — reduced hours",
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@ambikakrishiyantra.com",
    href: "mailto:info@ambikakrishiyantra.com",
  },
];

const footerLinks = [
  { to: "/shop", label: "Browse Equipment" },
  { to: "/register", label: "Create Account" },
  { to: "/login", label: "Sign In" },
  { to: "/contact", label: "Contact Us" },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StorefrontNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-900 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            Get in Touch
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
          <p className="mx-auto max-w-xl text-lg text-green-100">
            Visit us or give us a call. We're happy to help with any questions about our equipment.
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="mx-auto max-w-5xl px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <div
              key={card.title}
              className="group rounded-xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <card.icon size={24} />
              </div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {card.title}
              </h3>
              {card.href ? (
                <a
                  href={card.href}
                  className="text-sm font-medium text-green-700 underline-offset-2 hover:underline dark:text-green-400"
                >
                  {card.content}
                </a>
              ) : (
                <p className="text-sm text-foreground">{card.content}</p>
              )}
              {card.sub && (
                <p className="mt-1 text-xs text-amber-600">{card.sub}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="mb-2 text-2xl font-bold">Send us a Message</h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Your Name</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ramesh Patil"
                    required
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ramesh@example.com"
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Subject</label>
                  <Input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Product inquiry"
                    className="h-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need..."
                  rows={5}
                  required
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-green-600 focus-visible:ring-3 focus-visible:ring-green-600/20 focus-visible:outline-none"
                />
              </div>

              <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Send Message <Send size={16} />
              </Button>
            </form>
          </div>

          {/* Map Card */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex aspect-[4/3] items-center justify-center bg-green-50 dark:bg-green-950/30">
                <iframe
                  title="Ambika Krishi Yantra Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235013.1392!2d74.8!3d22.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fc98d5f9c0db%3A0x56e15b8b2e4ca3b1!2sBarnagar%2C%20Madhya%20Pradesh%20456771!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-5">
                <h3 className="mb-1 font-semibold">Ambika Krishi Yantra</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Jangdiya Talaw, 7/1, Barnagar - Badnawar Rd, Barnagar, MP 456771
                </p>
                <a
                  href="https://maps.google.com/?q=Barnagar+Madhya+Pradesh+456771"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 underline-offset-2 hover:underline dark:text-green-400"
                >
                  Open in Google Maps <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Link to="/" className="mb-4 inline-flex items-center gap-2 text-lg font-bold">
                <Leaf size={24} className="text-green-600" />
                Ambika Krishi Yantra
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Trusted manufacturer of premium agricultural equipment since 2015.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-foreground transition-colors hover:text-green-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact Us
              </h4>
              <div className="flex flex-col gap-3 text-sm text-foreground">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-green-600" />
                  <span>Jangdiya Talaw, 7/1, Barnagar - Badnawar Rd, Barnagar, MP 456771</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-green-600" />
                  <span>089896 96971</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-green-600" />
                  <span>Opens 8:30 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ambika Krishi Yantra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
