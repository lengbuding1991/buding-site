import './admin.css';

export const metadata = {
  title: '后台 · 冷丶布丁',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <div className="admin-body">{children}</div>
    </>
  );
}
