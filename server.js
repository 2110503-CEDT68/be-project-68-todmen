const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors=require('cors');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// Route files
const hospitals = require("./routes/hospitals");
const appointments = require("./routes/appointments");
const auth = require("./routes/auth");
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
        description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Load env vars
dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();
app.set("query parser", "extended");
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);
app.use(hpp());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cookieParser());

// Mount routers
// Fixed 'vl' to 'v1' for standard versioning
app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/appointments", appointments);
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
