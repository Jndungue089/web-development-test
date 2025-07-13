import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  confirmText,
  onConfirm,
  onCancel,
}: ActionConfirmDialogProps) {
  const [input, setInput] = useState("");
  const canConfirm = confirmText ? input === confirmText : true;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-bold mb-2 dark:text-white">{title}</h2>
            {description && <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>}
            {confirmText && (
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                  placeholder={confirmText}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Digite exatamente: <span className="font-mono bg-gray-100 px-1 rounded">{confirmText}</span></p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={onCancel}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition ${!canConfirm ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!canConfirm}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
