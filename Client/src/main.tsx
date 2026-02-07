import React from 'react'
import './index.css'
import './App.css'
import { createRoot } from 'react-dom/client'
import { MilkdownEditor } from './MilkdownEditor'

function App() {
  return (
    <div className="vibe-scribe-app">
      <header style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>VibeScribe</h1>
        <p>Your AI-Powered Markdown Editor</p>
      </header>

      <main>
        {/* The MilkdownEditor component will render the markdown editor interface */}
        <MilkdownEditor />
      </main>
    </div>
  )
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container not found: make sure index.html has a <div id="root"></div>')
}

const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

export default App