import { useRef, useState, type ChangeEvent, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { MilkdownEditor } from '../../MilkdownEditor';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../firebase';

interface MainPageProps {
    onLoginRequest: () => void;
}

const MainPage = ({ onLoginRequest }: MainPageProps) => {
    const { user, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for upload flow
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedMarkdown, setExtractedMarkdown] = useState<string | null>(null);
    const [editorMarkdown, setEditorMarkdown] = useState<string>('');

    // Callback to receive markdown updates from editor
    const handleMarkdownChange = useCallback((markdown: string) => {
        setEditorMarkdown(markdown);
    }, []);

    // PDF download handler
    const handleDownloadPDF = useCallback(() => {
        if (!editorMarkdown.trim()) {
            setError('No content to download. Add some notes first!');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        const lineHeight = 7;
        let y = margin;

        // Split markdown into lines and process
        const lines = editorMarkdown.split('\n');

        for (const line of lines) {
            // Handle headers
            if (line.startsWith('# ')) {
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                const text = line.replace(/^# /, '');
                const splitLines = doc.splitTextToSize(text, maxWidth);
                for (const splitLine of splitLines) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(splitLine, margin, y);
                    y += lineHeight + 2;
                }
                y += 3;
            } else if (line.startsWith('## ')) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                const text = line.replace(/^## /, '');
                const splitLines = doc.splitTextToSize(text, maxWidth);
                for (const splitLine of splitLines) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(splitLine, margin, y);
                    y += lineHeight + 1;
                }
                y += 2;
            } else if (line.startsWith('### ')) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                const text = line.replace(/^### /, '');
                const splitLines = doc.splitTextToSize(text, maxWidth);
                for (const splitLine of splitLines) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(splitLine, margin, y);
                    y += lineHeight;
                }
                y += 1;
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                // Bullet points
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                const text = '• ' + line.replace(/^[-*] /, '');
                const splitLines = doc.splitTextToSize(text, maxWidth - 10);
                for (const splitLine of splitLines) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(splitLine, margin + 5, y);
                    y += lineHeight;
                }
            } else if (line.trim() === '') {
                // Empty line
                y += lineHeight / 2;
            } else {
                // Regular paragraph
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                // Remove markdown formatting
                const cleanText = line
                    .replace(/\*\*(.+?)\*\*/g, '$1')  // Bold
                    .replace(/\*(.+?)\*/g, '$1')      // Italic
                    .replace(/`(.+?)`/g, '$1')        // Inline code
                    .replace(/\$(.+?)\$/g, '$1');     // LaTeX (simplified)
                const splitLines = doc.splitTextToSize(cleanText, maxWidth);
                for (const splitLine of splitLines) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(splitLine, margin, y);
                    y += lineHeight;
                }
            }
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        doc.save(`vibescribe-notes-${timestamp}.pdf`);
    }, [editorMarkdown]);

    const handleUploadClick = () => {
        // Auth gate: redirect to login if not authenticated
        if (!user) {
            onLoginRequest();
            return;
        }
        // Trigger file input
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('Image must be smaller than 10MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `scans/${user.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const imageUrl = await getDownloadURL(snapshot.ref);

            // 2. Send to backend for Gemini processing
            const token = await user.getIdToken();
            const response = await fetch('http://localhost:6300/api/users/scan', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    onLoginRequest();
                    return;
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const document = await response.json();

            // 3. Load markdown into editor
            if (document.markdownContent) {
                setExtractedMarkdown(document.markdownContent);
            } else {
                setError('No text could be extracted from the image');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to process image');
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-black w-screen min-h-screen flex flex-col text-white">
            {/* Navbar */}
            <div className="bg-gray-900/80 backdrop-blur w-full h-20 border-b border-gray-700">
                <div className="flex flex-row gap-3 items-center justify-between px-4 h-full max-w-6xl mx-auto">
                    <div className="flex flex-row gap-3 items-center">
                        <img
                            src="src/assets/logo.png"
                            alt="VibeScribe Logo"
                            className="h-16 w-auto"
                        />
                        <p className="font-bold text-2xl tracking-wide">VibeScribe</p>
                    </div>

                    {/* Login/Logout Button */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={user.photoURL || ''}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 border-emerald-500"
                            />
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-lg bg-gray-800 text-white/80 hover:bg-gray-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginRequest}
                            className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
            />

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

                {/* Error Message */}
                {error && (
                    <div className="w-full max-w-5xl mx-auto">
                        <div className="bg-red-900/50 border border-red-700 rounded-xl px-4 py-3 text-red-200 flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className={`
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
                            
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                        `}
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                Click Here to Upload a Photo
                                <span className="text-2xl font-bold leading-none transition-transform duration-200 group-hover:rotate-90">
                                    +
                                </span>
                            </>
                        )}
                    </button>
                </div>

                {/* Milkdown Editor */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-5xl">
                        <MilkdownEditor
                            initialMarkdown={extractedMarkdown}
                            onMarkdownChange={handleMarkdownChange}
                        />
                        <p className="mt-2 text-sm text-white/60 italic text-center">
                            Click anywhere to edit • Use the button above to view raw Markdown
                        </p>
                    </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-center pb-8">
                    <button
                        onClick={handleDownloadPDF}
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
