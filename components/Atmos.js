/* 氛围层：固定的透视网格地平线、环境光、扫描线、颗粒。
   纯装饰，aria-hidden。 */
export default function Atmos() {
  return (
    <>
      <div className="atmos" aria-hidden="true">
        <div className="glow" />
        <div className="floor-wrap">
          <div className="floor" />
        </div>
        <div className="cursor-glow" id="cglow" />
        <div className="scan" />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
