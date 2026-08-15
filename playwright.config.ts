import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3010"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3010",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      DATABASE_URL: "postgresql://brandall:Hansol1974%2B@127.0.0.1:5432/servicio?schema=public",
      NEXTAUTH_URL: baseURL,
      NEXTAUTH_SECRET: "n8mR4vG2Xq7Kc1Pz9Ld0WfT6yJr3SbUaH5eQm2Nx8A0=",
    },
  },
  projects: [
    { name: "chromium-390", use: { ...devices["Pixel 5"] } },
    { name: "chromium-768", use: { ...devices["iPad Mini"], browserName: "chromium" } },
    { name: "chromium-1440", use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  ],
})
