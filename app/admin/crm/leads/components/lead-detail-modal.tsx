"use client";
import React, { useState, useEffect } from "react";
import { Lead } from "@/hooks/leads/use-leads-crud";
import { useLeadNotes, LeadNote } from "@/hooks/leads/use-lead-notes";
import { DetailModal } from "@/shared/components/citrica-ui";
import { Text, Button, Icon, Input } from "citrica-ui-toolkit";
import { AvatarTables } from "@/public/icon-svg/avatar-tables";
import { getAvatarColor } from "@/shared/utils/avatar-colors";
import { Spinner } from "@heroui/spinner";
import { Textarea } from "@/shared/components/citrica-ui";

const ORIGIN_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  "landing_home": { color: "#16305A", bgColor: "#D4DEED", label: "Landing Home" },
};

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const { notes, isLoading: isLoadingNotes, fetchNotes, addNote, deleteNote } = useLeadNotes();
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes(lead.id);
  }, [lead.id, fetchNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSaving(true);
    await addNote(lead.id, newNote.trim());
    setNewNote("");
    setIsSaving(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    await deleteNote(noteId, lead.id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatNoteDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Justo ahora";
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours}h`;
      if (diffDays < 7) return `Hace ${diffDays}d`;

      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const origin = lead.origin || "landing_home";
  const originConfig = ORIGIN_CONFIG[origin] || { color: "#16305A", bgColor: "#D4DEED", label: origin };

  const sections = [
    {
      title: "Información del lead",
      content: (
        <div className="grid grid-cols-2 gap-x-6 pt-[12px] pb-[16px]">
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Email</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{lead.email || "-"}</Text></p>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Fecha de reserva</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{formatDate(lead.date)}</Text></p>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Horario seleccionado</Text></p>
              <div className="flex flex-wrap gap-1 mt-1">
                {lead.time_slot ? (
                  lead.time_slot.split(", ").map((slot) => (
                    <span
                      key={slot}
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EEF1F7] text-[#265197]"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <Text isAdmin variant="body" color="#678CC5">-</Text>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[8px]">
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Origen</Text></p>
              <div className="mt-1">
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-semibold"
                  style={{ backgroundColor: originConfig.bgColor, color: originConfig.color }}
                >
                  {originConfig.label}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <p><Text isAdmin variant="label" color="#678CC5">Fecha de registro</Text></p>
              <p><Text isAdmin variant="body" color="#16305A">{formatDateTime(lead.created_at)}</Text></p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mensaje",
      content: (
        <div className="pt-[8px] pb-[16px]">
          <Text isAdmin variant="body" color="#16305A">
            {lead.message || "Sin mensaje"}
          </Text>
        </div>
      ),
    },
    {
      title: "Notas",
      content: (
        <div className="pt-[8px] pb-[16px] flex flex-col gap-3">
          {/* Input para agregar nota */}
          <div className="flex gap-2 items-end">
            <Textarea
              name="newNote"
              placeholder="Escribe una nota sobre este lead..."
              variant="bordered"
              color="primary"
              radius="sm"
              fullWidth
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="!p-0"
              classNames={{ inputWrapper: "!bg-white !min-h-[60px]" }}
            />
            <Button
              isAdmin
              variant="primary"
              startContent={isSaving ? <Spinner size="sm" color="white" /> : <Icon size={16} name="Send" />}
              onPress={handleAddNote}
              isDisabled={!newNote.trim() || isSaving}
              label=""
              className="min-w-[40px] h-[40px]"
            />
          </div>

          {/* Lista de notas */}
          {isLoadingNotes ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" color="primary" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-4">
              <Text isAdmin variant="body" color="#A7BDE2">
                No hay notas aún
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#EEF1F7] rounded-lg p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#265197] flex items-center justify-center">
                        <Text isAdmin variant="label" color="#FFFFFF" className="text-[10px]">
                          {(note.user_email || "U")[0].toUpperCase()}
                        </Text>
                      </div>
                      <Text isAdmin variant="label" color="#265197" weight="bold">
                        {note.user_email || "Usuario"}
                      </Text>
                      <Text isAdmin variant="label" color="#A7BDE2">
                        {formatNoteDate(note.created_at)}
                      </Text>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <Icon size={14} name="Trash2" color="#EF4444" />
                    </button>
                  </div>
                  <Text isAdmin variant="body" color="#16305A">
                    {note.note}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailModal
      isOpen={true}
      onClose={onClose}
      width="512px"
      title={
        <div className="flex items-center gap-3">
          <AvatarTables color={getAvatarColor(lead.name || "User")} size={46} />
          <div className="flex flex-col">
            <Text isAdmin variant="body" weight="bold" color="#265197">
              {lead.name || "Sin nombre"}
            </Text>
            <Text isAdmin variant="label" weight="bold" color="#678CC5">
              {lead.email || "-"}
            </Text>
          </div>
        </div>
      }
      sections={sections}
      footer={<></>}
    />
  );
}
