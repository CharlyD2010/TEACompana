'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader, AppCard, AppButton, LoadingState } from '@/components/app-components';
import { useDoc, useFirestore, useCollection, useUser } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Send, LayoutDashboard, Users, User, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ObservationsChatPage() {
  const { childId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && db) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user, db]);

  const childRef = useMemo(() => db && childId ? doc(db, 'children', childId as string) : null, [db, childId]);
  const { data: child, loading: childLoading } = useDoc(childRef);

  const messagesQuery = useMemo(() => db && childId ? query(
    collection(db, 'children', childId as string, 'messages'),
    orderBy('createdAt', 'asc')
  ) : null, [db, childId]);

  const { data: messages, loading: messagesLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !db || !user || !userData) return;
    setSending(true);
    try {
      const msgsRef = collection(db, 'children', childId as string, 'messages');
      await addDoc(msgsRef, {
        childId,
        senderId: user.uid,
        senderName: userData.fullName || 'Usuario',
        senderRole: userData.role,
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setMessage('');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el mensaje." });
    } finally {
      setSending(false);
    }
  };

  if (childLoading || messagesLoading) return <LoadingState />;

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader 
        title={`Chat: ${child?.name}`} 
        showBackToDashboard={true} 
        showBackToChildren={true}
        childId={childId as string}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4" ref={scrollRef}>
        {!messages || messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Aún no hay mensajes sobre {child?.name}</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[85%] md:max-w-[70%] space-y-1",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-2 px-2">
                  <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">
                    {msg.senderName} • {msg.senderRole === 'teacher' ? 'DOCENTE' : 'PADRE'}
                  </span>
                </div>
                <div 
                  className={cn(
                    "p-4 rounded-[2rem] text-sm font-medium shadow-sm",
                    isMe 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white text-foreground rounded-tl-none"
                  )}
                >
                  {msg.message}
                </div>
                <div className="px-2 flex items-center gap-1 opacity-50">
                  <Clock className="w-2 h-2" />
                  <span className="text-[7px] font-black uppercase">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-muted/50 safe-area-bottom">
        <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
          <input 
            type="text" 
            placeholder="Escribe un mensaje..."
            className="flex-1 h-14 bg-muted/30 rounded-2xl px-6 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending}
          />
          <AppButton 
            type="submit" 
            className="w-14 h-14 p-0 rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
            disabled={sending || !message.trim()}
          >
            <Send className="w-5 h-5" />
          </AppButton>
        </form>
        
        <div className="mt-4 flex flex-col md:flex-row gap-3 justify-center">
          <button 
            onClick={() => router.push(`/child/${childId}/dashboard`)}
            className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors py-2"
          >
            <LayoutDashboard className="w-3 h-3" /> Dashboard
          </button>
          <button 
            onClick={() => router.push('/children')}
            className="flex items-center justify-center gap-2 text-[9px] font-black text-muted-foreground uppercase hover:text-primary transition-colors py-2"
          >
            <Users className="w-3 h-3" /> Mis Niños
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
