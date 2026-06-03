import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-16">
          <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl shadow-xl p-8 text-center space-y-6 animate-fade-in">
            {/* Animated Warning Icon */}
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary">Oops, Terjadi Kesalahan!</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Terjadi kesalahan sistem saat memuat halaman ini. Silakan coba memuat ulang halaman atau kembali ke Beranda.
              </p>
            </div>

            {/* Error Message Collapse */}
            {this.state.error && (
              <details className="text-left bg-gray-50 border border-gray-150 rounded-xl p-3 text-xs text-gray-600 font-mono">
                <summary className="cursor-pointer font-semibold text-gray-700 select-none">
                  Detail Kesalahan
                </summary>
                <div className="mt-2 whitespace-pre-wrap overflow-x-auto max-h-40 leading-relaxed">
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 px-4 rounded-xl transition"
              >
                Muat Ulang
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 bg-primary hover:bg-primary-light text-secondary text-sm font-semibold py-2.5 px-4 rounded-xl shadow-sm transition"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
