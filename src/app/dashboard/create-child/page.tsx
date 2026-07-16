import { redirect } from 'next/navigation';

export default function CreateChildRedirect() {
  redirect('/children/create');
}
