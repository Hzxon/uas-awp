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

  handleBack = () => {
    this.setState({ hasError: false });
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
          <div className="max-w-md w-full bg-white border border-slate-200 shadow-lg rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
            </div>
            <h1 className="text-xl font-bold">Ada yang tidak beres</h1>
            <p className="text-sm text-slate-600">
              Mohon muat ulang halaman atau kembali.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleBack}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
              >
                <i className="fas fa-arrow-left mr-2"></i>Kembali
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Muat ulang
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
