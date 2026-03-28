import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '10px', color: 'red', border: '1px solid red', borderRadius: '4px', background: 'rgba(255,0,0,0.1)' }}>
          <p><strong>Failed to render message.</strong></p>
          <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
