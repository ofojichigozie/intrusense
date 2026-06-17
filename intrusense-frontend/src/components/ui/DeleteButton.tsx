import { Trash2 } from 'lucide-react';

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      title="Delete reading"
    >
      <Trash2 size={14} />
    </button>
  );
}
