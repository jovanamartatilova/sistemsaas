import React, { useState, useEffect } from 'react';
import { Award, Upload, ChevronDown, ChevronUp, Image as ImageIcon, Trash2 } from 'lucide-react';
import { getStamp, deleteStamp } from '../api/stampService';
import StampModal from './StampModal';
import { useHRToast, HRToastStack } from './HRToast';

const StampSelector = ({ onStampChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stampUrl, setStampUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toasts, pushToast, removeToast } = useHRToast();

    const fetchStamp = async () => {
        setIsLoading(true);
        try {
            const res = await getStamp();
            if (res.success && res.stamp_url) {
                setStampUrl(res.stamp_url);
                if (onStampChange) onStampChange(res.stamp_url);
            } else {
                setStampUrl(null);
                if (onStampChange) onStampChange(null);
            }
        } catch (error) {
            console.error('Error fetching stamp:', error);
            if (error?.response?.status !== 404) {
                pushToast('Failed to load company seal', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStamp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSuccess = (url) => {
        setStampUrl(url);
        if (onStampChange) onStampChange(url);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this company seal?')) return;
        
        try {
            const res = await deleteStamp();
            if (res.success) {
                setStampUrl(null);
                if (onStampChange) onStampChange(null);
                pushToast('Company seal removed successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting stamp:', error);
            pushToast('Failed to delete company seal', 'error');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            
            <HRToastStack toasts={toasts} onDismiss={removeToast} />

            {/* Header / Toggle */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100/80 transition-colors"
                type="button"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${stampUrl ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                        {stampUrl ? <ImageIcon className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-slate-800">Company seal</h3>
                        <p className="text-sm text-slate-500">
                            {stampUrl ? 'Company seal active' : 'Company seal not set'}
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
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            
                            {/* Preview Area */}
                            <div className="w-full sm:w-1/2 flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-700 font-semibold">Seal Preview</span>
                                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center min-h-[160px] relative overflow-hidden group">
                                    {stampUrl ? (
                                        <>
                                            <img src={stampUrl} alt="Seal Preview" className="max-h-[120px] object-contain mix-blend-multiply" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                                                <button 
                                                    type="button"
                                                    onClick={handleDelete}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200"
                                                    title="Delete Seal"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No seal available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="w-full sm:w-1/2 flex flex-col justify-center gap-4 py-4 sm:py-8">
                                <div className="text-sm text-slate-600 mb-2">
                                    This seal will be overlaid on the primary signature in the document (LoA / Certificate).
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-purple-600/20"
                                >
                                    {stampUrl ? (
                                        <><Upload className="w-4 h-4" /> Replace Seal</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Upload Company Seal</>
                                    )}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            )}

            <StampModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default StampSelector;
