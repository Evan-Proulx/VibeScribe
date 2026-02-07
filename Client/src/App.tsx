import { authenticateGoogle } from "./api/auth.ts";
import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { LoginForm } from "./components/login-form.tsx";
import { Button } from "./components/ui/button.tsx";

function App() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbuser) => {
            if (fbuser) {
                const token = await fbuser.getIdToken()
                localStorage.setItem("accessToken", token)
                await authenticateGoogle()
                setUser(fbuser)
            } else {
                setUser(null)
                localStorage.removeItem("accessToken")
            }
        })

        return () => unsubscribe()
    }, []);

    // Show dashboard when logged in
    if (user) {
        return (
            <div className={"h-screen w-full bg-gray-900"}>
                <div className={"flex flex-col items-center justify-center h-full gap-4"}>
                    <img
                        src={user.photoURL || ''}
                        alt="Profile"
                        className="w-20 h-20 rounded-full"
                    />
                    <h1 className="text-2xl font-bold text-white">Welcome, {user.displayName}!</h1>
                    <p className="text-gray-400">{user.email}</p>
                    <Button
                        onClick={() => signOut(auth)}
                        className="mt-4"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        )
    }

    // Show login form when not logged in
    return (
        <div className={"h-screen w-full"}>
            <div className={"flex justify-center"}>
                <div className={" flex flex-col gap-4 w-1/3 p-20 border rounded-xl border-gray-200 bg-white"}>
                    <h2 className={"text-lg font-semibold pb-8"}>Login</h2>
                    <LoginForm />

                    <Button onClick={() => signInWithPopup(auth, googleProvider)}>
                        Continue with Google
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default App
