import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((email) => email.trim())
    : [],
  CLIENT_URL: process.env.CLIENT_URL,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  WHATSAPP_BOT_NUMBER: process.env.WHATSAPP_BOT_NUMBER || "+923488383679",
  DISABLE_WHATSAPP_BOT: process.env.DISABLE_WHATSAPP_BOT === "true",
};
