import { useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'

import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/nord-dark.css'

//KaTeX styles (math rendering library used by Milkdown for math support)
import 'katex/dist/katex.min.css'

export const MilkdownEditor = () => {
  const editorRootRef = useRef<HTMLDivElement>(null)
  const crepeRef = useRef<Crepe | null>(null)

  const [markdown, setMarkdown] = useState(
    '# Welcome to VibeScribe\n\nTry some math: $E=mc^2$\n\nBlock:\n\n$$\\int_0^1 x^2\\,dx$$\n'
  )

  useEffect(() => {
    if (!editorRootRef.current) return

    const crepe = new Crepe({
      root: editorRootRef.current,
      defaultValue: markdown,

      // Optional: don’t disable Latex feature (only showing pattern)
      // features: {
      //   [Crepe.Feature.Latex]: true,
      // },
    })

    crepeRef.current = crepe

    // Crepe includes listener; use markdownUpdated to mirror markdown into React state
    crepe.on((listener) => {
      listener.markdownUpdated((_, nextMarkdown) => {
        setMarkdown(nextMarkdown)
      })
    }) // :contentReference[oaicite:3]{index=3}

    crepe.create()

    return () => {
      crepe.destroy()
      crepeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ display: 'flex', gap: 16, padding: 20, alignItems: 'stretch' }}>
      {/* Editor */}
      <div style={{ flex: 2, minWidth: 0 }}>
        <div ref={editorRootRef} />
      </div>

      {/* Markdown sidebar */}
      <aside
        style={{
          flex: 1,
          minWidth: 320,
          maxWidth: 520,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: 12,
          overflow: 'auto',
          height: '70vh',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Markdown</div>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          {markdown}
        </pre>
      </aside>
    </div>
  )
}
