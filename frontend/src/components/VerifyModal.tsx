import { useState } from 'react';
import Button from './Button';

export type ActionType = 'TERVERIFIKASI' | 'REVISI' | 'DITOLAK';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (action: ActionType, catatan: string) => Promise<void>;
  action: ActionType | null;
  loading?: boolean;
}

export default function VerifyModal({ isOpen, onClose, onSubmit, action, loading }: VerifyModalProps) {
  const [catatan, setCatatan] = useState('');

  if (!isOpen || !action) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'TERVERIFIKASI':
        return {
          title: 'Konfirmasi Setujui',
          icon: (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          desc: 'Pengajuan akan disetujui dan bergeser ke status TERVERIFIKASI. Siswa akan menerima email notifikasi.',
          color: 'bg-green-600 hover:bg-green-700',
          needCatatan: false
        };
      case 'REVISI':
        return {
          title: 'Konfirmasi Revisi',
          icon: (
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ),
          desc: 'Pengajuan akan dikembalikan untuk direvisi oleh siswa. Email notifikasi beserta catatan akan dikirimkan.',
          color: 'bg-orange-600 hover:bg-orange-700',
          needCatatan: true
        };
      case 'DITOLAK':
        return {
          title: 'Konfirmasi Tolak',
          icon: (
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ),
          desc: 'Pengajuan akan ditolak secara permanen. Siswa akan menerima email notifikasi.',
          color: 'bg-red-600 hover:bg-red-700',
          needCatatan: true
        };
      default:
        return null;
    }
  };

  const details = getActionDetails();
  if (!details) return null;

  const isCatatanValid = details.needCatatan ? catatan.trim().length >= 10 : true;

  const handleSubmit = async () => {
    await onSubmit(action, catatan);
    setCatatan(''); // reset setelah sukses
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => !loading && onClose()}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {details.icon}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{details.title}</h3>
          <p className="text-sm text-gray-500 mb-6">{details.desc}</p>
        </div>

        {details.needCatatan && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Catatan Admin <span className="text-red-500">*</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Berikan alasan (minimal 10 karakter)..."
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none ${
                catatan.length > 0 && !isCatatanValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {catatan.length > 0 && !isCatatanValid && (
              <p className="text-red-500 text-xs mt-1 text-left">Catatan minimal 10 karakter.</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1"
          >
            Batal
          </Button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isCatatanValid}
            className={`flex-1 rounded-lg px-4 py-2 text-white font-medium transition-colors ${details.color} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Memproses...' : 'Selesaikan'}
          </button>
        </div>
      </div>
    </div>
  );
}
