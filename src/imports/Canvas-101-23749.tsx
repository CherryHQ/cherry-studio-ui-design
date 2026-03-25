import svgPaths from "./svg-apbze9ozx5";
import imgCanvas from "figma:asset/b97552f8a702df95836ea23dade41d6d65434941.png";

function Attribution() {
  return (
    <div className="absolute bottom-0 content-stretch flex items-center justify-center pb-[32px] pl-[2px] pr-[32px] pt-[3px] right-0" data-name="_attribution">
      <p className="font-['Geist:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#737373] text-[10px]">聊天历史</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[12px]" data-name="_canvas-zoomIn-icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <path d={svgPaths.p1fdf0b80} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[12px]" data-name="_canvas-zoomOut-icon">
        <div className="absolute inset-[42.17%_0_44.75%_0]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 1.57">
            <path d="M0 0H12V1.57H0V0Z" fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[12px]" data-name="_canvas-fitView-icon">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[11.077px] left-1/2 top-1/2 w-[12px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 11.0768">
            <path d={svgPaths.p2d103880} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="icon">
      <div className="overflow-clip relative shrink-0 size-[12px]" data-name="_canvas-interactive-unlocked-icon">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[12px] left-1/2 top-1/2 w-[9.143px]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.14288 12">
            <path d={svgPaths.p76dd200} fill="var(--fill-0, white)" fillOpacity="0.9" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Panel() {
  return (
    <div className="bg-[#151514] relative rounded-[8px] shrink-0" data-name="Panel">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-px items-start justify-center overflow-clip p-[5px] relative rounded-[inherit]">
        <div className="bg-[rgba(255,255,255,0)] relative rounded-[8px] shrink-0 size-[26px]" data-name="ZoomIn">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[10px] py-[8px] relative rounded-[inherit] size-full">
            <Icon />
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0)] relative rounded-[8px] shrink-0 size-[26px]" data-name="ZoomOut">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[10px] py-[8px] relative rounded-[inherit] size-full">
            <Icon1 />
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0)] relative rounded-[8px] shrink-0 size-[26px]" data-name="FitView">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[10px] py-[8px] relative rounded-[inherit] size-full">
            <Icon2 />
          </div>
        </div>
        <button className="bg-[rgba(255,255,255,0)] cursor-pointer relative rounded-[8px] shrink-0 size-[26px]" data-name="Interactive">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center overflow-clip px-[10px] py-[8px] relative rounded-[inherit] size-full">
            <Icon3 />
          </div>
        </button>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Panel1() {
  return (
    <div className="bg-black relative rounded-[8px] shrink-0" data-name="Panel">
      <div className="content-stretch flex gap-[4px] items-center overflow-clip p-[5px] relative rounded-[inherit]">
        <div className="bg-black relative rounded-[8px] shrink-0" data-name="Text">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] py-[8px] relative">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.9)]">全部展开</p>
          </div>
        </div>
        <div className="bg-[#151514] relative rounded-[8px] shrink-0" data-name="Text">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[12px] py-[8px] relative">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[14px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.9)]">全部折叠</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function TopLeft() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 p-[16px] top-0" data-name="top-left">
      <Panel1 />
    </div>
  );
}

function Elements() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements1() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements2() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements3() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements4() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements5() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements6() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements7() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements8() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements9() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements10() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements11() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[31px] inline-grid ml-[280px] mt-[calc(50%-4.5px)] place-items-start relative row-1 w-[100.279px]">
      <div className="col-1 flex h-[19px] items-center justify-center ml-[12px] mt-0 relative row-1 w-[95.28px]">
        <div className="-rotate-90 flex-none h-[95.28px] w-[19px]">
          <div className="relative size-full" data-name="Line / Dashed">
            <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
              <div className="absolute bottom-full left-0 right-0 top-[-16.79%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 2">
                  <line id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="18" y1="1" y2="12.9099" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[5px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Tale">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.738px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.46px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.744px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.65px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.736px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.46px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.746px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.47px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.736px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.64px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid ml-0 mt-[25px] place-items-start relative row-1 w-[166.734px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.63px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Group4 />
      <div className="col-1 flex h-[11px] items-center justify-center ml-[290px] mt-[13px] relative row-1 w-[95.28px]">
        <div className="flex-none h-[95.28px] rotate-90 w-[11px]">
          <div className="relative size-full" data-name="Line / Dashed">
            <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
              <div className="absolute bottom-full left-0 right-0 top-[-16.79%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                  <line id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="12.9099" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[285px] mt-[17px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Cap / Diamond">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
              <div className="flex-none rotate-45">
                <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[285px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[95.28px] relative w-[16px]" data-name="Tale">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Group2 />
      <Group />
      <Group3 />
      <Group6 />
      <Group1 />
      <Group7 />
    </div>
  );
}

function Elements12() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements13() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements14() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements15() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements16() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements17() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements18() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Model1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Model">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[84px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements12 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[85px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements13 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[84px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements14 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[85px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements15 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[85px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements16 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[84px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements17 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[85px]" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements18 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[32px] inline-grid leading-[0] ml-[278px] mt-[calc(50%-5px)] place-items-start relative row-1 w-[100.279px]">
      <div className="col-1 flex h-[19px] items-center justify-center ml-[13px] mt-0 relative row-1 w-[95.28px]">
        <div className="-rotate-90 flex-none h-[95.28px] w-[19px]">
          <div className="relative size-full" data-name="Line / Dashed">
            <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
              <div className="absolute bottom-full left-0 right-0 top-[-16.79%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 2">
                  <line id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="18" y1="1" y2="12.9099" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[5px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Tale">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineDashed() {
  return (
    <div className="relative size-full" data-name="Line / Dashed">
      <div className="absolute inset-[55.2%_9.09%_44.8%_-100%]" data-name="Line">
        <div className="absolute inset-[-1px_-4.76%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 2.00195">
            <path d="M1 1.00195L22 1" id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Tale() {
  return (
    <div className="h-[95px] relative w-[14px]" data-name="Tale">
      <div className="absolute inset-[0_-5.66%_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.7928 95">
          <g id="Tale">
            <path d={svgPaths.p2440ca70} fill="var(--fill-0, #27272A)" id="Line Arrow" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.736px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.46px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group11() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.742px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.64px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.736px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.46px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.746px]">
      <div className="col-1 h-[16px] ml-0 mt-0 relative row-1 w-[119.099px]" data-name="Curve / Dashed">
        <div className="absolute flex inset-0 items-center justify-center">
          <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
            <div className="relative size-full" data-name="Line">
              <div className="absolute inset-[-0.84%_-6.25%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                  <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-[71.47px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head B">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group14() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.736px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.64px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group15() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] h-[24px] inline-grid leading-[0] ml-0 mt-[25px] place-items-start relative row-1 w-[166.734px]">
      <div className="col-1 flex h-[16px] items-center justify-center ml-0 mt-[47.63px] relative row-1 w-[119.099px]">
        <div className="-scale-y-100 flex-none h-[16px] rotate-180 w-[119.099px]">
          <div className="relative size-full" data-name="Curve / Dashed">
            <div className="absolute flex inset-0 items-center justify-center">
              <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                <div className="relative size-full" data-name="Line">
                  <div className="absolute inset-[-0.84%_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 121.099">
                      <path d={svgPaths.p32df0880} id="Line" stroke="var(--stroke-0, #27272A)" strokeDasharray="3 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[8px] mt-0 relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-scale-y-100 flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Head A">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative">
      <Group9 />
      <div className="col-1 flex h-[11px] items-center justify-center ml-[288px] mt-[13px] relative row-1 w-[95.28px]">
        <div className="flex-none h-[95.28px] rotate-90 w-[11px]">
          <LineDashed />
        </div>
      </div>
      <div className="col-1 flex h-[16px] items-center justify-center ml-[284px] mt-[17px] relative row-1 w-[95.28px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[95.28px] relative w-[16px]" data-name="Cap / Diamond">
            <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
              <div className="flex-none rotate-45">
                <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-1 flex h-[14px] items-center justify-center ml-[283.5px] mt-0 relative row-1 w-[95px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Tale />
        </div>
      </div>
      <Group10 />
      <Group11 />
      <Group12 />
      <Group13 />
      <Group14 />
      <Group15 />
    </div>
  );
}

function Model() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-[661.002px]" data-name="model">
      <Group5 />
      <Model1 />
      <div className="flex items-center justify-center leading-[0] relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <Group8 />
        </div>
      </div>
    </div>
  );
}

function Elements19() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements20() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements21() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements22() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements23() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements24() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements25() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements26() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements24 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements25 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements26 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Elements27() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements28() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements29() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements30() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements31() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements31 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Elements32() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements33() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements34() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements35() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements36() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements37() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements38() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements36 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements37 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements38 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Elements39() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements40() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements41() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements42() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements43() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements43 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Elements44() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements45() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.62%_-8.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.8333 12.8333">
          <g>
            <path d={svgPaths.p2bfb51f0} id="Vector" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3c1fdd00} id="Vector_2" stroke="var(--stroke-0, #9ED64A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elements46() {
  return (
    <div className="relative size-full" data-name="elements">
      <div className="absolute inset-[-6.27%_-6.26%_-6.25%_-6.25%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5015 13.5015">
          <g>
            <path d={svgPaths.p2e51c300} id="Vector" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p20dfeb80} id="Vector_2" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p3e95fc80} id="Vector_3" stroke="var(--stroke-0, #6366F1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements44 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements45 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements46 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fork4() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0" data-name="fork">
      <Frame7 />
      <Frame8 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements39 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements40 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements41 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements42 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[89px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "114" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[89px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[16px] top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-px flex items-center justify-center right-0 top-[11px] w-[16px]">
              <div className="-rotate-90 flex-none h-[16px] w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[11px] flex items-center justify-center right-0 top-px w-[16px]">
              <div className="-scale-y-100 flex-none h-[16px] rotate-90 w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[8px] size-[16px] top-1/2" data-name="Cap / Diamond">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-45">
                  <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-7px] flex items-center justify-center right-[-8px] size-[16px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head B">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex items-center justify-center right-[-8px] size-[16px] top-[-7px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head A">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Fork4 />
    </div>
  );
}

function Fork3() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0" data-name="fork">
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements32 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements33 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements34 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements35 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[89px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "114" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[89px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[16px] top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-px flex items-center justify-center right-0 top-[11px] w-[16px]">
              <div className="-rotate-90 flex-none h-[16px] w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[11px] flex items-center justify-center right-0 top-px w-[16px]">
              <div className="-scale-y-100 flex-none h-[16px] rotate-90 w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[8px] size-[16px] top-1/2" data-name="Cap / Diamond">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-45">
                  <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-7px] flex items-center justify-center right-[-8px] size-[16px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head B">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex items-center justify-center right-[-8px] size-[16px] top-[-7px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head A">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Fork3 />
    </div>
  );
}

function Fork2() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0" data-name="fork">
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements27 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements28 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements29 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements30 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[89px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "114" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[89px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[16px] top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-px flex items-center justify-center right-0 top-[11px] w-[16px]">
              <div className="-rotate-90 flex-none h-[16px] w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[11px] flex items-center justify-center right-0 top-px w-[16px]">
              <div className="-scale-y-100 flex-none h-[16px] rotate-90 w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[8px] size-[16px] top-1/2" data-name="Cap / Diamond">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-45">
                  <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-7px] flex items-center justify-center right-[-8px] size-[16px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head B">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex items-center justify-center right-[-8px] size-[16px] top-[-7px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head A">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Fork2 />
    </div>
  );
}

function Fork1() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0" data-name="fork">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[84px]">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements10 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements11 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <Model />
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements19 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements20 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements21 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements22 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements23 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[89px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "114" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[89px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[16px] top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-px flex items-center justify-center right-0 top-[11px] w-[16px]">
              <div className="-rotate-90 flex-none h-[16px] w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[11px] flex items-center justify-center right-0 top-px w-[16px]">
              <div className="-scale-y-100 flex-none h-[16px] rotate-90 w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[8px] size-[16px] top-1/2" data-name="Cap / Diamond">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-45">
                  <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-7px] flex items-center justify-center right-[-8px] size-[16px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head B">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex items-center justify-center right-[-8px] size-[16px] top-[-7px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head A">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Fork1 />
    </div>
  );
}

function Fork() {
  return (
    <div className="content-stretch flex gap-[16px] items-start justify-center relative shrink-0" data-name="fork">
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements9 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <Frame />
    </div>
  );
}

function Flow() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-center left-[294px] top-[58px]" data-name="flow">
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements1 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements2 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements3 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements4 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements5 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements6 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Card">
        <div className="bg-[rgba(99,102,241,0.1)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user-star-01">
            <div className="absolute flex inset-[12.5%] items-center justify-center">
              <div className="-scale-y-100 flex-none size-[18px]">
                <Elements7 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#6366f1] text-[12px]">助手</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[32px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="h-[32px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-0 top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="26" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[-8px] size-[16px] top-1/2" data-name="Head">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                  <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Card">
        <div className="bg-[rgba(158,214,74,0.2)] content-stretch flex gap-[4px] items-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" data-name="Chat History1">
          <div className="relative shrink-0 size-[16px]" data-name="user">
            <div className="absolute flex inset-[14.58%_20.83%] items-center justify-center">
              <div className="-scale-y-100 flex-none h-[17px] w-[14px]">
                <Elements8 />
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Text">
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9ed64a] text-[12px]">用户</p>
          </div>
        </div>
      </div>
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[89px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "114" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-[89px] relative w-[27px]" data-name="Flow">
            <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[16px] top-1/2" data-name="Path">
              <div className="absolute inset-[56.25%_0_31.25%_0]" data-name="Line">
                <div className="absolute bottom-full left-0 right-0 top-[-100%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                    <line id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="1" x2="10" y1="1" y2="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-px flex items-center justify-center right-0 top-[11px] w-[16px]">
              <div className="-rotate-90 flex-none h-[16px] w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[11px] flex items-center justify-center right-0 top-px w-[16px]">
              <div className="-scale-y-100 flex-none h-[16px] rotate-90 w-[20px]">
                <div className="relative size-full" data-name="Curve">
                  <div className="absolute flex inset-0 items-center justify-center">
                    <div className="-scale-y-100 flex-none rotate-90 size-[16px]">
                      <div className="relative size-full" data-name="Line">
                        <div className="absolute inset-[-1.3%_-6.25%]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 79">
                            <path d={svgPaths.p3b5d9f40} id="Line" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute right-[8px] size-[16px] top-1/2" data-name="Cap / Diamond">
              <div className="-translate-x-1/2 -translate-y-1/2 absolute flex items-center justify-center left-1/2 size-[9.998px] top-1/2" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-45">
                  <div className="bg-[#27272a] border-2 border-[#27272a] border-solid rounded-[1px] size-[7.07px]" data-name="Square" />
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-8px] size-[16px] top-1/2">
              <div className="flex-none rotate-180">
                <div className="relative size-[16px]" data-name="Tale">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[6px] top-1/2" data-name="Circle">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
                      <path d={svgPaths.p39fa200} id="Circle" stroke="var(--stroke-0, #27272A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[-7px] flex items-center justify-center right-[-8px] size-[16px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head B">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute flex items-center justify-center right-[-8px] size-[16px] top-[-7px]">
              <div className="-scale-y-100 flex-none">
                <div className="relative size-[16px]" data-name="Head A">
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.1px)] top-1/2 w-[5.793px]" data-name="Line Arrow">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.79274 9.99985">
                      <path d={svgPaths.pe698280} fill="var(--fill-0, #27272A)" id="Line Arrow" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Fork />
    </div>
  );
}

export default function Canvas() {
  return (
    <div className="bg-size-[10px_10px,auto_auto] bg-top-left relative rounded-[16px] size-full" data-name="Canvas" style={{ backgroundImage: `url('${imgCanvas}'), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)` }}>
      <div className="content-stretch flex flex-col items-end justify-center overflow-clip p-[50px] relative rounded-[inherit] size-full">
        <Attribution />
        <div className="absolute bottom-0 content-stretch flex flex-col items-start justify-center left-0 overflow-clip p-[16px]" data-name="Controls">
          <Panel />
        </div>
        <TopLeft />
        <Flow />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-[-1px] pointer-events-none rounded-[17px]" />
    </div>
  );
}