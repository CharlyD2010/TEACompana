import { redirect } from 'next/navigation';

export default async function ChildGamesRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/child/${id}/activities`);
}
