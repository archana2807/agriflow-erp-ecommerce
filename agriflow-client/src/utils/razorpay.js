export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpay = ({ order, user, onSuccess, onError }) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_yourkey",
    amount: order.amount,
    currency: order.currency || "INR",
    name: "Ambika Krishi Yantra",
    description: "Payment for your order",
    order_id: order.id,
    handler: (response) => onSuccess(response),
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
    },
    theme: {
      color: "#16a34a",
    },
    modal: {
      ondismiss: () => onError?.("Payment cancelled"),
    },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
};
