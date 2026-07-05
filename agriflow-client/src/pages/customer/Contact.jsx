import { Phone, MapPin, Clock, MessageCircle, Send, Headphones, Truck, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="shop-page">
      <div className="page-hero page-hero-green">
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <Headphones className="h-6 w-6" />
            <div>
              <h1>Contact Us</h1>
              <p>We'd love to hear from you. Reach out anytime!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-grid">
        <div className="contact-info-col">
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-card-icon green">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3>Call Us</h3>
                <a href="tel:08989696971">089896 96971</a>
                <p>Mon - Sat: 8:30 AM - 7:00 PM</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon blue">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3>Visit Us</h3>
                <p>Jangdiya Talaw, 7/1, Barnagar-Badnawar Rd</p>
                <p>Barnagar, MP 456771</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-card-icon purple">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3>WhatsApp</h3>
                <a href="https://wa.me/918989696971" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                <p>Quick response guaranteed</p>
              </div>
            </div>
          </div>

          <div className="contact-trust">
            {[
              { icon: <Truck className="h-4 w-4" />, text: "Free delivery on orders above ₹5,000" },
              { icon: <Shield className="h-4 w-4" />, text: "Quality assured products" },
              { icon: <Clock className="h-4 w-4" />, text: "Same day dispatch for orders before 2 PM" },
            ].map((item, i) => (
              <div key={i} className="contact-trust-item">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-form-col">
          <div className="contact-form-card">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="bulk">Bulk Order</option>
                  <option value="support">Product Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="Tell us how we can help..."></textarea>
              </div>
              <button type="submit" className="btn-primary btn-full" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
