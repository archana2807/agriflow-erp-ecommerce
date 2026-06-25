import { Link } from "react-router-dom";

export default function CustomerFooter() {
  return (
    <footer className="em-footer" style={{ marginTop: "40px" }}>
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 no-underline">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--em-green)" }}>
                <i className="fa-solid fa-tractor text-white"></i>
              </div>
              <div>
                <span className="text-base font-bold block leading-tight text-white">Ambika Krishi Yantra</span>
                <span className="text-[10px]" style={{ color: "var(--em-green)" }}>Agricultural Machinery</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Manufacturer and supplier of high-quality agricultural machinery.
              Serving farmers since decades in Madhya Pradesh.
            </p>
            <a href="tel:08989696971" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white no-underline" style={{ background: "var(--em-green)" }}>
              <i className="fa-solid fa-phone" style={{ fontSize: "11px" }}></i> 089896 96971
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Quick Links</h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {["Home", "Shop", "My Orders", "Account", "Wishlist", "Cart"].map((name) => (
                <li key={name}>
                  <Link to={name === "Home" ? "/" : name === "Shop" ? "/shop" : `/${name.toLowerCase().replace(" ", "-")}`} className="text-sm hover:text-white transition-colors no-underline">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Categories</h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {[
                { name: "Tractor Parts", slug: "tractor-parts" },
                { name: "Thresher", slug: "thresher" },
                { name: "Trali / Trolley", slug: "trali-trolley" },
                { name: "Cultivator", slug: "cultivator" },
                { name: "Plough", slug: "plough" },
                { name: "Sprayer", slug: "sprayer" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="text-sm hover:text-white transition-colors no-underline">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <span className="text-sm leading-relaxed">Jangdiya Talaw, 7/1, Barnagar-Badnawar Rd, Barnagar, MP 456771</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-phone" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <a href="tel:08989696971" className="text-sm no-underline hover:text-white transition-colors">089896 96971</a>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-clock" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <span className="text-sm">Mon - Sat: 8:30 AM - 7:00 PM</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {[
                { icon: "fa-brands fa-facebook-f", bg: "#1877f2" },
                { icon: "fa-brands fa-instagram", bg: "#e4405f" },
                { icon: "fa-brands fa-whatsapp", bg: "#25d366" },
              ].map((s, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center text-white no-underline hover:opacity-80 transition-opacity" style={{ background: s.bg }}>
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid #333" }}>
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm m-0">&copy; {new Date().getFullYear()} Ambika Krishi Yantra. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a key={item} href="#" className="text-sm no-underline hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
