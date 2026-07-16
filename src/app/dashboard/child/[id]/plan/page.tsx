import { redirect } from 'next/navigation';

export default async function ChildPlanRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/child/${id}/learning-plan`);
}
