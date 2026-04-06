const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/reports", require("./routes/report.routes"));

app.get("/", (_, res) => res.json({ message: "Ecommerce API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
