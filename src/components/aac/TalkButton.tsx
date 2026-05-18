import { Volume2, Loader2 } from 'lucide-react'
import Button from '../Button'

interface TalkButtonProps {
  onClick: () => void
  disabled?: boolean
  isSpeaking?: boolean
  className?: string
}

export default function TalkButton({
  onClick,
  disabled = false,
  isSpeaking = false,
  className = ''
}: TalkButtonProps) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      disabled={disabled || isSpeaking}
      className={`
        text-xl md:text-2xl px-8 md:px-12 py-4 md:py-6 
        flex items-center justify-center space-x-3
        min-w-[200px] md:min-w-[250px]
        ${isSpeaking ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {isSpeaking ? (
        <>
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
          <span>Speaking...</span>
        </>
      ) : (
        <>
          <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
          <span>Talk</span>
        </>
      )}
    </Button>
  )
}
