import { MilkdownEditor } from '../../MilkdownEditor';

const MainPage = () => {
    return (
        <div className="bg-black w-screen min-h-screen flex flex-col text-white">
            {/* Navbar */}
            <div className="bg-gray-900/80 backdrop-blur w-full h-20 border-b border-gray-700">
                <div className="flex flex-row gap-3 items-center px-4 h-full max-w-6xl mx-auto">
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

                {/* Milkdown Editor - Replaced textarea */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-5xl">
                        <MilkdownEditor />
                        <p className="mt-2 text-sm text-white/60 italic text-center">
                            Click anywhere to edit • Use the button above to view raw Markdown
                        </p>
                    </div>
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

