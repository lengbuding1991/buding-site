'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/* 顶栏：主题切换 + 语言切换。主题存在 localStorage，切换时立刻写 data-theme。 */
export default function Topbar({ nav, langLabel, langHref, toLight, toDark, brand }) {
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem('theme-a'); } catch (e) {}
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    else setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme-a', next); } catch (e) {}
  }

  // 当前语言的首屏地址：文章页上点导航要跳回首页对应区块，而不是留在原地
  const home = pathname && pathname.startsWith('/en') ? '/en' : '/';
  const onHome = pathname === '/' || pathname === '/en';
  const anchor = (href) => (onHome ? href : `${home}${href}`);

  // 语言切换时保留锚点，避免从文章页回来丢掉位置
  const [hash, setHash] = useState('');
  useEffect(() => { setHash(window.location.hash); }, [pathname]);

  return (
    <>
      <header className="topbar">
        <a className="brand" href={hash && onHome ? `${home}${hash}` : home}>
          <span className="mark" aria-hidden="true" />
          <span>{brand}</span>
        </a>

        <nav className="nav" aria-label="主导航">
          {nav.map((item) => (
            <a key={item.href} href={anchor(item.href)}>{item.label}</a>
          ))}
        </nav>

        <div className="top-actions">
          <a className="toggle" href={langHref} hrefLang={langHref === '/en' ? 'en' : 'zh-CN'} aria-label={langLabel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18" />
            </svg>
            <span>{langLabel}</span>
          </a>

          <button className="toggle" id="themeBtn" type="button" onClick={toggle} aria-label={theme === 'dark' ? toLight : toDark}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
              </svg>
            )}
            <span>{theme === 'dark' ? toLight : toDark}</span>
          </button>
        </div>
      </header>

      {/* 手机上顶栏放不下导航，改成底部一行，单手也能点到 */}
      <nav className="mnav" aria-label="主导航">
        {nav.map((item) => (
          <a key={item.href} href={anchor(item.href)}>{item.label}</a>
        ))}
      </nav>
    </>
  );
}
