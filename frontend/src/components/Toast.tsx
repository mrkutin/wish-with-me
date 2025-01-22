import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  onClose: () => void
  duration?: number
  variant?: 'default' | 'error' | 'success'
}

const variants = {
  default: 'bg-gray-900',
  error: 'bg-red-600',
  success: 'bg-green-600'
}

export default function Toast({ 
  message, 
  action, 
  onClose, 
  duration = 5000,
  variant = 'default' 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-x-4 rounded-lg ${variants[variant]} px-4 py-3 shadow-lg`}>
      <p className="text-sm text-white">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-white hover:text-gray-100 transition-colors"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
} 