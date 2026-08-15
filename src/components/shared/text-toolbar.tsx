"use client"

import { Bold, Italic, Strikethrough, List, Code } from "lucide-react"

interface TextToolbarProps {
  textareaId: string
}

type FormatType = "bold" | "italic" | "strike" | "bullet" | "code"

const FORMATS: { key: FormatType; icon: React.ReactNode; syntax: [string, string]; label: string }[] = [
  { key: "bold", icon: <Bold className="h-3.5 w-3.5" />, syntax: ["**", "**"], label: "Negrita" },
  { key: "italic", icon: <Italic className="h-3.5 w-3.5" />, syntax: ["*", "*"], label: "Cursiva" },
  { key: "strike", icon: <Strikethrough className="h-3.5 w-3.5" />, syntax: ["~~", "~~"], label: "Tachado" },
  { key: "code", icon: <Code className="h-3.5 w-3.5" />, syntax: ["`", "`"], label: "Código" },
  { key: "bullet", icon: <List className="h-3.5 w-3.5" />, syntax: ["\n- ", ""], label: "Lista" },
]

export function TextToolbar({ textareaId }: TextToolbarProps) {
  function applyFormat(key: FormatType) {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (!ta) return

    const fmt = FORMATS.find((f) => f.key === key)
    if (!fmt) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = ta.value
    const selected = text.substring(start, end)
    const [open, close] = fmt.syntax

    if (key === "bullet") {
      const before = text.substring(0, start)
      const after = text.substring(end)
      ta.value = before + open + after
      ta.selectionStart = ta.selectionEnd = start + open.length
    } else if (selected) {
      const wrapped = open + selected + close
      ta.value = text.substring(0, start) + wrapped + text.substring(end)
      ta.selectionStart = start + open.length
      ta.selectionEnd = start + open.length + selected.length
    } else {
      const placeholder = fmt.label.toLowerCase()
      const wrapped = open + placeholder + close
      ta.value = text.substring(0, start) + wrapped + text.substring(end)
      ta.selectionStart = start + open.length
      ta.selectionEnd = start + open.length + placeholder.length
    }

    ta.focus()
    ta.dispatchEvent(new Event("input", { bubbles: true }))
  }

  return (
    <div className="flex items-center gap-0.5 pb-1">
      {FORMATS.map((fmt) => (
        <button
          key={fmt.key}
          type="button"
          onClick={() => applyFormat(fmt.key)}
          title={fmt.label}
          aria-label={fmt.label}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {fmt.icon}
        </button>
      ))}
    </div>
  )
}

export function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/`(.+?)`/g, "<code class='bg-zinc-200/50 px-1 rounded text-xs'>$1</code>")

  html = html.replace(/\n/g, "<br/>")

  return html
}
