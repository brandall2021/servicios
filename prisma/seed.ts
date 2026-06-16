import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("123456", 12)

  const admin = await prisma.user.upsert({
    where: { email: "cpereyra@face.unt.edu.ar" },
    update: {},
    create: {
      name: "Admin",
      email: "cpereyra@face.unt.edu.ar",
      password,
      role: "ADMIN",
      verified: true,
    },
  })

  const proveedor1 = await prisma.user.upsert({
    where: { email: "juan@example.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "juan@example.com",
      password,
      phone: "+54 381 5550101",
      role: "PROVIDER",
      verified: true,
      description: "Técnico especializado en reparación de aires acondicionados con más de 10 años de experiencia.",
      experience: "10+ años trabajando en climatización y reparación de equipos Split, centrales y portátiles.",
      certifications: "Técnico en Climatización - UTN\nCertificado en Manejo de Refrigerantes - IRAM",
      zone: "Tucumán",
      availability: "Lunes a sábados 8:00 - 20:00",
    },
  })

  const proveedor2 = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      name: "María García",
      email: "maria@example.com",
      password,
      phone: "+54 381 5550202",
      role: "PROVIDER",
      verified: true,
      description: "Diseñadora gráfica y web. Creación de marcas, sitios web y contenido visual.",
      experience: "8 años en diseño gráfico, branding y desarrollo web.",
      certifications: "Licenciatura en Diseño Gráfico - UNT\nCertified UI/UX Designer - Google",
      zone: "Tucumán",
      availability: "Lunes a viernes 9:00 - 18:00",
    },
  })

  const proveedor3 = await prisma.user.upsert({
    where: { email: "carlos@example.com" },
    update: {},
    create: {
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      password,
      phone: "+54 381 5550303",
      role: "PROVIDER",
      verified: true,
      description: "Electricista matriculado. Instalaciones eléctricas residenciales e industriales.",
      experience: "15 años como electricista profesional.",
      certifications: "Matrícula Profesional - Colegio de Electricistas\nCurso de Instalaciones Eléctricas - UTN",
      zone: "Tucumán",
      availability: "Lunes a sábados 8:00 - 19:00",
    },
  })

  const cliente = await prisma.user.upsert({
    where: { email: "cliente@example.com" },
    update: {},
    create: {
      name: "Pedro Cliente",
      email: "cliente@example.com",
      password,
      role: "CLIENT",
      phone: "+54 381 5550404",
    },
  })

  const servicio1 = await prisma.servicio.create({
    data: {
      titulo: "Reparación de equipos Split",
      descripcion: "Servicio técnico especializado en reparación de aires acondicionados tipo Split. Diagnóstico gratuito, presupuesto sin cargo. Trabajamos todas las marcas: Samsung, LG, Philco, BGH, Suria.\n\nIncluye:\n• Diagnóstico completo\n• Limpieza de filtros\n• Recarga de gas\n• Reparación de placas\n• Instalación y desinstalación",
      categoria: "hogar",
      precio: 15000,
      ubicacion: "Tucumán",
      disponibilidad: "Lunes a sábados 8:00 - 20:00",
      usuarioId: proveedor1.id,
    },
  })

  const servicio2 = await prisma.servicio.create({
    data: {
      titulo: "Diseño de logo y branding completo",
      descripcion: "Creación de identidad visual para tu marca. Incluye logo principal, variantes, paleta cromática, tipografía y manual de marca básico.\n\nEntregables:\n• Logo en vectores (AI, EPS, SVG)\n• Versiones color y monocromo\n• Paleta de colores\n• Tipografías sugeridas\n• Manual de marca",
      categoria: "diseno",
      precio: 45000,
      ubicacion: "Tucumán",
      disponibilidad: "Lunes a viernes 9:00 - 18:00",
      usuarioId: proveedor2.id,
    },
  })

  const servicio3 = await prisma.servicio.create({
    data: {
      titulo: "Instalaciones eléctricas completas",
      descripcion: "Realizamos instalaciones eléctricas nuevas y remodelaciones. Trabajos residenciales y comerciales. Materiales de primera calidad y garantía escrita.\n\nServicios:\n• Instalación completa\n• Recableado\n• Tableros eléctricos\n• Puestas a tierra\n• Termografías",
      categoria: "hogar",
      precio: 25000,
      ubicacion: "Tucumán",
      disponibilidad: "Lunes a sábados 8:00 - 19:00",
      usuarioId: proveedor3.id,
    },
  })

  const servicio4 = await prisma.servicio.create({
    data: {
      titulo: "Mantenimiento preventivo de AA",
      descripcion: "Mantenimiento completo para asegurar el correcto funcionamiento de tu equipo de aire acondicionado. Incluye limpieza profunda, revisión de componentes y ajustes necesarios.",
      categoria: "hogar",
      precio: 8000,
      ubicacion: "Tucumán",
      disponibilidad: "Lunes a sábados 8:00 - 20:00",
      usuarioId: proveedor1.id,
    },
  })

  const servicio5 = await prisma.servicio.create({
    data: {
      titulo: "Diseño de página web",
      descripcion: "Diseño y desarrollo de sitios web modernos y responsivos. Ideal para emprendedores y pequeñas empresas.\n\nIncluye:\n• Diseño UI/UX\n• Desarrollo responsive\n• SEO básico\n• Hosting 1 año",
      categoria: "tecnologia",
      precio: 80000,
      ubicacion: "Tucumán",
      disponibilidad: "Lunes a viernes 9:00 - 18:00",
      usuarioId: proveedor2.id,
    },
  })

  await prisma.opinion.createMany({
    data: [
      { puntuacion: 5, comentario: "Excelente servicio. Llegó puntual y dejó el aire funcionando perfecto. Muy recomendado.", servicioId: servicio1.id, clienteId: cliente.id },
      { puntuacion: 4, comentario: "Muy buen trabajo, aunque tardó un poco más de lo esperado. La calidad excelente.", servicioId: servicio1.id, clienteId: cliente.id },
      { puntuacion: 5, comentario: "El logo quedó increíble. Superó mis expectativas. Muy profesional.", servicioId: servicio2.id, clienteId: cliente.id },
      { puntuacion: 5, comentario: "Me hizo toda la instalación eléctrica de la casa. Trabajo impecable.", servicioId: servicio3.id, clienteId: cliente.id },
      { puntuacion: 4, comentario: "Buen mantenimiento, el equipo quedó como nuevo. Volvería a contratar.", servicioId: servicio4.id, clienteId: cliente.id },
      { puntuacion: 5, comentario: "La página web quedó hermosa. Muy contento con el resultado.", servicioId: servicio5.id, clienteId: cliente.id },
    ],
  })

  console.log("Seed completado exitosamente!")
  console.log("Usuarios creados:")
  console.log("- Admin: cpereyra@face.unt.edu.ar / 123456")
  console.log("- Proveedor Juan: juan@example.com / 123456")
  console.log("- Proveedor María: maria@example.com / 123456")
  console.log("- Proveedor Carlos: carlos@example.com / 123456")
  console.log("- Cliente: cliente@example.com / 123456")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
