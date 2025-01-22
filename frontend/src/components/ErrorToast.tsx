import Toast from './Toast'

interface ErrorToastProps {
  message: string
  onClose: () => void
}

export default function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <Toast
      message={message}
      onClose={onClose}
      duration={5000}
      variant="error"
    />
  )
} 