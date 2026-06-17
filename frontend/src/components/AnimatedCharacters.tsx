import { useState, useEffect, useRef } from 'react';

function Pupil({ size = 12, maxDistance = 5, color = '#2D2D2D', lookX, lookY }: {
  size?: number; maxDistance?: number; color?: string; lookX?: number; lookY?: number;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  let dx = 0, dy = 0;
  if (lookX !== undefined && lookY !== undefined) {
    dx = lookX; dy = lookY;
  } else if (ref.current) {
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dist = Math.min(Math.hypot(mouse.x - cx, mouse.y - cy), maxDistance);
    const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
    dx = Math.cos(angle) * dist; dy = Math.sin(angle) * dist;
  }

  return (
    <div ref={ref} style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: color,
      transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 0.1s ease-out',
    }} />
  );
}

function EyeBall({ size = 48, pupilSize = 16, maxDist = 10, eyeColor = '#fff', pupilColor = '#2D2D2D', blinking = false, lookX, lookY }: {
  size?: number; pupilSize?: number; maxDist?: number; eyeColor?: string; pupilColor?: string; blinking?: boolean; lookX?: number; lookY?: number;
}) {
  return (
    <div style={{
      width: size, height: blinking ? 2 : size, borderRadius: '50%',
      backgroundColor: eyeColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', transition: 'height 0.15s',
    }}>
      {!blinking && <Pupil size={pupilSize} maxDistance={maxDist} color={pupilColor} lookX={lookX} lookY={lookY} />}
    </div>
  );
}

function useRandomBlink() {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);
  return blinking;
}

// 角色位置计算：根据 ref 和鼠标位置计算 face/bodyskew
function useFacePos(ref: React.RefObject<HTMLDivElement | null>) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const f = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', f);
    return () => window.removeEventListener('mousemove', f);
  }, []);
  if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const r = ref.current.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 3;
  return {
    faceX: Math.max(-15, Math.min(15, (mouse.x - cx) / 20)),
    faceY: Math.max(-10, Math.min(10, (mouse.y - cy) / 30)),
    bodySkew: Math.max(-6, Math.min(6, -(mouse.x - cx) / 120)),
  };
}

export default function AnimatedCharacters({ typing = false, showPwd = false, pwdLen = 0 }: {
  typing?: boolean; showPwd?: boolean; pwdLen?: number;
}) {
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);

  const purpleBlink = useRandomBlink();
  const blackBlink = useRandomBlink();
  const [lookEachOther, setLookEachOther] = useState(false);
  const [purplePeek, setPurplePeek] = useState(false);

  useEffect(() => {
    if (typing) { setLookEachOther(true); const t = setTimeout(() => setLookEachOther(false), 800); return () => clearTimeout(t); }
    else setLookEachOther(false);
  }, [typing]);

  useEffect(() => {
    if (pwdLen > 0 && showPwd) {
      const sched = (): ReturnType<typeof setTimeout> => setTimeout(() => {
        setPurplePeek(true); setTimeout(() => { setPurplePeek(false); sched(); }, 800);
      }, Math.random() * 3000 + 2000);
      const t = sched();
      return () => clearTimeout(t);
    } else setPurplePeek(false);
  }, [pwdLen, showPwd]);

  const pp = useFacePos(purpleRef);
  const bp = useFacePos(blackRef);
  const op = useFacePos(orangeRef);
  const yp = useFacePos(yellowRef);

  const purpleSkew = showPwd ? 0 : (typing || (pwdLen > 0 && !showPwd)) ? (pp.bodySkew || 0) - 12 : pp.bodySkew || 0;
  const blackSkew = showPwd ? 0 : lookEachOther ? (bp.bodySkew || 0) * 1.5 + 10 : (typing || (pwdLen > 0 && !showPwd)) ? (bp.bodySkew || 0) * 1.5 : bp.bodySkew || 0;

  const purpleEyesL = showPwd ? 20 : lookEachOther ? 55 : 45 + pp.faceX;
  const purpleEyesT = showPwd ? 35 : lookEachOther ? 65 : 40 + pp.faceY;
  const blackEyesL = showPwd ? 10 : lookEachOther ? 32 : 26 + bp.faceX;
  const blackEyesT = showPwd ? 28 : lookEachOther ? 12 : 32 + bp.faceY;

  const pLookX = showPwd ? (purplePeek ? 4 : -4) : lookEachOther ? 3 : undefined;
  const pLookY = showPwd ? (purplePeek ? 5 : -4) : lookEachOther ? 4 : undefined;
  const bLookX = showPwd ? -4 : lookEachOther ? 0 : undefined;
  const bLookY = showPwd ? -4 : lookEachOther ? -4 : undefined;
  const oLookX = showPwd ? -5 : undefined; const oLookY = showPwd ? -4 : undefined;

  const pwding = pwdLen > 0;
  const typingOrPwd = typing || (pwding && !showPwd);
  const purpleH = typingOrPwd ? 440 : 400;
  const blackTX = showPwd ? 'skewX(0deg)' : lookEachOther ? `skewX(${blackSkew}deg) translateX(20px)` : typingOrPwd ? `skewX(${blackSkew}deg)` : `skewX(${bp.bodySkew || 0}deg)`;
  const purpleTX = showPwd ? 'skewX(0deg)' : typingOrPwd ? `skewX(${purpleSkew}deg) translateX(40px)` : `skewX(${pp.bodySkew || 0}deg)`;

  return (
    <div style={{ width: 550, height: 400, position: 'relative', margin: '0 auto' }}>
      {/* Purple - back */}
      <div ref={purpleRef} style={{
        position: 'absolute', bottom: 0, left: 70, width: 180, height: purpleH,
        backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1,
        transform: purpleTX, transformOrigin: 'bottom center', transition: 'all 0.7s ease-in-out',
      }}>
        <div style={{ position: 'absolute', left: purpleEyesL, top: purpleEyesT, display: 'flex', gap: 32, transition: 'all 0.7s ease-in-out' }}>
          <EyeBall size={18} pupilSize={7} maxDist={5} eyeColor="#fff" pupilColor="#2D2D2D" blinking={purpleBlink} lookX={pLookX} lookY={pLookY} />
          <EyeBall size={18} pupilSize={7} maxDist={5} eyeColor="#fff" pupilColor="#2D2D2D" blinking={purpleBlink} lookX={pLookX} lookY={pLookY} />
        </div>
      </div>

      {/* Black - middle */}
      <div ref={blackRef} style={{
        position: 'absolute', bottom: 0, left: 240, width: 120, height: 310,
        backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2,
        transform: blackTX, transformOrigin: 'bottom center', transition: 'all 0.7s ease-in-out',
      }}>
        <div style={{ position: 'absolute', left: blackEyesL, top: blackEyesT, display: 'flex', gap: 24, transition: 'all 0.7s ease-in-out' }}>
          <EyeBall size={16} pupilSize={6} maxDist={4} eyeColor="#fff" pupilColor="#2D2D2D" blinking={blackBlink} lookX={bLookX} lookY={bLookY} />
          <EyeBall size={16} pupilSize={6} maxDist={4} eyeColor="#fff" pupilColor="#2D2D2D" blinking={blackBlink} lookX={bLookX} lookY={bLookY} />
        </div>
      </div>

      {/* Orange - front left */}
      <div ref={orangeRef} style={{
        position: 'absolute', bottom: 0, left: 0, width: 240, height: 200, zIndex: 3,
        backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0',
        transform: showPwd ? 'skewX(0deg)' : `skewX(${op.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center', transition: 'all 0.7s ease-in-out',
      }}>
        <div style={{ position: 'absolute', left: showPwd ? 50 : 82 + (op.faceX || 0), top: showPwd ? 85 : 90 + (op.faceY || 0), display: 'flex', gap: 32, transition: 'all 0.2s ease-out' }}>
          <Pupil size={12} maxDistance={5} color="#2D2D2D" lookX={oLookX} lookY={oLookY} />
          <Pupil size={12} maxDistance={5} color="#2D2D2D" lookX={oLookX} lookY={oLookY} />
        </div>
      </div>

      {/* Yellow - front right */}
      <div ref={yellowRef} style={{
        position: 'absolute', bottom: 0, left: 310, width: 140, height: 230,
        backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: 4,
        transform: showPwd ? 'skewX(0deg)' : `skewX(${yp.bodySkew || 0}deg)`,
        transformOrigin: 'bottom center', transition: 'all 0.7s ease-in-out',
      }}>
        <div style={{ position: 'absolute', left: showPwd ? 20 : 52 + (yp.faceX || 0), top: showPwd ? 35 : 40 + (yp.faceY || 0), display: 'flex', gap: 24, transition: 'all 0.2s ease-out' }}>
          <Pupil size={12} maxDistance={5} color="#2D2D2D" lookX={oLookX} lookY={oLookY} />
          <Pupil size={12} maxDistance={5} color="#2D2D2D" lookX={oLookX} lookY={oLookY} />
        </div>
        <div style={{
          position: 'absolute', left: showPwd ? 10 : 40 + (yp.faceX || 0), top: showPwd ? 88 : 88 + (yp.faceY || 0),
          width: 80, height: 4, backgroundColor: '#2D2D2D', borderRadius: 2, transition: 'all 0.2s ease-out',
        }} />
      </div>
    </div>
  );
}
