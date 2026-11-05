'use client';

import { useEffect } from 'react';

/* 全站的行为层：
   1. 滚动揭示（一次短淡入，不做飞入）
   2. 背景里那片跟着光标走的光（触屏不启用）
   主题与语言切换在 Topbar 里。 */
export default function Behaviors() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    /* 光标光斑：只在真有指针的设备上跑，且用 rAF 节流 */
    let spot = null;
    let raf = 0;
    let px = 0, py = 0;
    if (!reduce && !coarse) {
      spot = document.querySelector('.bd-spot');
      if (spot) {
        const move = (e) => {
          px = e.clientX; py = e.clientY;
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            spot.style.setProperty('--mx', `${px}px`);
            spot.style.setProperty('--my', `${py}px`);
            spot.classList.add('on');
          });
        };
        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerleave', () => spot.classList.remove('on'));
      }
    }

    const targets = document.querySelectorAll(
      '.sec-head, .work-item, .tl-row, .about-grid > *, .post-row'
    );
    targets.forEach((el) => el.classList.add('reveal'));

    if (reduce) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    targets.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
