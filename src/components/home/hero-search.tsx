import Link from "next/link"

export function HeroSearch() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
      style={{
        background: "linear-gradient(135deg, #0B2A55, #163B70)",
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-orange-400 blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-400 blur-[120px]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-4">
          Encontrá al profesional ideal
          <br />
          <span style={{ color: "#FF8A00" }}>para tu hogar</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
          Plomeros &bull; Electricistas &bull; Albañiles &bull; Diseñadores &bull; Más
        </p>
        <Link href="/buscar">
          <button
            className="btn-orange h-12 px-8 text-base font-semibold shadow-lg hover:shadow-orange-500/25"
            style={{ borderRadius: "25px" }}
          >
            Buscar ahora
          </button>
        </Link>
      </div>
    </section>
  )
}
