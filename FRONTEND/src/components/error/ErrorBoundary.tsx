import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-600">Une erreur est survenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text/60 mb-4">
              {this.state.error?.message || "Quelque chose s'est mal passé."}
            </p>
            <Button
              variant="primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
