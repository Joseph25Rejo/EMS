import { redirect } from 'next/navigation';

export default function SchedulesRedirect() {
  redirect('/admin/schedule');
  return null;
}
