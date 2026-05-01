import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex flex-col items-center text-center gap-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
        <AlertTriangle className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'} size={28} />
      </div>
      <p className="text-gray-600 text-sm">{message}</p>
      <div className="flex gap-3 w-full">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isLoading}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'} disabled:opacity-50`}>
          {isLoading ? 'Loading...' : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;