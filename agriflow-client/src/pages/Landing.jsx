import { Link } from "react-router-dom";
import {
  Leaf,
  ArrowRight,
  Truck,
  Shield,
  HeadphonesIcon,
  RotateCcw,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";
import StorefrontNavbar from "../components/storefront/StorefrontNavbar";


const categories = [
  { name: "Cultivator", emoji: "🚜", param: "cultivator" },
  { name: "Thresher", emoji: "⚙️", param: "thresher" },
  { name: "Plough", emoji: "🛡️", param: "plough" },
  { name: "Trolley", emoji: "🚛", param: "trolley" },
  { name: "Seed Drill", emoji: "🌱", param: "seed-drill" },
  { name: "Sprayer", emoji: "💧", param: "sprayer" },
  { name: "Rotavator", emoji: "🔧", param: "rotavator" },
  { name: "Harvester", emoji: "🌾", param: "harvester" },
];

const features = [
  { icon: Truck, title: "Free Delivery", desc: "Fast delivery across India" },
  { icon: Shield, title: "Quality Products", desc: "Built with high-grade materials" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated after-sales support" },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free return policy" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <StorefrontNavbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-800 to-green-600 text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium tracking-wide backdrop-blur-sm">
              AGRICULTURE EQUIPMENT SPECIALIST
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Ambika Krishi <span className="text-yellow-300">Yantra</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100 sm:text-xl">
              Premium agricultural equipment trusted by 2000+ farmers.
              Factory-direct prices on cultivators, threshers, ploughs &amp; more.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
      </section>

      {/* Features Bar */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Our Range
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Agricultural Equipment
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${cat.param}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="text-4xl">{cat.emoji}</span>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to upgrade your farm?
            </h2>
            <p className="mt-4 max-w-xl text-emerald-100">
              Get the best agricultural equipment at factory-direct prices.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300" id="contact">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-white">
                <Leaf size={22} />
                <span className="text-lg font-bold">Ambika Krishi Yantra</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Trusted manufacturer of premium agricultural equipment since 2015.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/products" className="transition hover:text-emerald-400">
                    Browse Products
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="transition hover:text-emerald-400">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="transition hover:text-emerald-400">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-emerald-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Contact Us
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span>Jangdiya Talaw, 7/1, Barnagar - Badnawar Rd, Barnagar, MP 456771</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0 text-emerald-400" />
                  <span>089896 96971</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-emerald-400" />
                  <span>Opens 8:30 AM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            &copy; 2026 Ambika Krishi Yantra. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
