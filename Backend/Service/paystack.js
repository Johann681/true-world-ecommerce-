// services/paystack.js
import axios from "axios";
console.log("Paystack secret key:", process.env.PAYSTACK_SECRET_KEY);
console.log("Paystack baseURL:", process.env.PAYSTACK_BASE_URL);
console.log("Loaded PAYSTACK_SECRET_KEY:", process.env.PAYSTACK_SECRET_KEY?.slice(0, 10));
console.log("Loaded PAYSTACK_BASE_URL:", process.env.PAYSTACK_BASE_URL);


const paystack = axios.create({
  baseURL: process.env.PAYSTACK_BASE_URL, // MUST be just https://api.paystack.co
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export default paystack;
