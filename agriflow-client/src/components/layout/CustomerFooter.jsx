import { Link } from "react-router-dom";

export default function CustomerFooter() {
  return (
    <footer className="em-footer mt-10">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 no-underline">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--em-green)" }}>
                <i className="fa-solid fa-tractor text-white"></i>
              </div>
              <div>
                <span className="text-base font-bold block leading-tight" style={{ color: "#f8fafc" }}>Ambika Krishi Yantra</span>
                <span className="text-[10px]" style={{ color: "var(--em-green)" }}>Agricultural Machinery</span>
              </div>
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              Manufacturer and supplier of high-quality agricultural machinery.
              Serving farmers since decades in Madhya Pradesh.
            </p>
            <a
              href="tel:08989696971"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline"
              style={{ background: "var(--em-green)", color: "#fff" }}
            >
              <i className="fa-solid fa-phone" style={{ fontSize: "11px" }}></i> 089896 96971
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { name: "Home", path: "/" },
                { name: "Shop", path: "/shop" },
                { name: "My Orders", path: "/my-orders" },
                { name: "Account", path: "/profile" },
                { name: "Wishlist", path: "/wishlist" },
                { name: "Cart", path: "/cart" },
              ].map((link) => (
                <li key={link.name} style={{ marginBottom: 10 }}>
                  <Link
                    to={link.path}
                    style={{ fontSize: 13, transition: "color 0.2s" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Categories
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { name: "Tractor Parts", slug: "tractor-parts" },
                { name: "Thresher", slug: "thresher" },
                { name: "Trali / Trolley", slug: "trali-trolley" },
                { name: "Cultivator", slug: "cultivator" },
                { name: "Plough", slug: "plough" },
                { name: "Sprayer", slug: "sprayer" },
              ].map((cat) => (
                <li key={cat.slug} style={{ marginBottom: 10 }}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    style={{ fontSize: 13, transition: "color 0.2s" }}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Contact Info
            </h3>
            <div>
              <div className="flex items-start gap-3" style={{ marginBottom: 14 }}>
                <i className="fa-solid fa-location-dot mt-1" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <span style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Jangdiya Talaw, 7/1, Barnagar-Badnawar Rd, Barnagar, MP 456771
                </span>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <i className="fa-solid fa-phone" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <a href="tel:08989696971" style={{ fontSize: 13 }}>089896 96971</a>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <i className="fa-solid fa-clock" style={{ color: "var(--em-green)", fontSize: "13px" }}></i>
                <span style={{ fontSize: 13 }}>Mon - Sat: 8:30 AM - 7:00 PM</span>
              </div>
            </div>
            <div className="flex gap-2" style={{ marginTop: 16 }}>
              {[
                { icon: "fa-brands fa-facebook-f", bg: "#1877f2" },
                { icon: "fa-brands fa-instagram", bg: "#e4405f" },
                { icon: "fa-brands fa-whatsapp", bg: "#25d366" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={i === 0 ? "https://facebook.com" : i === 1 ? "https://instagram.com" : "https://wa.me/918989696971"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center no-underline"
                  style={{ background: s.bg, color: "#fff", transition: "opacity 0.2s" }}
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #1e293b" }}>
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p style={{ fontSize: 12, margin: 0 }}>
            &copy; {new Date().getFullYear()} Ambika Krishi Yantra. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ fontSize: 12, transition: "color 0.2s" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
