import { QuoteRequestStatus } from "@prisma/client"

export type QuoteTransitionAction =
  | "QUOTE"
  | "REQUEST_REVISION"
  | "ACCEPT"
  | "REJECT"
  | "CANCEL"
  | "COMPLETE"

export interface QuoteTransitionContext {
  currentStatus: QuoteRequestStatus
  action: QuoteTransitionAction
  isClientOwner: boolean
  isProviderOwner: boolean
  isAdmin?: boolean
}

const terminalStatuses = new Set<QuoteRequestStatus>([
  QuoteRequestStatus.ACCEPTED,
  QuoteRequestStatus.REJECTED,
  QuoteRequestStatus.CANCELLED,
  QuoteRequestStatus.COMPLETED,
])

export function isTerminalQuoteStatus(status: QuoteRequestStatus) {
  return terminalStatuses.has(status)
}

export function nextQuoteStatus(context: QuoteTransitionContext) {
  const { currentStatus, action, isClientOwner, isProviderOwner, isAdmin = false } = context

  if (isTerminalQuoteStatus(currentStatus)) {
    throw new Error("La solicitud ya está cerrada")
  }

  const canActAsClient = isClientOwner || isAdmin
  const canActAsProvider = isProviderOwner || isAdmin

  switch (action) {
    case "QUOTE":
      if (!canActAsProvider) throw new Error("Solo el proveedor puede cotizar")
      if (currentStatus !== QuoteRequestStatus.PENDING && currentStatus !== QuoteRequestStatus.REVISION_REQUESTED) {
        throw new Error("La solicitud no permite cotizar en este estado")
      }
      return QuoteRequestStatus.QUOTED

    case "REQUEST_REVISION":
      if (!canActAsClient) throw new Error("Solo el cliente puede pedir revisión")
      if (currentStatus !== QuoteRequestStatus.QUOTED) {
        throw new Error("La solicitud no permite pedir revisión en este estado")
      }
      return QuoteRequestStatus.REVISION_REQUESTED

    case "ACCEPT":
      if (!canActAsClient) throw new Error("Solo el cliente puede aceptar")
      if (currentStatus !== QuoteRequestStatus.QUOTED) {
        throw new Error("La solicitud no permite aceptar en este estado")
      }
      return QuoteRequestStatus.ACCEPTED

    case "REJECT":
      if (!canActAsClient) throw new Error("Solo el cliente puede rechazar")
      if (currentStatus !== QuoteRequestStatus.QUOTED && currentStatus !== QuoteRequestStatus.PENDING) {
        throw new Error("La solicitud no permite rechazar en este estado")
      }
      return QuoteRequestStatus.REJECTED

    case "CANCEL":
      if (!canActAsClient) throw new Error("Solo el cliente puede cancelar")
      if (currentStatus !== QuoteRequestStatus.PENDING && currentStatus !== QuoteRequestStatus.REVISION_REQUESTED) {
        throw new Error("La solicitud no permite cancelar en este estado")
      }
      return QuoteRequestStatus.CANCELLED

    case "COMPLETE":
      if (!canActAsClient && !canActAsProvider) throw new Error("No tenés permiso para finalizar esta solicitud")
      if (currentStatus !== QuoteRequestStatus.ACCEPTED) {
        throw new Error("La solicitud solo puede finalizarse desde accepted")
      }
      return QuoteRequestStatus.COMPLETED

    default:
      throw new Error("Acción inválida")
  }
}
