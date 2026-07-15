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
    <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-lg rotate-3 relative overflow-hidden group">
      <Rainbow className="w-12 h-12 text-white" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
    </div>
  </div>
);

export const AppButton = ({ className, variant, ...props }: React.ComponentProps<typeof Button>) => (
  <Button 
    variant={variant}
    className={cn(
      "rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-90 shadow-md h-14 px-8 min-h-[48px]", 
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
  <Card className={cn("rounded-[2.5rem] border-none shadow-xl shadow-primary/5 overflow-hidden bg-white transition-all", className)} {...props} />
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
    <div className="flex items-center justify-between p-4 md:p-6 bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b-2 border-muted/50">
      <div className="flex items-center gap-4 max-w-[75%]">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl bg-muted/50 hover:bg-muted/80 w-12 h-12 flex-shrink-0">
            <ChevronLeft className="h-6 w-6 text-primary" />
          </Button>
        )}
        {!showBack && <div className="p-2.5 bg-primary/10 rounded-2xl flex-shrink-0"><Rainbow className="h-7 w-7 text-primary" /></div>}
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg md:text-2xl font-black text-primary uppercase tracking-tighter leading-tight truncate">{title}</h1>
          <div className="flex gap-4 mt-1 flex-wrap">
            {showBackToChildren && (
              <button onClick={() => router.push('/children')} className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase hover:text-primary transition-colors tracking-widest whitespace-nowrap">
                <Users className="w-3.5 h-3.5" /> Mis Niños
              </button>
            )}
            {showBackToDashboard && childId && (
              <button onClick={() => router.push(`/child/${childId}/dashboard`)} className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase hover:text-primary transition-colors tracking-widest whitespace-nowrap">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
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
  <div className="flex gap-1.5">
    {[...Array(max)].map((_, i) => (
      <Star key={i} className={cn("w-5 h-5", i < rating ? "fill-accent text-accent" : "text-muted fill-muted opacity-40")} />
    ))}
  </div>
);

export const ProgressBar = ({ value, color = "bg-secondary" }: { value: number, color?: string }) => (
  <div className="w-full bg-muted rounded-full h-4 overflow-hidden shadow-inner border-2 border-white">
    <div 
      className={cn("h-full transition-all duration-1000 ease-out", color)} 
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
      "px-6 py-3 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest whitespace-nowrap min-h-[48px]",
      selected 
        ? "bg-primary border-primary text-white shadow-lg scale-105" 
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
    }, 8000); 
    return () => clearTimeout(timer);
  }, []);

  if (showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-8 animate-in fade-in duration-500 min-h-[500px]">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center text-destructive border-4 border-destructive/5">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">¿Sigues ahí?</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Parece que la conexión está lenta. Intentemos de nuevo.</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {onRetry && (
            <AppButton onClick={() => { setShowTimeout(false); onRetry(); }} className="w-full bg-secondary text-secondary-foreground h-16">
              <RefreshCcw className="w-5 h-5 mr-2" /> Reintentar
            </AppButton>
          )}
          <AppButton onClick={() => router.push('/children')} variant="outline" className="w-full h-14">
            <Users className="w-5 h-5 mr-2" /> Volver a Mis Niños
          </AppButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6 min-h-[500px]">
      <div className="relative">
        <div className="w-20 h-20 bg-primary/5 rounded-full animate-ping absolute inset-0" />
        <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-[12px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">{message}</p>
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
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 bg-muted/20 rounded-[3.5rem] border-4 border-dashed border-muted/50">
    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-inner">
      <Inbox className="w-12 h-12 text-muted-foreground opacity-30" />
    </div>
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">{title}</h3>
      <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">{description}</p>
    </div>
    {actionLabel && onAction && (
      <AppButton onClick={onAction} className="px-10 h-16 text-sm">{actionLabel}</AppButton>
    )}
  </div>
);
