import React, { useState, useEffect } from 'react';
import { PenTool, Upload, ChevronDown, ChevronUp, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getSignature, deleteSignature } from '../api/signatureService';
import SignatureModal from './SignatureModal';
import { useHRToast, HRToastStack } from './HRToast';

const SignatureSelector = ({ onSignatureChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toasts, pushToast, removeToast } = useHRToast();

    const fetchSignature = async () => {
        setIsLoading(true);
        try {
            const res = await getSignature();
            if (res.success && res.signature_url) {
                setSignatureUrl(res.signature_url);
                if (onSignatureChange) onSignatureChange(res.signature_url);
            } else {
                setSignatureUrl(null);
                if (onSignatureChange) onSignatureChange(null);
            }
        } catch (error) {
            console.error('Error fetching signature:', error);
            // Don't show error toast on 404, just means no signature set
            if (error?.response?.status !== 404) {
                pushToast('Failed to load signature', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSignature();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSuccess = (url) => {
        setSignatureUrl(url);
        if (onSignatureChange) onSignatureChange(url);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this signature?')) return;
        
        try {
            const res = await deleteSignature();
            if (res.success) {
                setSignatureUrl(null);
                if (onSignatureChange) onSignatureChange(null);
                pushToast('Signature deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting signature:', error);
            pushToast('Failed to delete signature', 'error');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            
            <HRToastStack toasts={toasts} onDismiss={removeToast} />

            {/* Header / Toggle */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100/80 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${signatureUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {signatureUrl ? <ImageIcon className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-slate-800">Document Signature</h3>
                        <p className="text-sm text-slate-500">
                            {signatureUrl ? 'Signature is set' : 'No signature set'}
                        </p>
                    </div>
                </div>
                <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-6 py-5 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            
                            {/* Preview Area */}
                            <div className="w-full sm:w-1/2 flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700">Signature Preview</span>
                                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center min-h-[160px] relative overflow-hidden group">
                                    {signatureUrl ? (
                                        <>
                                            <img src={signatureUrl} alt="Signature Preview" className="max-h-[120px] object-contain mix-blend-multiply" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                <button 
                                                    onClick={handleDelete}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200"
                                                    title="Delete Signature"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <PenTool className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No preview available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="w-full sm:w-1/2 flex flex-col justify-center gap-4 py-4 sm:py-8">
                                <div className="text-sm text-slate-600 mb-2">
                                    This signature will be attached at the bottom of the generated documents (LoA / Certificate).
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
                                >
                                    {signatureUrl ? (
                                        <><Upload className="w-4 h-4" /> Change Signature</>
                                    ) : (
                                        <><PenTool className="w-4 h-4" /> Set Signature Now</>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            )}

            <SignatureModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default SignatureSelector;
