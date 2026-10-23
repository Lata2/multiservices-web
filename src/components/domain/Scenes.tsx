import { useId, type CSSProperties, type ReactNode } from 'react';
import type { SceneKey } from '@/constants/visuals';
import { cn, type Hue } from '../ui';

/**
 * Illustrated scenes — flat, self-contained "photos" of each service, drawn in SVG and
 * coloured entirely from theme tokens (`--color-<hue>-*`), so they follow the palette
 * in `src/styles/index.css`. 400×300 viewBox; scale with the box you give them.
 *
 * Shapes reference local CSS variables:
 *   --h50 … --h800  the scene hue
 *   --ac*           accent (warm highlights)
 */
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800] as const;

function hueVars(hue: Hue): CSSProperties {
  const v: Record<string, string> = {};
  SHADES.forEach((s) => (v[`--h${s}`] = `var(--color-${hue}-${s})`));
  return v as CSSProperties;
}

const H = (s: (typeof SHADES)[number]) => `var(--h${s})`;
const A = (s: number) => `var(--color-accent-${s})`;
const N = (s: number) => `var(--color-neutral-${s})`;
const G = (s: number) => `var(--color-success-${s})`;
const I = (s: number) => `var(--color-info-${s})`;
const R = (s: number) => `var(--color-danger-${s})`;

/* ───────── shared props ───────── */

function Sparkle({ x, y, s = 1, fill = A(400) }: { x: number; y: number; s?: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} fill={fill} d="M0-10C1.4-2.4 2.4-1.4 10 0 2.4 1.4 1.4 2.4 0 10-1.4 2.4-2.4 1.4-10 0-2.4-1.4-1.4-2.4 0-10Z" />;
}

function Window({ x, y, w = 110, h = 100 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={I(100)} />
      <circle cx={x + w * 0.72} cy={y + h * 0.32} r={h * 0.14} fill={A(300)} />
      <path d={`M${x} ${y + h * 0.78} q${w * 0.25} -${h * 0.2} ${w * 0.5} 0 t${w * 0.5} 0 V${y + h} H${x}Z`} fill={G(200)} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke="#fff" strokeWidth={7} />
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke="#fff" strokeWidth={5} />
      <rect x={x - 8} y={y + h - 2} width={w + 16} height={8} rx={4} fill={H(200)} />
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-14} cy={-48} rx={10} ry={26} transform="rotate(-28 -14 -48)" fill={G(400)} />
      <ellipse cx={14} cy={-50} rx={10} ry={26} transform="rotate(26 14 -50)" fill={G(500)} />
      <ellipse cx={0} cy={-62} rx={9} ry={28} fill={G(400)} />
      <path d="M-22-24h44l-6 36h-32Z" fill={A(500)} />
      <rect x={-24} y={-28} width={48} height={8} rx={4} fill={A(600)} />
    </g>
  );
}

function Room({ id, floor = H(100), children }: { id: string; floor?: string; children: ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={H(50)} />
        </linearGradient>
        <filter id={`${id}-sh`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor={N(900)} floodOpacity="0.12" />
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-wall)`} />
      <circle cx="330" cy="40" r="120" fill={H(100)} opacity="0.55" />
      <rect y="228" width="400" height="72" fill={floor} />
      <rect y="224" width="400" height="6" fill={H(200)} />
      {children}
    </>
  );
}

/* ───────── scenes ───────── */

function Clean({ id }: { id: string }) {
  return (
    <Room id={id}>
      <Window x={34} y={42} />
      <g filter={`url(#${id}-sh)`}>
        <rect x={160} y={140} width={180} height={56} rx={20} fill={H(500)} />
        <rect x={148} y={182} width={204} height={40} rx={16} fill={H(600)} />
        <rect x={136} y={164} width={34} height={60} rx={14} fill={H(600)} />
        <rect x={330} y={164} width={34} height={60} rx={14} fill={H(600)} />
        <rect x={178} y={152} width={58} height={36} rx={12} fill={H(300)} />
        <rect x={262} y={152} width={58} height={36} rx={12} fill={A(300)} />
      </g>
      <rect x={156} y={222} width={10} height={12} rx={3} fill={H(800)} />
      <rect x={336} y={222} width={10} height={12} rx={3} fill={H(800)} />
      <Plant x={378} y={226} s={0.85} />
      {/* bucket + spray */}
      <path d="M56 196h62l-7 40H63Z" fill={I(400)} />
      <rect x={52} y={190} width={70} height={10} rx={5} fill={I(500)} />
      <circle cx={70} cy={184} r={9} fill="#fff" stroke={I(200)} strokeWidth={2} />
      <circle cx={88} cy={178} r={12} fill="#fff" stroke={I(200)} strokeWidth={2} />
      <circle cx={106} cy={185} r={8} fill="#fff" stroke={I(200)} strokeWidth={2} />
      <rect x={126} y={202} width={18} height={34} rx={6} fill={G(400)} />
      <path d="M128 202v-10h14l8 6v4Z" fill={N(700)} />
      <Sparkle x={246} y={100} s={1.4} />
      <Sparkle x={292} y={118} s={0.8} />
      <Sparkle x={214} y={122} s={0.7} fill={H(300)} />
    </Room>
  );
}

function Ac({ id }: { id: string }) {
  return (
    <Room id={id}>
      <g filter={`url(#${id}-sh)`}>
        <rect x={104} y={50} width={232} height={72} rx={18} fill="#fff" />
      </g>
      <rect x={124} y={100} width={192} height={6} rx={3} fill={H(100)} />
      <rect x={124} y={110} width={192} height={4} rx={2} fill={H(200)} />
      <rect x={280} y={64} width={38} height={20} rx={6} fill={H(600)} />
      <text x={299} y={79} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">18°</text>
      <circle cx={126} cy={72} r={4} fill={G(400)} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${150 + i * 50} 132 q14 16 0 32 t0 32`} fill="none" stroke={H(300)} strokeWidth={5} strokeLinecap="round" opacity={0.85 - i * 0.15} />
      ))}
      {[
        [124, 168],
        [330, 150],
        [354, 196],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`} stroke={H(400)} strokeWidth={3} strokeLinecap="round">
          <path d="M0-9V9M-8-4.5 8 4.5M-8 4.5 8-4.5" />
        </g>
      ))}
      {/* armchair */}
      <g filter={`url(#${id}-sh)`}>
        <rect x={234} y={162} width={104} height={50} rx={18} fill={A(400)} />
        <rect x={224} y={190} width={124} height={34} rx={14} fill={A(500)} />
      </g>
      <rect x={232} y={222} width={9} height={12} rx={3} fill={A(800)} />
      <rect x={330} y={222} width={9} height={12} rx={3} fill={A(800)} />
      <Plant x={60} y={226} />
      {/* thermometer */}
      <rect x={30} y={60} width={16} height={60} rx={8} fill="#fff" stroke={H(200)} strokeWidth={3} />
      <rect x={35} y={90} width={6} height={26} rx={3} fill={H(500)} />
      <circle cx={38} cy={120} r={9} fill={H(500)} />
    </Room>
  );
}

function Repair({ id }: { id: string }) {
  return (
    <Room id={id}>
      {/* hanging bulb */}
      <path d="M128 0v62" stroke={N(700)} strokeWidth={3} />
      <circle cx={128} cy={96} r={46} fill={A(100)} opacity={0.8} />
      <rect x={118} y={60} width={20} height={16} rx={4} fill={N(600)} />
      <circle cx={128} cy={94} r={22} fill={A(300)} />
      <path d="M121 92q7 10 14 0" fill="none" stroke={A(600)} strokeWidth={2.5} strokeLinecap="round" />
      {/* socket */}
      <rect x={42} y={150} width={40} height={40} rx={9} fill="#fff" stroke={H(200)} strokeWidth={3} />
      <circle cx={56} cy={170} r={3.5} fill={N(600)} />
      <circle cx={68} cy={170} r={3.5} fill={N(600)} />
      {/* ladder */}
      <g stroke={H(700)} strokeWidth={7} strokeLinecap="round">
        <path d="M296 62 278 232M340 62l18 170" />
        {[96, 132, 168, 204].map((y) => (
          <path key={y} d={`M${296 - (y - 62) * 0.1} ${y}H${340 + (y - 62) * 0.1}`} strokeWidth={6} />
        ))}
      </g>
      {/* toolbox */}
      <g filter={`url(#${id}-sh)`}>
        <rect x={120} y={176} width={140} height={54} rx={10} fill={A(500)} />
      </g>
      <rect x={120} y={190} width={140} height={8} fill={A(600)} />
      <rect x={180} y={186} width={20} height={16} rx={3} fill={N(700)} />
      <path d="M160 176v-14a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v14" fill="none" stroke={N(700)} strokeWidth={6} />
      <rect x={232} y={136} width={10} height={42} rx={4} fill={H(500)} transform="rotate(14 237 157)" />
      <path d="M142 176l-6-32 10-4 4 8 8-2-2 10 -6 2 4 18Z" fill={N(400)} />
      <Sparkle x={196} y={128} s={0.9} />
    </Room>
  );
}

function Plumbing({ id }: { id: string }) {
  return (
    <Room id={id}>
      <g stroke={H(100)} strokeWidth={2}>
        {[40, 80, 120, 160, 200].map((y) => (
          <path key={y} d={`M0 ${y}H400`} />
        ))}
        {[60, 120, 180, 240, 300, 360].map((x) => (
          <path key={x} d={`M${x} 0V224`} />
        ))}
      </g>
      <rect x={150} y={30} width={100} height={78} rx={39} fill="#fff" stroke={H(200)} strokeWidth={6} />
      <path d="M176 52l20-12M184 70l30-18" stroke={I(100)} strokeWidth={6} strokeLinecap="round" />
      <g filter={`url(#${id}-sh)`}>
        <rect x={112} y={150} width={176} height={78} rx={10} fill={H(500)} />
        <rect x={100} y={138} width={200} height={18} rx={9} fill="#fff" />
      </g>
      <path d="M200 150v74" stroke={H(600)} strokeWidth={3} />
      <circle cx={190} cy={188} r={4} fill={H(200)} />
      <circle cx={210} cy={188} r={4} fill={H(200)} />
      <path d="M196 138v-30a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v8" fill="none" stroke={N(400)} strokeWidth={8} strokeLinecap="round" />
      <path d="M230 124q-5 9 0 14q5-5 0-14Z" fill={I(400)} />
      <path d="M230 142q-4 7 0 10q4-3 0-10Z" fill={I(300)} />
      <rect x={316} y={196} width={64} height={12} rx={6} fill={N(500)} transform="rotate(-28 348 202)" />
      <circle cx={318} cy={218} r={12} fill="none" stroke={N(500)} strokeWidth={8} />
      <path d="M52 176q-14 22 0 32q14-10 0-32Z" fill={I(400)} />
      <path d="M74 196q-8 13 0 19q8-6 0-19Z" fill={I(300)} />
    </Room>
  );
}

function Salon({ id }: { id: string }) {
  return (
    <Room id={id}>
      <ellipse cx={200} cy={98} rx={78} ry={66} fill={H(200)} />
      <ellipse cx={200} cy={98} rx={66} ry={54} fill="#fff" />
      <path d="M160 70l26-18M168 96l50-34" stroke={H(50)} strokeWidth={8} strokeLinecap="round" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (Math.PI * 2 * i) / 10;
        return <circle key={i} cx={200 + Math.cos(a) * 88} cy={98 + Math.sin(a) * 76} r={6} fill={A(200)} />;
      })}
      <g filter={`url(#${id}-sh)`}>
        <rect x={78} y={176} width={244} height={16} rx={8} fill={H(600)} />
      </g>
      <rect x={96} y={190} width={10} height={40} rx={4} fill={H(700)} />
      <rect x={294} y={190} width={10} height={40} rx={4} fill={H(700)} />
      <rect x={112} y={150} width={18} height={26} rx={6} fill={H(300)} />
      <rect x={136} y={140} width={14} height={36} rx={5} fill={A(300)} />
      <rect x={139} y={134} width={8} height={8} rx={2} fill={N(600)} />
      {/* hair dryer */}
      <circle cx={244} cy={150} r={18} fill={H(500)} />
      <circle cx={244} cy={150} r={7} fill={H(200)} />
      <rect x={258} y={142} width={30} height={16} rx={6} fill={H(500)} />
      <rect x={236} y={162} width={14} height={16} rx={5} fill={H(700)} />
      {/* vase */}
      <path d="M296 176c-6-18 2-26 10-26s16 8 10 26Z" fill={H(200)} />
      <path d="M306 150v-26" stroke={G(500)} strokeWidth={3} />
      <circle cx={306} cy={118} r={9} fill={R(300)} />
      <circle cx={294} cy={130} r={7} fill={A(300)} />
      <circle cx={318} cy={128} r={7} fill={H(300)} />
      <Sparkle x={60} y={70} s={1.1} />
      <Sparkle x={344} y={60} s={0.8} fill={H(300)} />
    </Room>
  );
}

function Grooming({ id }: { id: string }) {
  const clip = `${id}-pole`;
  return (
    <Room id={id}>
      <defs>
        <clipPath id={clip}>
          <rect x={44} y={56} width={26} height={120} rx={13} />
        </clipPath>
      </defs>
      <rect x={44} y={56} width={26} height={120} rx={13} fill="#fff" />
      <g clipPath={`url(#${clip})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M30 ${60 + i * 26}l50-30v12l-50 30Z`} fill={i % 2 ? H(500) : R(400)} />
        ))}
      </g>
      <rect x={40} y={46} width={34} height={12} rx={6} fill={N(600)} />
      <rect x={40} y={174} width={34} height={12} rx={6} fill={N(600)} />
      <circle cx={210} cy={92} r={62} fill={H(200)} />
      <circle cx={210} cy={92} r={52} fill="#fff" />
      <path d="M180 74l22-16M186 96l40-30" stroke={H(50)} strokeWidth={8} strokeLinecap="round" />
      {/* chair */}
      <g filter={`url(#${id}-sh)`}>
        <rect x={168} y={146} width={84} height={56} rx={14} fill={N(800)} />
        <rect x={156} y={190} width={108} height={22} rx={10} fill={H(500)} />
      </g>
      <rect x={182} y={154} width={56} height={30} rx={8} fill={H(400)} />
      <rect x={204} y={212} width={12} height={14} fill={N(600)} />
      <rect x={180} y={224} width={60} height={8} rx={4} fill={N(700)} />
      {/* scissors */}
      <g transform="translate(320 150) rotate(-30)" fill="none" stroke={A(500)} strokeWidth={5} strokeLinecap="round">
        <circle cx={-14} cy={26} r={9} />
        <circle cx={14} cy={26} r={9} />
        <path d="M-8 18 10-24M8 18-10-24" stroke={N(500)} />
      </g>
      <rect x={300} y={196} width={56} height={10} rx={5} fill={H(300)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={304 + i * 8} y={206} width={3} height={8} rx={1.5} fill={H(300)} />
      ))}
    </Room>
  );
}

function Paint({ id }: { id: string }) {
  return (
    <Room id={id}>
      <path d="M0 0h196c-8 30 8 60 0 90s8 60 0 90-6 30 0 44H0Z" fill={H(300)} />
      <path d="M196 0c-8 30 8 60 0 90s8 60 0 90" fill="none" stroke={H(400)} strokeWidth={3} opacity={0.6} />
      {/* roller */}
      <g filter={`url(#${id}-sh)`}>
        <rect x={180} y={60} width={34} height={92} rx={12} fill={H(500)} />
      </g>
      <rect x={186} y={66} width={8} height={80} rx={4} fill={H(400)} />
      <path d="M214 106h26v62" fill="none" stroke={N(500)} strokeWidth={6} strokeLinejoin="round" />
      <rect x={232} y={166} width={16} height={46} rx={7} fill={N(800)} />
      {/* tray + can */}
      <path d="M46 214h88l-10 16H56Z" fill={N(300)} />
      <path d="M58 214h64l-6 9H64Z" fill={H(400)} />
      <g filter={`url(#${id}-sh)`}>
        <rect x={290} y={172} width={62} height={58} rx={8} fill={H(600)} />
      </g>
      <rect x={286} y={166} width={70} height={12} rx={6} fill={N(400)} />
      <rect x={300} y={188} width={42} height={24} rx={4} fill="#fff" />
      <rect x={306} y={194} width={30} height={5} rx={2.5} fill={H(300)} />
      <path d="M300 178v12a5 5 0 0 0 10 0v-12" fill={H(400)} />
      <Sparkle x={300} y={92} s={1.2} />
      <Sparkle x={344} y={126} s={0.8} fill={H(300)} />
    </Room>
  );
}

function Pest({ id }: { id: string }) {
  return (
    <Room id={id}>
      <g filter={`url(#${id}-sh)`}>
        <path d="M120 128 200 66l80 62v100H120Z" fill="#fff" />
      </g>
      <path d="M104 134 200 58l96 76" fill="none" stroke={H(600)} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={182} y={176} width={36} height={52} rx={6} fill={H(200)} />
      <rect x={136} y={146} width={32} height={28} rx={5} fill={I(100)} stroke={H(200)} strokeWidth={3} />
      <rect x={232} y={146} width={32} height={28} rx={5} fill={I(100)} stroke={H(200)} strokeWidth={3} />
      {/* shield */}
      <g transform="translate(300 88)" filter={`url(#${id}-sh)`}>
        <path d="M0-34 30-22v22c0 22-14 36-30 44C-16 36-30 22-30 0v-22Z" fill={G(500)} />
        <path d="M-12 2l8 9 16-18" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* spray */}
      <rect x={42} y={164} width={30} height={66} rx={10} fill={H(500)} />
      <rect x={48} y={150} width={18} height={16} rx={4} fill={N(600)} />
      <rect x={60} y={144} width={14} height={8} rx={3} fill={N(700)} />
      {[
        [86, 140, 3],
        [96, 132, 4],
        [94, 150, 2.5],
        [108, 140, 3],
      ].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={H(300)} />
      ))}
      {/* crossed bug */}
      <g transform="translate(64 70)">
        <circle r={24} fill="#fff" stroke={R(400)} strokeWidth={5} />
        <ellipse rx={7} ry={10} fill={N(600)} />
        <path d="M-7-4h-7M7-4h7M-7 4h-7M7 4h7" stroke={N(600)} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M-17 17 17-17" stroke={R(400)} strokeWidth={5} strokeLinecap="round" />
      </g>
    </Room>
  );
}

function Laundry({ id }: { id: string }) {
  const clip = `${id}-drum`;
  return (
    <Room id={id}>
      <defs>
        <clipPath id={clip}>
          <circle cx={200} cy={168} r={34} />
        </clipPath>
      </defs>
      <path d="M0 42q100 18 200 0t200 0" fill="none" stroke={N(400)} strokeWidth={2.5} />
      <path d="M52 44l12-8h20l12 8 10 12-10 6-6-6v34H58V56l-6 6-10-6Z" fill={H(500)} />
      <path d="M310 44l10-6h18l10 6 8 10-8 5-5-5v28h-28V54l-5 5-8-5Z" fill={A(400)} />
      <g filter={`url(#${id}-sh)`}>
        <rect x={130} y={88} width={140} height={142} rx={16} fill="#fff" />
      </g>
      <rect x={130} y={88} width={140} height={30} rx={16} fill={H(100)} />
      <rect x={130} y={110} width={140} height={8} fill={H(100)} />
      <circle cx={152} cy={103} r={7} fill={H(500)} />
      <rect x={218} y={98} width={36} height={10} rx={5} fill={H(300)} />
      <circle cx={200} cy={168} r={44} fill={N(200)} />
      <circle cx={200} cy={168} r={34} fill={H(100)} />
      <g clipPath={`url(#${clip})`}>
        <path d="M160 170q10-8 20 0t20 0 20 0 20 0v40h-80Z" fill={H(400)} />
        <circle cx={186} cy={190} r={5} fill="#fff" opacity={0.8} />
        <circle cx={210} cy={184} r={3.5} fill="#fff" opacity={0.8} />
      </g>
      {/* basket */}
      <rect x={300} y={182} width={62} height={10} rx={4} fill={H(300)} />
      <rect x={302} y={172} width={58} height={10} rx={4} fill={H(500)} />
      <path d="M290 192h82l-8 40h-66Z" fill={A(300)} />
      <path d="M300 204h62M302 218h58" stroke={A(500)} strokeWidth={3} />
      <Sparkle x={86} y={160} s={1} />
    </Room>
  );
}

function Car({ id }: { id: string }) {
  return (
    <Room id={id} floor={N(200)}>
      <path d="M0 262h400" stroke="#fff" strokeWidth={4} strokeDasharray="24 18" />
      <g filter={`url(#${id}-sh)`}>
        <path d="M86 196c0-16 10-26 26-28l40-6 30-34c6-6 12-8 20-8h66c10 0 18 4 24 12l26 30 30 6c14 3 22 12 22 26v14H86Z" fill={H(500)} />
      </g>
      <path d="M188 134h40v30h-66Z" fill={I(100)} />
      <path d="M238 134h26c6 0 10 2 14 6l20 24h-60Z" fill={I(100)} />
      <rect x={86} y={196} width={264} height={14} rx={6} fill={H(700)} />
      <rect x={322} y={176} width={20} height={10} rx={5} fill={A(300)} />
      {[140, 296].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={212} r={24} fill={N(800)} />
          <circle cx={cx} cy={212} r={10} fill={N(300)} />
        </g>
      ))}
      {[
        [196, 116, 14],
        [220, 104, 18],
        [248, 112, 13],
        [272, 120, 10],
        [120, 168, 10],
        [102, 182, 8],
      ].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" stroke={H(200)} strokeWidth={2} />
      ))}
      <path d="M26 206h52l-6 34H32Z" fill={I(400)} />
      <rect x={22} y={200} width={60} height={9} rx={4.5} fill={I(500)} />
      <rect x={42} y={186} width={26} height={16} rx={6} fill={A(300)} />
      <Sparkle x={330} y={98} s={1.3} />
      <Sparkle x={360} y={130} s={0.7} fill={H(300)} />
    </Room>
  );
}

function Spa({ id }: { id: string }) {
  return (
    <Room id={id}>
      <ellipse cx={310} cy={110} rx={36} ry={78} transform="rotate(32 310 110)" fill={G(300)} />
      <path d="M268 172 352 48" stroke={G(500)} strokeWidth={3} />
      <circle cx={84} cy={88} r={40} fill={H(100)} />
      <circle cx={84} cy={88} r={24} fill={H(200)} />
      {/* stones */}
      <g filter={`url(#${id}-sh)`}>
        <ellipse cx={120} cy={214} rx={54} ry={18} fill={N(500)} />
        <ellipse cx={120} cy={186} rx={42} ry={15} fill={N(400)} />
        <ellipse cx={120} cy={162} rx={30} ry={12} fill={N(300)} />
        <ellipse cx={120} cy={142} rx={18} ry={9} fill={N(500)} />
      </g>
      {/* candles */}
      {[
        [212, 176, 44],
        [246, 192, 28],
      ].map(([x, y, h]) => (
        <g key={x}>
          <rect x={x} y={y} width={26} height={h} rx={6} fill={A(100)} />
          <path d={`M${x + 13} ${y - 20}q-8 10 0 16q8-6 0-16Z`} fill={A(400)} />
        </g>
      ))}
      {/* towel */}
      <rect x={292} y={196} width={76} height={30} rx={15} fill="#fff" stroke={H(200)} strokeWidth={2} />
      <rect x={300} y={200} width={10} height={22} fill={H(300)} />
      <circle cx={354} cy={211} r={9} fill={H(100)} />
      <Sparkle x={196} y={110} s={0.9} />
      <Sparkle x={240} y={86} s={0.6} fill={H(300)} />
    </Room>
  );
}

function Pro({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={H(100)} />
        </linearGradient>
        <filter id={`${id}-sh`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor={N(900)} floodOpacity="0.16" />
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-bg)`} />
      <circle cx="80" cy="250" r="120" fill={H(100)} opacity="0.7" />
      <g filter={`url(#${id}-sh)`}>
        <rect x={130} y={18} width={140} height={270} rx={26} fill={N(900)} />
      </g>
      <rect x={138} y={26} width={124} height={254} rx={20} fill="#fff" />
      <rect x={138} y={26} width={124} height={70} rx={20} fill={H(500)} />
      <rect x={138} y={70} width={124} height={26} fill={H(500)} />
      <circle cx={162} cy={52} r={11} fill={H(200)} />
      <rect x={180} y={45} width={52} height={6} rx={3} fill="#fff" opacity={0.9} />
      <rect x={180} y={56} width={34} height={5} rx={2.5} fill="#fff" opacity={0.6} />
      <text x={152} y={86} fontSize="15" fontWeight="800" fill="#fff">₹12,480</text>
      {[44, 30, 56, 40, 64].map((h, i) => (
        <rect key={i} x={152 + i * 20} y={170 - h} width={12} height={h} rx={4} fill={i === 4 ? H(500) : H(200)} />
      ))}
      {[186, 218].map((y, i) => (
        <g key={y}>
          <rect x={148} y={y} width={104} height={24} rx={8} fill={H(50)} />
          <circle cx={160} cy={y + 12} r={5} fill={i ? A(400) : G(500)} />
          <rect x={172} y={y + 7} width={50} height={5} rx={2.5} fill={N(400)} />
          <rect x={172} y={y + 15} width={32} height={4} rx={2} fill={N(200)} />
        </g>
      ))}
      <rect x={148} y={252} width={104} height={18} rx={9} fill={H(500)} />
      {/* floating cards */}
      <g filter={`url(#${id}-sh)`}>
        <rect x={22} y={150} width={104} height={52} rx={14} fill="#fff" />
        <rect x={286} y={60} width={98} height={46} rx={14} fill="#fff" />
      </g>
      <circle cx={44} cy={176} r={12} fill={G(100)} />
      <path d="M38 176l4 4 8-8" fill="none" stroke={G(600)} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={62} y={166} width={50} height={6} rx={3} fill={N(700)} />
      <rect x={62} y={178} width={34} height={5} rx={2.5} fill={N(300)} />
      <path transform="translate(306 83) scale(0.9)" fill={A(400)} d="M0-11 3.2-3.5 11-3.4 4.8 1.6 7 9.4 0 4.8-7 9.4-4.8 1.6-11-3.4-3.2-3.5Z" />
      <text x={322} y={88} fontSize="15" fontWeight="800" fill={N(800)}>4.9</text>
      <Sparkle x={300} y={180} s={1.1} />
    </>
  );
}

const SCENES: Record<SceneKey, (p: { id: string }) => ReactNode> = {
  clean: Clean,
  ac: Ac,
  repair: Repair,
  plumbing: Plumbing,
  salon: Salon,
  grooming: Grooming,
  paint: Paint,
  pest: Pest,
  laundry: Laundry,
  car: Car,
  spa: Spa,
  pro: Pro,
};

/** Illustrated service scene. Decorative unless `title` is given. */
export function Scene({ scene, hue = 'primary', className, title }: { scene: SceneKey; hue?: Hue; className?: string; title?: string }) {
  const id = useId().replace(/:/g, '');
  const Draw = SCENES[scene];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={cn('block h-full w-full', className)}
      style={hueVars(hue)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <Draw id={id} />
    </svg>
  );
}
