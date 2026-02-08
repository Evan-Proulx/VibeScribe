import { useState } from "react";
import { MilkdownEditor } from "../../MilkdownEditor";
import NotesSidebar, { type Note } from "./NotesSidebar.tsx";

const MainPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    // Temporary content field for saving
    const [rawText, setRawText] = useState("");

    function nowLabel() {
        return new Date().toLocaleDateString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const handleNewNote = () => {
        setSelectedNoteId(null);
        setRawText("");
        setSidebarOpen(false);
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNoteId(note.id);
        setRawText(note.content);
        setSidebarOpen(false);
    };

    const handleSave = () => {
        const trimmed = rawText.trim();
        if (!trimmed) return;

        if (!selectedNoteId) {
            const newNote: Note = {
                id: crypto.randomUUID(),
                content: rawText,
                updatedAt: nowLabel(),
            };
            setNotes((prev) => [newNote, ...prev]);
            setSelectedNoteId(newNote.id);
            return;
        }

        // UPDATE + move to top
        setNotes((prev) => {
            const updated = prev.map((n) =>
                n.id === selectedNoteId
                    ? { ...n, content: rawText, updatedAt: nowLabel() }
                    : n
            );

            const updatedNote = updated.find((n) => n.id === selectedNoteId);
            const rest = updated.filter((n) => n.id !== selectedNoteId);

            return updatedNote ? [updatedNote, ...rest] : updated;
        });
    };

    return (
        <div className="bg-black w-screen min-h-screen flex flex-col text-white relative">
            {/* Sidebar component */}
            <NotesSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelect={handleSelectNote}
                onNewNote={handleNewNote}
            />

            {/* Navbar */}
            <div className="bg-gray-900/80 backdrop-blur w-full h-20 border-b border-gray-700 sticky top-0 z-50">
                <div className="flex flex-row gap-3 items-center px-4 h-full max-w-6xl mx-auto">
                    {/* Safe hamburger icon (adds only, doesn’t change others) */}
                    <button
                        onClick={() => setSidebarOpen((s) => !s)}
                        className="
              mr-2
              h-10 w-10 rounded-xl
              border border-gray-700 bg-gray-900
              flex items-center justify-center
              hover:bg-gray-800
              active:scale-95
              transition
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
            "
                        aria-label="Open notes sidebar"
                        title="Notes"
                    >
                        <span className="text-xl leading-none">☰</span>
                    </button>

                    <img
                        src="src/assets/logo.png"
                        alt="VibeScribe Logo"
                        className="h-16 w-auto"
                    />
                    <p className="font-bold text-2xl tracking-wide">VibeScribe</p>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex flex-col gap-10 py-10 px-4">
                {/* Hero */}
                <div className="w-full max-w-5xl mx-auto rounded-3xl border border-gray-700 bg-gradient-to-b from-gray-900 to-black px-6 py-12 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                    <div className="flex flex-col gap-5 items-center text-center">
                        <p className="font-extrabold text-4xl sm:text-6xl leading-tight">
                            Study Smarter, Not Harder
                        </p>

                        <p className="text-white/80 font-medium text-base sm:text-xl max-w-3xl leading-relaxed">
                            Upload images of your notes, convert them into editable Markdown,
                            summarize key points, and export your notes in seconds.
                        </p>
                    </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-center">
                    <button
                        className="
              group flex items-center gap-3
              bg-gray-900 rounded-2xl
              border border-emerald-700
              px-5 py-3
              font-semibold text-emerald-300
              shadow-md shadow-emerald-900/20
              transition-all duration-200

              hover:bg-gray-800
              hover:border-emerald-500
              hover:text-emerald-200
              active:scale-95

              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
            "
                    >
                        Click Here to Upload a Photo
                        <span className="text-2xl font-bold leading-none transition-transform duration-200 group-hover:rotate-90">
              +
            </span>
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-5xl">
                        <MilkdownEditor />
                        <p className="mt-2 text-sm text-white/60 italic text-center">
                            Click anywhere to edit • Use the button above to view raw Markdown
                        </p>
                    </div>
                </div>

                {/* SAFE Saving Area temporary until Milkdown is wired */}
                <div className="w-full max-w-5xl mx-auto">
                    <div className="flex justify-end gap-3 mb-3">
                        <button
                            onClick={handleNewNote}
                            className="
                rounded-2xl px-4 py-3 font-semibold
                border border-gray-700 bg-gray-900 text-white/90
                hover:bg-gray-800 active:scale-95 transition
              "
                        >
                            + New Note
                        </button>

                        <button
                            onClick={handleSave}
                            className="
                rounded-2xl px-5 py-3 font-semibold
                bg-emerald-400 text-black
                hover:brightness-110 active:scale-95 transition
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-black
              "
                        >
                            {selectedNoteId ? "Save Changes" : "Save Note"}
                        </button>
                    </div>

                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="This is a test box only."
                        className="
              w-full min-h-[160px]
              rounded-2xl border border-gray-700
              bg-gray-900/80 p-5
              text-white/90 placeholder:text-gray-400
              shadow-lg shadow-black/40
              resize-none
              focus:outline-none focus:ring-2 focus:ring-emerald-500
              focus:border-emerald-500
              transition-all duration-200
            "
                    />
                    <p className="mt-2 text-sm text-white/60 italic text-center">
                        Test BOX
                    </p>
                </div>

                {/* Download Button */}
                <div className="flex justify-center pb-8">
                    <button
                        className="
              flex items-center gap-3
              bg-gray-900 rounded-2xl
              border border-emerald-700
              px-5 py-3
              font-semibold text-emerald-300
              shadow-md shadow-emerald-900/20
              transition-all duration-200

              hover:bg-gray-800
              hover:border-emerald-500
              hover:text-emerald-200
              active:scale-95

              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
            "
                    >
                        Download Your Notes (PDF)
                        <span className="text-xl leading-none">⤓</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
