import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { login } from "./helpers/auth"

const pages = ["/", "/buscar?type=SERVICE", "/login", "/register", "/onboarding/proveedor"]

for (const path of pages) {
  test(`axe ${path}`, async ({ page }) => {
    if (path === "/onboarding/proveedor") {
      await login(page, "juan@example.com", "123456", path)
    } else {
      await page.goto(path)
    }
    await page.waitForLoadState("networkidle")

    const results = await new AxeBuilder({ page })
      .exclude("header, footer")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))
    expect(serious, JSON.stringify(serious, null, 2)).toHaveLength(0)
  })
}
