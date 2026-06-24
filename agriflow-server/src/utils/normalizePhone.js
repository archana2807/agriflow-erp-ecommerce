// utils/normalizePhone.js
const normalizePhone = (phone) => {
  return phone
    .replace(/\D/g, "")      // remove non-digits
    .replace(/^91/, "")      // remove country code (India)
    .trim();
};

export default normalizePhone