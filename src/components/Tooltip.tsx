import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${positions[position]} z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap`}
          >
            {content}
            <div className={`absolute ${position === 'top' ? 'top-full' : position === 'bottom' ? 'bottom-full' : position === 'left' ? 'left-full' : 'right-full'} left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent ${
              position === 'top' ? 'border-t-gray-900' :
              position === 'bottom' ? 'border-b-gray-900' :
              position === 'left' ? 'border-l-gray-900' :
              'border-r-gray-900'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

