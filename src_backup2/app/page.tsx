import { redirect } from 'next/navigation';

// Forwards landing pointer directly into identity verification check points
export default function CorePage() {
  redirect('/login');
}