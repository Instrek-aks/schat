import React, { useEffect, useRef } from 'react';

export default function Seismograph() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ x: 0, y: 22, vy: 0, pts: [], raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 300;
    const H = 44;
    canvas.width = W;
    canvas.height = H;
    const s = stateRef.current;
    s.x = 0; s.y = H/2; s.vy = 0; s.pts = [];

    function draw() {
      canvas.width = canvas.offsetWidth || W;
      const cW = canvas.width;
      ctx.clearRect(0, 0, cW, H);
      // update physics
      const accel = (Math.random() - 0.49) * 4;
      s.vy = s.vy * 0.85 + accel;
      s.y = Math.max(4, Math.min(H - 4, s.y + s.vy));
      s.x++;
      if (s.x > cW) { s.x = 0; s.pts = []; }
      s.pts.push({ x: s.x, y: s.y });
      if (s.pts.length > cW) s.pts.shift();

      // draw line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(37,99,235,0.7)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < s.pts.length; i++) {
        if (i === 0) ctx.moveTo(s.pts[i].x, s.pts[i].y);
        else ctx.lineTo(s.pts[i].x, s.pts[i].y);
      }
      ctx.stroke();
      // glow dot
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#2563eb';
      ctx.fill();
      ctx.shadowBlur = 0;

      s.raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="mini-seismo" style={{display:'block',width:'100%',height:44}} />
    </>
  );
}
