import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';

export const ImageEditor = () => {
    const [image, setImage] = useState<{ base64: string, mimeType: string, preview: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            setImage({ 
                base64, 
                mimeType: file.type, 
                preview: event.target?.result as string 
            });
            setResultImage(null);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleEdit = async () => {
        if (!image || !prompt) return;
        setLoading(true);
        try {
            const result = await editImage(image.base64, image.mimeType, prompt);
            setResultImage(result);
        } catch (e) {
            alert('Failed to edit image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (text: string) => {
        setPrompt(text);
    };

    const downloadImage = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = 'edited-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="bg-purple-100 text-purple-600 p-2 rounded-xl text-2xl">✨</span>
                    AI Image Studio
                </h2>
                <p className="text-slate-500">
                    Upload an image and use natural language to edit it. Powered by Gemini 2.5 Flash.
                </p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Column: Input */}
                <div className="flex flex-col gap-6">
                    <div 
                        className={`flex-1 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center
                            ${isDragging 
                                ? 'border-purple-500 bg-purple-50' 
                                : image 
                                    ? 'border-slate-200 bg-slate-50' 
                                    : 'border-slate-300 bg-slate-50/50 hover:border-purple-300 hover:bg-slate-50'
                            }
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {image ? (
                            <>
                                <img src={image.preview} alt="Original" className="max-h-full max-w-full object-contain rounded-xl shadow-sm" />
                                <button 
                                    onClick={() => setImage(null)}
                                    className="absolute top-4 right-4 bg-white/90 text-slate-700 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                                    title="Remove Image"
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <div className="pointer-events-none">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                                    📷
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Upload Source Image</h3>
                                <p className="text-sm text-slate-500 mb-6">Drag & Drop or Click to Browse</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        {!image && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-transform active:scale-95 cursor-pointer pointer-events-auto"
                            >
                                Browse Files
                            </button>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Editing Prompt</label>
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe your edit (e.g. 'Add a retro filter', 'Remove the background')"
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                            />
                            <button 
                                onClick={handleEdit}
                                disabled={!image || !prompt || loading}
                                className={`px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
                                    !image || !prompt || loading 
                                    ? 'bg-slate-300 cursor-not-allowed' 
                                    : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 hover:shadow-purple-300'
                                }`}
                            >
                                {loading ? 'Generating...' : '✨ Generate'}
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold text-slate-400 py-1">Try:</span>
                            {['Add a retro filter', 'Turn into a sketch', 'Cyberpunk style', 'Remove background objects'].map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleQuickPrompt(s)}
                                    className="px-3 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-full text-xs font-medium transition-colors border border-slate-200"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Result */}
                <div className="rounded-3xl border-2 border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden h-full min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center animate-in fade-in">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <h3 className="text-lg font-bold text-slate-800">Processing...</h3>
                            <p className="text-slate-500 text-sm">Applying your edits with Gemini</p>
                        </div>
                    ) : resultImage ? (
                        <div className="relative w-full h-full flex items-center justify-center group animate-in fade-in zoom-in-95 duration-300">
                            <img src={resultImage} alt="Edited Result" className="max-h-full max-w-full object-contain rounded-xl shadow-lg" />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-8">
                                <button 
                                    onClick={downloadImage}
                                    className="px-6 py-2 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    ⬇️ Download
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400">
                            <div className="text-4xl mb-4 opacity-50">✨</div>
                            <p className="font-medium">Your masterpiece will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};