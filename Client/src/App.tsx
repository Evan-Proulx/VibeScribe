import {authenticateGoogle} from "./api/auth.ts";
import {useEffect, useState} from "react";
import { signInWithPopup, onAuthStateChanged, type User, signOut } from "firebase/auth";
import {auth, googleProvider} from "./firebase";
import {LoginForm} from "./components/login-form.tsx";
import {Button} from "./components/ui/button.tsx";

function App() {
    const [count, setCount] = useState(0)
    const [user, setUser] = useState<User | null>()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbuser) => {
            if (fbuser){
                const token = await fbuser.getIdToken()
                localStorage.setItem("accessToken", token)
                const response = await authenticateGoogle()

                setUser(fbuser)
            }else{
                setUser(null)
            }
        })

        return () => unsubscribe()
    }, []);
    return (
        <div className={"h-screen w-full"}>
            <div className={"flex justify-center"}>
                <div className={" flex flex-col gap-4 w-1/3 p-20 border rounded-xl border-gray-200 bg-white"}>
                    <h2 className={"text-lg font-semibold pb-8"}>Login</h2>
                    <LoginForm/>

                    <Button onClick={() => signInWithPopup(auth, googleProvider)}/>
                </div>
            </div>
        </div>
    )
}

export default App
