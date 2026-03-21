import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
}); 

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.post("/create-order", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount < 100) {
      return res.status(400).send("Invalid amount");
    }

    const options = {
      amount: amount,
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).send("Error creating order");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

import crypto from "crypto";

app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "HZXeDSZSBUvVnC4Az4WEoser")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Verification failed");
  }
});
