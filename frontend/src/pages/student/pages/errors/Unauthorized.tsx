import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold font-display mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please log in with appropriate credentials.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/student/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link to="/login" className="btn-primary flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
