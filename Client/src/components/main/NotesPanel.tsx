import { useMemo, useState } from "react";

type Contributor = {
    id: string;
    name: string;
    content: string;
};

type Note = {
    id: string;
    title: string;
    contributors: Contributor[];
    createdAt: number;
};

function initials(name: string) {
    return name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

export default function NotesPanel() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedNote = useMemo(
        () => notes.find((n) => n.id === selectedId) ?? null,
        [notes, selectedId]
    );

    const createNote = () => {
        const id = crypto.randomUUID();
        const newNote: Note = {
            id,
            title: `New Note ${notes.length + 1}`,
            contributors: [{ id: crypto.randomUUID(), name: "You", content: "" }],
            createdAt: Date.now(),
        };
        setNotes((prev) => [newNote, ...prev]);
        setSelectedId(id);
    };

    const addContributor = () => {
        if (!selectedNote) return;
        const name = prompt("Contributor name?");
        if (!name?.trim()) return;

        setNotes((prev) =>
            prev.map((n) =>
                n.id !== selectedNote.id
                    ? n
                    : {
                        ...n,
                        contributors: [
                            ...n.contributors,
                            { id: crypto.randomUUID(), name: name.trim(), content: "" },
                        ],
                    }
            )
        );
    };

    const updateContributorText = (cid: string, value: string) => {
        if (!selectedNote) return;

        setNotes((prev) =>
            prev.map((n) =>
                n.id !== selectedNote.id
                    ? n
                    : {
                        ...n,
                        contributors: n.contributors.map((c) =>
                            c.id === cid ? { ...c, content: value } : c
                        ),
                    }
            )
        );
    };

    const updateTitle = (value: string) => {
        if (!selectedNote) return;

        setNotes((prev) =>
            prev.map((n) =>
                n.id !== selectedNote.id ? n : { ...n, title: value }
            )
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 pb-10">
            <div className="grid grid-cols-12 gap-6">
                {/* LEFT: Notes list */}
                <div className="col-span-12 md:col-span-4">
                    <div className="rounded-3xl border border-gray-700 bg-gray-900 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-white font-bold text-lg">My Notes</p>
                            <button
                                onClick={createNote}
                                className="h-9 w-9 rounded-xl border border-emerald-700 text-emerald-300 hover:bg-gray-800 transition flex items-center justify-center"
                                title="New note"
                            >
                                +
                            </button>
                        </div>

                        {notes.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-gray-700 bg-black/20 p-4 text-center">
                                <p className="text-white font-semibold">No notes</p>
                                <p className="text-white/60 text-sm mt-1">
                                    Create or convert a note to see it here.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 flex flex-col gap-3">
                                {notes.map((note) => {
                                    const active = note.id === selectedId;

                                    return (
                                        <button
                                            key={note.id}
                                            onClick={() => setSelectedId(note.id)}
                                            className={`text-left rounded-2xl border p-4 transition ${
                                                active
                                                    ? "border-emerald-500 bg-black/30"
                                                    : "border-gray-700 hover:bg-gray-800"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white font-semibold">{note.title}</p>
                                                    <p className="text-white/60 text-sm mt-1">
                                                        {note.contributors.length} contributor
                                                        {note.contributors.length === 1 ? "" : "s"}
                                                    </p>
                                                </div>
                                                <span className="text-xl text-white/70">📄</span>
                                            </div>

                                            <div className="mt-3 flex -space-x-2">
                                                {note.contributors.slice(0, 3).map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="h-8 w-8 rounded-full bg-emerald-700 text-xs font-bold flex items-center justify-center border border-black"
                                                    >
                                                        {initials(c.name)}
                                                    </div>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Contributors + editable title */}
                <div className="col-span-12 md:col-span-8">
                    <div className="rounded-3xl border border-gray-700 bg-gray-900 p-5">
                        {!selectedNote ? (
                            <div className="rounded-2xl border border-gray-700 bg-black/20 p-6 text-center">
                                <p className="text-white font-semibold text-lg">Select a note</p>
                                <p className="text-white/60 text-sm mt-1">
                                    Choose a note to view contributors.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between gap-3">
                                    <input
                                        value={selectedNote.title}
                                        onChange={(e) => updateTitle(e.target.value)}
                                        className="bg-transparent border-b border-gray-600 text-white font-bold text-xl focus:outline-none focus:border-emerald-500"
                                    />

                                    <button
                                        onClick={addContributor}
                                        className="rounded-2xl border border-emerald-700 px-4 py-2 text-emerald-300 font-semibold hover:bg-gray-800 transition"
                                    >
                                        Add People +
                                    </button>

                                    <button
                                        className="rounded-2xl border border-emerald-700 px-4 py-2 text-emerald-300 font-semibold hover:bg-gray-800 transition"
                                    >
                                        Download PDF
                                    </button>
                                </div>

                                <div className="mt-6 flex flex-col gap-4">
                                    {selectedNote.contributors.map((c) => (
                                        <div
                                            key={c.id}
                                            className="rounded-2xl border border-gray-700 bg-black/20 p-4"
                                        >
                                            <p className="text-white font-semibold">{c.name}</p>

                                            <textarea
                                                value={c.content}
                                                onChange={(e) => updateContributorText(c.id, e.target.value)}
                                                placeholder={`Notes by ${c.name}...`}
                                                className="mt-3 w-full min-h-[140px] rounded-2xl border border-gray-700 bg-gray-900 p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="mb-5"/>
            </div>
        </div>
    );
}
