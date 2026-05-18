import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Button from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100">
          <div className="gradient-sunset h-2" />
          <div className="px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-600">
              {this.state.error?.message ||
                'An unexpected error occurred while rendering this page.'}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="primary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Reload page
              </Button>
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => window.history.back()}
              >
                Go back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
