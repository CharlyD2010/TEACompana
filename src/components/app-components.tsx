
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const AppButton = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button className={cn("rounded-full font-bold transition-all active:scale-95 shadow-sm", className)} {...props} />
);

export const AppInput = ({ className, ...props }: React.ComponentProps<typeof Input>) => (
  <Input className={cn("rounded-xl border-2 focus-visible:ring-primary h-12", className)} {...props} />
);

export const AppCard = ({ className, ...props }: React.ComponentProps<typeof Card>) => (
  <Card className={cn("rounded-3xl border-none shadow-md overflow-hidden", className)} {...props} />
);

export const AppHeader = ({ title, showBack = true, children }: { title: string, showBack?: boolean, children?: React.ReactNode }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-6 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
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
      "px-4 py-2 rounded-full border-2 transition-all font-medium",
      selected 
        ? "bg-primary border-primary text-white shadow-md" 
        : "bg-white border-muted text-muted-foreground hover:border-primary/50"
    )}
  >
    {label}
  </button>
);
