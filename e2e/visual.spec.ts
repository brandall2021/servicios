import { test } from "@playwright/test"
import { login } from "./helpers/auth"
import { ensureVisualFixtures, cleanupVisualFixtures } from "./helpers/prisma"

test.describe.configure({ mode: "serial" })

let fixtures: Awaited<ReturnType<typeof ensureVisualFixtures>>

test.beforeAll(async () => {
  fixtures = await ensureVisualFixtures()
})

test.afterAll(async () => {
  await cleanupVisualFixtures()
})

const publicPages = [
  { name: "home", path: "/" },
  { name: "search-service", path: "/buscar?type=SERVICE" },
  { name: "search-product", path: "/buscar?type=PRODUCT" },
  { name: "register", path: "/register" },
  { name: "service-detail", path: () => `/servicios/${fixtures.service.id}` },
  { name: "product-detail", path: () => `/listings/${fixtures.product.slug}` },
  { name: "product-inquiry", path: () => `/consultas/productos/${fixtures.inquiryId}` },
  { name: "booking-detail", path: () => `/reservas/${fixtures.bookingId}` },
]

async function waitForScreenshotReady(page: Parameters<typeof login>[0]) {
  await page.waitForLoadState("domcontentloaded")
}

for (const pageDef of publicPages) {
  test(`${pageDef.name} screenshot`, async ({ page }, testInfo) => {
    await page.goto(typeof pageDef.path === "function" ? pageDef.path() : pageDef.path, { waitUntil: "domcontentloaded" })
    await waitForScreenshotReady(page)
    await page.screenshot({ path: testInfo.outputPath(`${pageDef.name}.png`), fullPage: true })
  })
}

test("wizard screenshot", async ({ page }, testInfo) => {
  await login(page, fixtures.providerEmail, "123456", "/onboarding/proveedor")
  await waitForScreenshotReady(page)
  await page.screenshot({ path: testInfo.outputPath("wizard.png"), fullPage: true })
})

test("budget screenshot", async ({ page }, testInfo) => {
  await login(page, fixtures.clientEmail, "123456", "/presupuestos")
  await waitForScreenshotReady(page)
  await page.screenshot({ path: testInfo.outputPath("budget.png"), fullPage: true })
})

test("chat screenshot", async ({ page }, testInfo) => {
  await login(page, fixtures.clientEmail, "123456", "/chat")
  await waitForScreenshotReady(page)
  await page.screenshot({ path: testInfo.outputPath("chat.png"), fullPage: true })
})

test("provider-dashboard screenshot", async ({ page }, testInfo) => {
  await login(page, fixtures.providerEmail, "123456", "/proveedor/metricas")
  await waitForScreenshotReady(page)
  await page.screenshot({ path: testInfo.outputPath("provider-dashboard.png"), fullPage: true })
})

test("admin-dashboard screenshot", async ({ page }, testInfo) => {
  await login(page, fixtures.adminEmail, "123456", "/admin")
  await waitForScreenshotReady(page)
  await page.screenshot({ path: testInfo.outputPath("admin-dashboard.png"), fullPage: true })
})
