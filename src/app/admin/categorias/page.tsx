import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIAS } from "@/lib/constants"
import { prisma } from "@/lib/prisma"

export default async function AdminCategoriasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const counts = await Promise.all(
    CATEGORIAS.map(async (cat) => {
      const count = await prisma.servicio.count({ where: { categoria: cat.value } })
      return { ...cat, count }
    })
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Categorías</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorías de servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {counts.map((cat) => (
              <div
                key={cat.value}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{cat.label}</span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {cat.count} {cat.count === 1 ? "servicio" : "servicios"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
