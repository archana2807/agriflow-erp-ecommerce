import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Tractor } from "lucide-react";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "My Orders", path: "/my-orders" },
  { name: "Account", path: "/profile" },
  { name: "Wishlist", path: "/wishlist" },
  { name: "Cart", path: "/cart" },
];

const categories = [
  { name: "Tractor Parts", slug: "tractor-parts" },
  { name: "Thresher", slug: "thresher" },
  { name: "Trali / Trolley", slug: "trali-trolley" },
  { name: "Cultivator", slug: "cultivator" },
  { name: "Plough", slug: "plough" },
  { name: "Sprayer", slug: "sprayer" },
];

export default function CustomerFooter() {
  return (
    <footer className="bg-[#0f172a] mt-10 shadow-inner">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 no-underline">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-600">
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold block leading-tight text-slate-50">Ambika Krishi Yantra</span>
                <span className="text-[10px] text-green-400">Agricultural Machinery</span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-6 mb-4">
              Manufacturer and supplier of high-quality agricultural machinery.
              Serving farmers since decades in Madhya Pradesh.
            </p>
            <a
              href="tel:08989696971"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors no-underline"
            >
              <Phone className="w-3 h-3" /> 089896 96971
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-50 text-xs font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-xs text-slate-400 hover:text-green-400 transition-colors no-underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-slate-50 text-xs font-semibold uppercase tracking-wider mb-4">Categories</h3>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="text-xs text-slate-400 hover:text-green-400 transition-colors no-underline">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-50 text-xs font-semibold uppercase tracking-wider mb-4">Contact Info</h3>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-green-400 shrink-0" />
                <span className="text-xs text-slate-400 leading-5">
                  Jangdiya Talaw, 7/1, Barnagar-Badnawar Rd, Barnagar, MP 456771
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <a href="tel:08989696971" className="text-xs text-slate-400 hover:text-green-400 transition-colors no-underline">089896 96971</a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="text-xs text-slate-400">Mon - Sat: 8:30 AM - 7:00 PM</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-[#1877f2] hover:opacity-80 hover:scale-110 transition-all no-underline text-xs font-bold">f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-[#e4405f] hover:opacity-80 hover:scale-110 transition-all no-underline text-xs font-bold">ig</a>
              <a href="https://wa.me/918989696971" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-[#25d366] hover:opacity-80 hover:scale-110 transition-all no-underline text-xs font-bold">wa</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 m-0">&copy; {new Date().getFullYear()} Ambika Krishi Yantra. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a key={item} href="#" className="text-xs text-slate-500 hover:text-green-400 transition-colors no-underline">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
