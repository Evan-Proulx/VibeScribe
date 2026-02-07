import './App.css'
import { MilkdownEditor } from './MilkdownEditor'

function App() {
  return (
    <div className="vibe-scribe-app">
      <header style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>VibeScribe</h1>
        <p>Your AI-Powered Markdown Editor</p>
      </header>
      
      <main>
        {/* This renders the component you just built in the screenshots */}
        <MilkdownEditor />
      </main>
    </div>
  )
}

export default App