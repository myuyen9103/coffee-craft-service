import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express"; // Import swagger-ui-express
import swaggerSpec from "./config/swagger.config"; // Import the generated spec
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import brandRoutes from "./routes/brand.routes";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import shippingAddressRoutes from "./routes/shippingAddress.routes";
import tagRoutes from "./routes/tag.routes";
import reviewRoutes from "./routes/review.routes";
import voucherRoutes from "./routes/voucher.routes";
import blogRoutes from "./routes/blog.routes"; // Import blog routes
import revenueStatsRoutes from "./routes/stats/revenue.routes"; // Import revenue stats routes
import productStatsRoutes from "./routes/stats/product.routes"; // Import product stats routes
import userStatsRoutes from "./routes/stats/user.routes"; // Import user stats routes
import voucherStatsRoutes from "./routes/stats/voucher.routes"; // Import voucher stats routes
import reviewStatsRoutes from "./routes/stats/review.routes"; // Import review stats routes

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "https://coffee-craft-admin-portal.vercel.app",
      "https://coffee-craft.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Performance Middleware
app.use(compression());
app.use(express.json()); // Body size limit
// app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/shipping-addresses", shippingAddressRoutes);
app.use("/tags", tagRoutes);
app.use("/reviews", reviewRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/blogs", blogRoutes);
app.use("/stats/revenue", revenueStatsRoutes);
app.use("/stats/products", productStatsRoutes);
app.use("/stats/users", userStatsRoutes);
app.use("/stats/vouchers", voucherStatsRoutes);
app.use("/stats/reviews", reviewStatsRoutes);

// --- Swagger UI Setup ---
// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// You can also serve the raw JSON spec
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
// -----------------------

// Optional: Mount product-specific reviews under products
// This requires adjusting review.routes.ts or creating a separate router
// Example: app.use('/products/:productId/reviews', productReviewRouter);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing HTTP server...");
  process.exit(0);
});

// Server
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});

export default app;
