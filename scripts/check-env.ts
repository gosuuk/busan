import { config } from "dotenv";

config({
  path: ".env.local",
});

config({
  path: ".env",
  override: false,
});

await import("../src/config/environment");

console.info("Environment variables are valid.");
