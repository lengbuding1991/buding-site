/* 背景层：一张当作图纸用的纸。
   三样东西叠起来 —— 细网格（24px）、粗网格（120px）、顶部天光。
   网格向边缘渐隐，只在首屏那一带最清楚，往下越读越干净。
   另外四条角标，像图纸的裁切mark。全部 aria-hidden，不参与读屏。 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="bd-grid" />
      <div className="bd-glow" />
      <div className="bd-spot" />
      <span className="bd-mark bd-mark--tl" />
      <span className="bd-mark bd-mark--tr" />
      <span className="bd-mark bd-mark--bl" />
      <span className="bd-mark bd-mark--br" />
    </div>
  );
}
