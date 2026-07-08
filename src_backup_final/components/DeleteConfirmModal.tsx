'use client';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    isDeleting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmModal({
    isOpen,
    title = 'Confirm Deletion',
    message = 'This action cannot be undone. Are you sure you want to proceed?',
    isDeleting = false,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
            <div className="max-w-sm w-full bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-white/60 mt-1">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
