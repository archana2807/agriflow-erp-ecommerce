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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="bg-green-600 text-white rounded-2xl p-6 mb-6 shadow-lg shadow-green-600/20">
        <div className="flex items-center gap-3">
          <Headphones className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Contact Us</h1>
            <p className="text-green-100 text-sm">We'd love to hear from you. Reach out anytime!</p>
          </div>
        </div>
      </div>

      {/* Contact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border p-4 space-y-4">
            {/* Call Us Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Call Us</h3>
                <a href="tel:08989696971" className="text-green-600 hover:underline">089896 96971</a>
                <p className="text-sm text-gray-500">Mon - Sat: 8:30 AM - 7:00 PM</p>
              </div>
            </div>

            {/* Visit Us Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Visit Us</h3>
                <p className="text-sm text-gray-600">Jangdiya Talaw, 7/1, Barnagar-Badnawar Rd</p>
                <p className="text-sm text-gray-600">Barnagar, MP 456771</p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <a href="https://wa.me/918989696971" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Chat on WhatsApp</a>
                <p className="text-sm text-gray-500">Quick response guaranteed</p>
              </div>
            </div>
          </div>

          {/* Trust Items */}
          <div className="mt-4 space-y-3">
            {[
              { icon: <Truck className="h-4 w-4" />, text: "Free delivery on orders above ₹5,000" },
              { icon: <Shield className="h-4 w-4" />, text: "Quality assured products" },
              { icon: <Clock className="h-4 w-4" />, text: "Same day dispatch for orders before 2 PM" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Send us a Message</h2>
            <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Your name"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Your phone"
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="bulk">Bulk Order</option>
                  <option value="support">Product Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/30 hover:shadow-xl"
              >
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
