const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_test_STv4z5jBSS1Pal",
  key_secret: "HZXeDSZSBUvVnC4Az4WEoser" // 🔴 PUT YOUR SECRET HERE
});

// CREATE ORDER API
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "order_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating order");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});