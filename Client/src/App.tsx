import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Button} from "./components/ui/button.tsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <h2 className={"text-blue-300"}>Hello world</h2>
        <Button>HELLO</Button>
    </>
  )
}

export default App
