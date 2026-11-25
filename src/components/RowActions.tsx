import { Pencil, Trash2 } from "lucide-react";

export function RowActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <>
      {onEdit && (
        <button onClick={onEdit} className="text-muted-foreground hover:text-foreground transition" aria-label="Editar" title="Editar">
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => { if (confirm("Excluir este item?")) onDelete(); }}
        className="text-muted-foreground hover:text-destructive transition" aria-label="Excluir" title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}
