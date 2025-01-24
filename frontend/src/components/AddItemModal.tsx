'use client'

import { useState } from 'react'
import { X, Link as LinkIcon, Type } from 'lucide-react'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    url?: string
    price?: number
    currency?: string
    priority?: 'low' | 'medium' | 'high'
    notes?: string
  }) => Promise<void>
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: ''
  })

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        name: formData.name || undefined,
        url: formData.url || undefined
      })
      
      // Reset form
      setFormData({
        name: '',
        url: ''
      })
      onClose()
    } catch (err) {
      console.error('Failed to add item:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Add Item</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-text-primary mb-1 flex items-center">
              <LinkIcon className="h-4 w-4 mr-1 text-text-secondary" />
              URL
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              disabled={!!formData.name}
              placeholder="Enter product URL"
              onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-sm text-text-secondary">or</span>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1 flex items-center">
              <Type className="h-4 w-4 mr-1 text-text-secondary" />
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              disabled={!!formData.url}
              placeholder="Enter item name"
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!formData.url && !formData.name)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 