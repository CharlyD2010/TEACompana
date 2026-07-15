'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Star, ChevronLeft, Loader2, Inbox, Rainbow, LayoutDashboard, Users, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const AppLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg rotate-3 relative overflow-hidden group">
      <Rainbow className="w-10 h-10 text-white animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
    </div>
  </div>
);

export const AppButton = ({ className, variant, ...props }: React.ComponentProps<typeof Button>) => (
  <Button 
    variant={variant}
    className={cn(
      "rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-sm h-12 px-6", 
      variant === 'default' && "bg-primary hover:bg-primary/90 text-white",
      className
    )} 
    {...props} 
  />
);

export const AppInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input className={cn("rounded-2xl border-2 border-muted focus-visible:ring-primary h-14 font-bold text-sm bg-white/50", className)} {...props} />
);

export const AppCard = ({ className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card className={cn("rounded-[2.5rem] border-none shadow-xl shadow-primary/5 overflow-hidden bg-white", className)} {...props} />
);

export const AppHeader = ({ 
  title, 
  showBack = true, 
  showBackToChildren = false,
  showBackToDashboard = false,
  childId,
  children 
}: { 
  title: string, 
  showBack?: boolean, 
  showBackToChildren?: boolean,
  showBackToDashboard?: boolean,
  childId?: string,
  children?: React.ReactNode 
}) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-4 md:p-6 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-muted/50">
      <div className="flex items-center gap-4 max-w-[70%]">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-muted/30 hover:bg-muted/50 flex-shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {!showBack && <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0"><Rainbow className="h-6 w-6 text-primary" /></div>}
        <div className="flex flex-col min-w-0">
          <h1 className="text-base md:text-xl font-black text-primary uppercase tracking-tighter leading-none truncate">{title}</h1>
          <div className="flex gap-3 mt-1.5 flex-wrap">
            {showBackToChildren && (
              <button onClick={() => router.push('/children')} className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors tracking-widest whitespace-nowrap">
                <Users className="w-3 h-3" /> Mis Niños
              </button>
            )}
            {showBackToDashboard && childId && (
              <button onClick={() => router.push(`/child/${childId}/dashboard`)} className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors tracking-widest whitespace-nowrap">
                <LayoutDashboard className="w-3 h-3" /> Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}
      </div>
    </div>
  );
};

export const StarRating = ({ rating, max = 3 }: { rating: number, max?: number }) => (
  <div className="flex gap-1">
    {[...Array(max)].map((_, i) => (
      <Star key={i} className={cn("w-4 h-4", i < rating ? "fill-accent text-accent" : "text-muted fill-muted")} />
    ))}
  </div>
);

export const ProgressBar = ({ value, color = "bg-secondary" }: { value: number, color?: string }) => (
  <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
    <div 
      className={cn("h-full transition-all duration-700 ease-out", color)} 
      style={{ width: `${value}%` }} 
    />
  </div>
);

export const SelectChip = ({ 
  label, 
  selected, 
  onClick 
}: { 
  label: string, 
  selected: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2.5 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap",
      selected 
        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
        : "bg-white border-muted text-muted-foreground hover:border-primary/30"
    )}
  >
    {label}
  </button>
);

export const LoadingState = ({ message = "Cargando...", onRetry }: { message?: string, onRetry?: () => void }) => {
  const router = useRouter();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000); // 8 seconds timeout
    return () => clearTimeout(timer);
  }, []);

  if (showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-8 animate-in fade-in duration-500 min-h-[400px]">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Esta operación está tardando más de lo esperado</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Por favor verifica tu conexión a internet o intenta de nuevo.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {onRetry && (
            <AppButton onClick={() => { setShowTimeout(false); onRetry(); }} className="w-full bg-secondary text-secondary-foreground">
              <RefreshCcw className="w-4 h-4 mr-2" /> Reintentar
            </AppButton>
          )}
          <AppButton onClick={() => router.push('/children')} variant="outline" className="w-full">
            <Users className="w-4 h-4 mr-2" /> Volver a Mis Niños
          </AppButton>
          <AppButton onClick={() => router.push('/')} variant="ghost" className="w-full text-muted-foreground">
            Ir al menú principal
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6 min-h-[400px]">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <Rainbow className="w-6 h-6 text-primary/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">{message}</p>
    </div>
  );
};

export const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  title: string, 
  description: string, 
  actionLabel?: string, 
  onAction?: () => void 
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted">
    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
      <Inbox className="w-10 h-10 text-muted-foreground opacity-30" />
    </div>
    <div className="space-y-3">
      <h3 className="text-xl font-black text-primary uppercase tracking-tighter">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>
    {actionLabel && onAction && (
      <AppButton onClick={onAction} className="px-8">{actionLabel}</AppButton>
    )}
  </div>
);