import express from "express";
import Razorpay from "razorpay";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: "rzp_test_STv4z5jBSS1Pal",
  key_secret: "HZXeDSZSBUvVnC4Az4WEoser"
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: "INR"
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
  console.log("Server running on port " + PORT);
});
