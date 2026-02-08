import {authenticateGoogle, fileUpload} from "./api/auth.ts";
import {type ChangeEvent, useEffect, useRef, useState} from "react";
import { signInWithPopup, onAuthStateChanged, type User, signOut } from "firebase/auth";
import {auth, googleProvider, storage} from "./firebase";
import { LoginForm } from "./components/login-form.tsx";
import { Button } from "./components/ui/button.tsx";
import Aitest from "./aitest.tsx";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";


function App() {
    const [user, setUser] = useState<User | null>(null)
    const [markdownText, setMarkdownText] = useState("")
    const [imageUrl, sestImageUrl ] = useState<string | null>(null);

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if(!file || !user){
            console.log("No user or file")
            return
        }

        try{
            const storageRef = ref(storage, `scans/${user.uid}/${Date.now()}_${file.name}`)
            const snapshot = await uploadBytes(storageRef, file)
            const url = await getDownloadURL(snapshot.ref)
            console.log(url)
            const token = await user.getIdToken()
            localStorage.setItem("token", token)
            const response = await fileUpload(url);
            console.log(response)

            if (response.markdownContent.length > 0) {
                setMarkdownText(response.markdownContent)
            }else{
                console.log("Could not extract text from image")
            }
        }catch(e){
            console.error(e)
        }
    }

    useEffect(() => {
        console.log(user)
    }, [user]);


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

                    <Aitest/>

                    <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" onChange={handleFileUpload} />

                </div>
            </div>
        </div>
    )
}

export default App
