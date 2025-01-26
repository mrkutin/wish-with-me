'use client'

import { Dialog } from '@headlessui/react'
import { X, Calendar } from 'lucide-react'
import { useState } from 'react'
import Modal from '@/components/Modal'
import Button from '@/components/Button'

interface EditWishlistModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; dueDate?: string | null }) => Promise<void>
  initialData: {
    name: string
    description: string
    dueDate?: string
  }
}

export default function EditWishlistModal({ isOpen, onClose, onSubmit, initialData }: EditWishlistModalProps) {
  const [name, setName] = useState(initialData.name)
  const [description, setDescription] = useState(initialData.description)
  const [dueDate, setDueDate] = useState(initialData.dueDate || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit({
        name,
        description,
        dueDate: dueDate || null
      })
      onClose()
    } catch (err) {
      setError('Failed to update wishlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="p-6">
          <Dialog.Title as="h3" className="text-lg font-semibold mb-4">
            Edit Wishlist
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Wishlist Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-32"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                Due Date (optional)
              </label>
              <div className="relative">
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Calendar className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
} 