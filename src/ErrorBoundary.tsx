import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-2xl font-black text-rose-600 tracking-tight">Algo salió mal</h2>
            <p className="text-xs text-slate-500 mb-4">Se detectó un error al inicializar la vista:</p>
            <div className="mb-5 rounded-xl bg-slate-900 p-4 text-xs text-rose-300 font-mono overflow-x-auto">
              <p>{this.state.error?.message || 'Error desconocido'}</p>
            </div>
            <div className="space-y-2">
              <button
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                onClick={() => window.location.reload()}
              >
                Recargar Página (F5)
              </button>
              <button
                className="w-full rounded-xl bg-slate-200 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 hover:bg-slate-300 transition-all"
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.href = '/';
                }}
              >
                Limpiar Caché e Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
