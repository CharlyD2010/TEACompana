import { redirect } from 'next/navigation';

export default async function ChildGamePlayRedirect({ params }: { params: Promise<{ id: string, gameId: string }> }) {
  const { id, gameId } = await params;
  redirect(`/child/${id}/game/${gameId}`);
}
