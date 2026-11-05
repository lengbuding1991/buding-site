import { t } from '@/lib/content';

export const metadata = { title: '404' };

export default function NotFound() {
  const c = t('zh').notFound;
  return (
    <main className="state-page">
      <div>
        <p className="code">{c.code}</p>
        <h1>{c.title}</h1>
        <p>{c.desc}</p>
        <a className="btn btn--solid" href="/">{c.back} <span aria-hidden="true">→</span></a>
      </div>
    </main>
  );
}
