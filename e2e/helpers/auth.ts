import type { Page } from "@playwright/test"

export async function login(page: Page, email: string, password: string, returnTo = "/") {
  const csrfResponse = await page.request.get("/api/auth/csrf")
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }

  const response = await page.request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: returnTo,
      json: "true",
    },
  })

  if (!response.ok()) {
    throw new Error(`Login request failed with ${response.status()}`)
  }

  await page.goto(returnTo, { waitUntil: "domcontentloaded" })
}
