'use client'

import { useState } from 'react'
import { X, Link as LinkIcon, Type, Loader2, CheckCircle } from 'lucide-react'
import { resolveUrl } from '@/app/api/resolveUrl'
import ErrorToast from './ErrorToast'
import SuccessToast from './SuccessToast'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    url?: string
    price?: number
    currency?: string
    image?: string
  }) => Promise<void>
}

function getUrlInputStatusClasses(status: 'idle' | 'resolving' | 'success' | 'error'): string {
  switch (status) {
    case 'success':
      return 'border-success focus:ring-success'
    default:
      return ''
  }
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolveStatus, setResolveStatus] = useState<'idle' | 'resolving' | 'success' | 'error'>('idle')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    price: '',
    currency: '',
    image: ''
  })

  if (!isOpen) return null

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      price: '',
      currency: '',
      image: ''
    })
    setError(null)
    setSuccessMessage(null)
    setResolveStatus('idle')
    setIsLoading(false)
    setIsResolving(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  async function handleUrlBlur() {
    if (!formData.url) return
    
    setIsResolving(true)
    setResolveStatus('resolving')
    setError(null)
    setSuccessMessage(null)
    
    const resolvedData = await resolveUrl(formData.url)
    setIsResolving(false)

    if (resolvedData) {
      setFormData(prev => ({
        ...prev,
        name: resolvedData.name,
        price: resolvedData.price?.toString() || '',
        currency: resolvedData.currency || '',
        image: resolvedData.image || ''
      }))
      setResolveStatus('success')
      setSuccessMessage('Item details resolved successfully')
    } else {
      setResolveStatus('idle')
      setError('Could not resolve item details. Please fill them in manually.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSubmit({
        name: formData.name,
        url: formData.url || undefined,
        price: formData.price ? Number(formData.price) : undefined,
        currency: formData.currency || undefined,
        image: formData.image || undefined
      })
      
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
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
            onClick={handleClose}
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
            <div className="relative">
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={e => {
                  setFormData(prev => ({ ...prev, url: e.target.value }))
                  if (resolveStatus !== 'idle') {
                    setResolveStatus('idle')
                  }
                }}
                onBlur={handleUrlBlur}
                placeholder="Enter product URL"
                className={`block w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary ${getUrlInputStatusClasses(resolveStatus)}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {resolveStatus === 'resolving' && (
                  <Loader2 
                    className="h-5 w-5 animate-spin text-primary" 
                    aria-label="Resolving item details..." />
                )}
                {resolveStatus === 'success' && (
                  <CheckCircle 
                    className="h-5 w-5 text-success" 
                    aria-label="Item details resolved successfully" 
                  />
                )}
              </div>
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
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter item name"
              required
              className="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-primary mb-1">
                Price
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                className="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-text-primary mb-1">
                Currency
              </label>
              <input
                type="text"
                id="currency"
                value={formData.currency}
                onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
                className="block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  )
} 