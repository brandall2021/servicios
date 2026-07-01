import { prisma } from "./prisma"

type NotificationType = "mensaje" | "opinion" | "presupuesto" | "cotizacion" | "admin"

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: NotificationType
  title: string
  message?: string
  link?: string
}) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  })
}

export async function notifyNewMessage(chatId: string, emisorId: string, receptorId: string, contenido: string) {
  return createNotification({
    userId: receptorId,
    type: "mensaje",
    title: "Nuevo mensaje",
    message: contenido?.slice(0, 200),
    link: `/chat/${chatId}`,
  })
}

export async function notifyNewOpinion(servicioId: string, servicioTitulo: string, duenoId: string, puntuacion: number) {
  return createNotification({
    userId: duenoId,
    type: "opinion",
    title: "Nueva opinión",
    message: `Calificaron tu servicio "${servicioTitulo}" con ${puntuacion}★`,
    link: `/servicios/${servicioId}`,
  })
}

export async function notifyNewBudgetRequest(servicioId: string, servicioTitulo: string, proveedorId: string) {
  return createNotification({
    userId: proveedorId,
    type: "presupuesto",
    title: "Nueva solicitud de presupuesto",
    message: `Solicitaron presupuesto para "${servicioTitulo}"`,
    link: `/presupuestos?rol=proveedor`,
  })
}

export async function notifyBudgetQuote(requestId: string, servicioTitulo: string, clienteId: string) {
  return createNotification({
    userId: clienteId,
    type: "cotizacion",
    title: "Recibiste una cotización",
    message: `Cotizaron tu solicitud para "${servicioTitulo}"`,
    link: `/presupuestos/${requestId}`,
  })
}