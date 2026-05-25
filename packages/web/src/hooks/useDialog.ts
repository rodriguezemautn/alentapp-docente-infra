import { useState, useCallback } from "react";

interface UseDialogReturn<T> {
  isOpen: boolean;
  isSubmitting: boolean;
  editingItem: T | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  close: () => void;
  setSubmitting: (v: boolean) => void;
}

/**
 * Hook para manejar el estado de diálogos modales de creación/edición.
 *
 * Centraliza isOpen, editingItem, isSubmitting.
 * Cada view usa el mismo patrón sin repetir estado.
 *
 * @example
 * const dialog = useDialog<SportDetailDTO>();
 * // ...
 * <DialogRoot open={dialog.isOpen} onOpenChange={(e) => !e.open && dialog.close()}>
 */
export function useDialog<T>(): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSubmitting(false);
  }, []);

  return { isOpen, isSubmitting, editingItem, openCreate, openEdit, close, setSubmitting };
}
