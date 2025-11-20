import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <div className="auth-background">
      <div className={cn("auth-container", className)}>
        {children}
      </div>
    </div>
  );
};
