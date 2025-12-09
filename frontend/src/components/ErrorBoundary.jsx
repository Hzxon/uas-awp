import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI error boundary caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
          <div className="max-w-md w-full bg-white border border-slate-200 shadow-lg rounded-2xl p-6 text-center space-y-3">
            <h1 className="text-xl font-bold">Ada yang tidak beres</h1>
            <p className="text-sm text-slate-600">
              Mohon muat ulang halaman. Jika berulang, coba keluar dan masuk lagi.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Muat ulang
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
