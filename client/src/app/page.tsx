import { apiFetch } from '@/lib/api';

export default async function Home() {
  const health = await apiFetch('/health');
  console.log(health);
  return <div>Check your terminal</div>;
}