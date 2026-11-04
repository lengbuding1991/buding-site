import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAuthed()) redirect('/admin');
  return <LoginForm />;
}
