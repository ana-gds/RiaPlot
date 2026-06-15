import { Component } from "react";

/**
 * Captura erros de renderização em qualquer parte da árvore e mostra um ecrã
 * de recuperação amigável, em vez de uma página em branco. Os erros são
 * registados na consola para diagnóstico.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary capturou um erro:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-svh px-6 text-center bg-white">
          <h1 className="text-xl font-bold text-dark mb-2">Algo correu mal</h1>
          <p className="text-sm text-muted mb-6 max-w-xs">
            Ocorreu um erro inesperado. Tenta recarregar a aplicação.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-95"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
