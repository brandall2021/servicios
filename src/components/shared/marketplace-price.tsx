import { PriceType } from "@prisma/client"

interface MarketplacePriceProps {
  priceType: PriceType
  price: number | null
  currency?: string
  priceUnit?: string | null
  className?: string
}

export function MarketplacePrice({ priceType, price, currency = "ARS", priceUnit, className }: MarketplacePriceProps) {
  const label = priceType === "QUOTE" ? "A cotizar" : priceType === "FROM" ? "Desde" : priceType === "PER_UNIT" ? "Por unidad" : "Precio"
  const formatted = price === null ? "Consultá" : new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(price)

  return (
    <div className={className}>
      <span className="block text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">{label}</span>
      <span className={`block font-bold ${price !== null ? "gradient-text-animated" : "text-stone-900 dark:text-stone-100"}`}>
        {priceType === "FROM" && price !== null ? `${formatted} +` : formatted}
      </span>
      {priceUnit && <span className="block text-xs text-stone-500 dark:text-stone-400 mt-0.5">{priceUnit}</span>}
    </div>
  )
}
