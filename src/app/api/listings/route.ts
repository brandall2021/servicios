import { NextResponse } from "next/server"
import { parseMarketplaceFilters, searchMarketplaceListings } from "@/lib/marketplace/search"

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams
  const filters = parseMarketplaceFilters(searchParams)
  const result = await searchMarketplaceListings(filters)

  return NextResponse.json({
    ...result,
  })
}
