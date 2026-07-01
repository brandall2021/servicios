import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextResponse } from "next/server"

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init, status: init?.status })),
  },
}))

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

import { auth } from "@/lib/auth"
import {
  unauthorized,
  forbidden,
  requireAdmin,
  isAdmin,
  PUBLIC_USER_SELECT,
  PUBLIC_PROVIDER_SELECT,
} from "@/lib/auth-guard"

describe("auth-guard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("unauthorized", () => {
    it("returns 401 response", () => {
      const res = unauthorized()
      expect(res.status).toBe(401)
    })
  })

  describe("forbidden", () => {
    it("returns 403 response", () => {
      const res = forbidden()
      expect(res.status).toBe(403)
    })
  })

  describe("PUBLIC_USER_SELECT", () => {
    it("exposes only safe fields", () => {
      expect(PUBLIC_USER_SELECT).toHaveProperty("id")
      expect(PUBLIC_USER_SELECT).toHaveProperty("name")
      expect(PUBLIC_USER_SELECT).toHaveProperty("image")
      expect(PUBLIC_USER_SELECT).toHaveProperty("verified")
    })

    it("does NOT expose sensitive fields", () => {
      expect(PUBLIC_USER_SELECT).not.toHaveProperty("email")
      expect(PUBLIC_USER_SELECT).not.toHaveProperty("phone")
      expect(PUBLIC_USER_SELECT).not.toHaveProperty("whatsapp")
      expect(PUBLIC_USER_SELECT).not.toHaveProperty("password")
    })
  })

  describe("PUBLIC_PROVIDER_SELECT", () => {
    it("includes provider-relevant fields", () => {
      expect(PUBLIC_PROVIDER_SELECT).toHaveProperty("whatsapp")
      expect(PUBLIC_PROVIDER_SELECT).toHaveProperty("description")
      expect(PUBLIC_PROVIDER_SELECT).toHaveProperty("experience")
    })

    it("does NOT expose email or phone", () => {
      expect(PUBLIC_PROVIDER_SELECT).not.toHaveProperty("email")
      expect(PUBLIC_PROVIDER_SELECT).not.toHaveProperty("phone")
      expect(PUBLIC_PROVIDER_SELECT).not.toHaveProperty("password")
    })
  })

  describe("requireAdmin", () => {
    it("returns unauthorized when no session", async () => {
      vi.mocked(auth).mockResolvedValue(null)
      const res = await requireAdmin()
      expect(res).not.toBeNull()
      if (res) expect(res.status).toBe(401)
    })

    it("returns forbidden when role is not ADMIN", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "CLIENT", name: "Test" },
        expires: "",
      })
      const res = await requireAdmin()
      expect(res).not.toBeNull()
      if (res) expect(res.status).toBe(403)
    })

    it("returns null when user is ADMIN", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "ADMIN", name: "Admin" },
        expires: "",
      })
      const res = await requireAdmin()
      expect(res).toBeNull()
    })
  })

  describe("isAdmin", () => {
    it("returns false when no session", async () => {
      vi.mocked(auth).mockResolvedValue(null)
      expect(await isAdmin()).toBe(false)
    })

    it("returns false when role is CLIENT", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "CLIENT" },
        expires: "",
      })
      expect(await isAdmin()).toBe(false)
    })

    it("returns true when role is ADMIN", async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: "1", role: "ADMIN" },
        expires: "",
      })
      expect(await isAdmin()).toBe(true)
    })
  })
})