
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, ChevronLeft, Loader2, Inbox, Rainbow, LayoutDashboard, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const AppLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg rotate-3 relative overflow-hidden group">
      <Rainbow className="w-10 h-10 text-white animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
    </div>
  </div>
);

export const AppButton = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button className={cn("rounded-full font-bold transition-all active:scale-95 shadow-sm", className)} {...props} />
);

export const AppInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input className={cn("rounded-xl border-2 focus-visible:ring-primary h-12", className)} {...props} />
);

export const AppCard = ({ className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card className={cn("rounded-3xl border-none shadow-md overflow-hidden", className)} {...props} />
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
    <div className="flex items-center justify-between p-6 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        {!showBack && <Rainbow className="h-6 w-6 text-primary" />}
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-primary uppercase tracking-tight leading-none">{title}</h1>
          <div className="flex gap-2 mt-1">
            {showBackToChildren && (
              <button onClick={() => router.push('/children')} className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors">
                <Users className="w-2.5 h-2.5" /> Mis Niños
              </button>
            )}
            {showBackToDashboard && childId && (
              <button onClick={() => router.push(`/child/${childId}/dashboard`)} className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors">
                <LayoutDashboard className="w-2.5 h-2.5" /> Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export const StarRating = ({ rating, max = 5 }: { rating: number, max?: number }) => (
  <div className="flex gap-1">
    {[...Array(max)].map((_, i) => (
      <Star key={i} className={cn("w-5 h-5", i < rating ? "fill-accent text-accent" : "text-muted fill-muted")} />
    ))}
  </div>
);

export const ProgressBar = ({ value, color = "bg-secondary" }: { value: number, color?: string }) => (
  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
    <div 
      className={cn("h-full transition-all duration-500", color)} 
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
      "px-4 py-2 rounded-full border-2 transition-all font-bold text-xs uppercase",
      selected 
        ? "bg-primary border-primary text-white shadow-md" 
        : "bg-white border-muted text-muted-foreground hover:border-primary/50"
    )}
  >
    {label}
  </button>
);

export const LoadingState = ({ message = "Cargando información..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <p className="text-sm font-bold text-muted-foreground uppercase">{message}</p>
  </div>
);

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
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
      <Inbox className="w-10 h-10 text-muted-foreground" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-primary uppercase">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {actionLabel && onAction && (
      <AppButton onClick={onAction}>{actionLabel}</AppButton>
    )}
  </div>
);
