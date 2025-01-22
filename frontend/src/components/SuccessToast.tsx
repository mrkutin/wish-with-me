import Toast from './Toast'

interface SuccessToastProps {
  message: string
  onClose: () => void
}

export default function SuccessToast({ message, onClose }: SuccessToastProps) {
  return (
    <Toast
      message={message}
      onClose={onClose}
      duration={3000}
      variant="success"
    />
  )
} 