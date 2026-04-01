'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateCard } from '@/actions/cards'
import { toast } from 'sonner'
import { 
  AlignLeft, 
  FileText, 
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface CardModalProps {
  card: any
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedCard: any) => void
  onDelete: (cardId: string) => void
  role: "owner" | "editor" | "viewer"
}

export function CardModal({ card, isOpen, onClose, onUpdate, onDelete, role }: CardModalProps) {
  const [title, setTitle] = useState(card?.title || '')
  const [description, setDescription] = useState(card?.description || '')
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  const canEdit = role === "owner" || role === "editor"

  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title)
      setDescription(card.description || '')
    }
  }, [isOpen, card])

  const handleUpdate = async (updates: any) => {
    const result = await updateCard(card.id, updates)
    if (result.error) {
      toast.error(result.error)
    } else {
      onUpdate(result.data)
      toast.success('Card updated!')
    }
  }

  if (!card) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-3xl">
        <DialogHeader className="px-8 pt-8">
          <DialogTitle className="sr-only">Card Details</DialogTitle>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => title !== card.title && handleUpdate({ title })}
                disabled={!canEdit}
                className="w-full bg-transparent text-2xl font-black tracking-tight focus:bg-slate-100 dark:focus:bg-slate-800 px-2 py-1 rounded-xl outline-none ring-primary disabled:cursor-default transition-all"
              />
              <p className="text-sm text-muted-foreground mt-1 px-2 font-medium">
                in list <span className="text-blue-600 font-bold hover:underline cursor-pointer">{card.list_title || 'List'}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
          {/* Description Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 font-bold text-lg">
              <AlignLeft className="h-5 w-5 text-blue-600" />
              <h3>Description</h3>
              {!isEditingDescription && description && canEdit && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)} className="text-blue-600 font-bold">
                  Edit
                </Button>
              )}
            </div>
            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="w-full min-h-[140px] p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm leading-relaxed"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {
                    handleUpdate({ description })
                    setIsEditingDescription(false)
                  }} className="rounded-xl font-bold px-6">Save Changes</Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(false)} className="rounded-xl font-medium">Cancel</Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => canEdit && setIsEditingDescription(true)}
                className={description ? "text-sm text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all whitespace-pre-wrap" : "bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:border-blue-600/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-sm text-muted-foreground font-medium text-center"}
              >
                {description || (canEdit ? "Add a more detailed description..." : "No description provided.")}
              </div>
            )}
          </section>
        </div>

        <div className="p-8 border-t bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="h-4 w-4" />
              Created {format(new Date(card.created_at), 'PPP')}
            </div>
            {canEdit && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  if(confirm('Delete this card?')) {
                    onDelete(card.id)
                    onClose()
                  }
                }}
                className="font-bold rounded-xl px-6"
              >
                Delete Card
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
