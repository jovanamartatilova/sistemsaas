import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Trash2 } from 'lucide-react';
import { storeStamp } from '../api/stampService';
import { useHRToast, HRToastStack } from './HRToast';

const StampModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toasts, pushToast, removeToast } = useHRToast();
    
    const [uploadedImage, setUploadedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleClear = () => {
        setUploadedImage(null);
        setProcessedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imgDataUrl = event.target.result;
            setUploadedImage(imgDataUrl);
            processImage(imgDataUrl);
        };
        reader.readAsDataURL(file);
    };

    const processImage = (imgSrc) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Simple white background removal
            // Check if pixel is close to white (rgb > 200) and set alpha to 0
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (r > 200 && g > 200 && b > 200) {
                    data[i + 3] = 0; // Set alpha to transparent
                }
            }

            ctx.putImageData(imageData, 0, 0);
            
            // Auto crop the transparent edges to fit the stamp nicely
            const croppedCanvas = autoCropCanvas(canvas);
            setProcessedImage(croppedCanvas.toDataURL('image/png'));
        };
        img.src = imgSrc;
    };

    // Helper to crop canvas empty space
    const autoCropCanvas = (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let top = canvas.height, bottom = 0, left = canvas.width, right = 0;
        let found = false;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha = data[((y * canvas.width) + x) * 4 + 3];
                if (alpha > 10) { // Not fully transparent
                    found = true;
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                    if (x < left) left = x;
                    if (x > right) right = x;
                }
            }
        }

        if (!found) return canvas;

        const cropWidth = right - left + 1;
        const cropHeight = bottom - top + 1;

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        
        return croppedCanvas;
    };

    const handleSave = async () => {
        if (!processedImage) {
            pushToast('Silakan unggah gambar stempel terlebih dahulu', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await storeStamp(processedImage);
            if (res.success) {
                pushToast('Stempel berhasil disimpan', 'success');
                setTimeout(() => {
                    onSuccess(res.stamp_url);
                    handleClose();
                }, 1000);
            }
        } catch (error) {
            console.error('Error saving stamp:', error);
            pushToast('Gagal menyimpan stempel', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        handleClear();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                <HRToastStack toasts={toasts} onDismiss={removeToast} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Kelola Stempel Perusahaan</h2>
                        <p className="text-sm text-slate-500 mt-1">Unggah logo/stempel perusahaan untuk disematkan pada dokumen</p>
                    </div>
                    <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-hidden relative" style={{ minHeight: '300px' }}>
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-slate-300" style={{ height: '300px' }}>
                            {!uploadedImage ? (
                                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Pilih gambar stempel</p>
                                        <p className="text-xs text-slate-500 mt-1">Background putih akan otomatis dihapus (transparan)</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        accept="image/png, image/jpeg, image/jpg" 
                                        className="hidden" 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                    >
                                        Pilih File
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full relative flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZmZmZiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiPjwvcmVjdD4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiPjwvcmVjdD4KPC9zdmc+')]">
                                    {processedImage && (
                                        <img src={processedImage} alt="Processed Stamp" className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium text-slate-600 rounded-md shadow-sm border border-slate-200">
                                        Pratinjau (Transparan)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <button 
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> 
                        <span className="hidden sm:inline">Bersihkan</span>
                    </button>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={handleClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm shadow-blue-600/20"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Simpan Stempel
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StampModal;
