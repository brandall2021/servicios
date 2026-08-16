"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MarketplacePrice } from "@/components/shared/marketplace-price"
import type { PriceType } from "@prisma/client"

interface MobileStickyCtaProps {
  href: string
  label: string
  priceType: PriceType
  price: number | null
  currency: string
  priceUnit: string | null
}

export function MobileStickyCta({ href, label, priceType, price, currency, priceUnit }: MobileStickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/80 bg-white/95 backdrop-blur-sm px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Precio</p>
          <MarketplacePrice
            priceType={priceType}
            price={price}
            currency={currency}
            priceUnit={priceUnit}
            className="text-lg leading-tight"
          />
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl btn-glow px-5 py-3 text-sm font-semibold text-white"
        >
          {label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
