import { useEffect, useRef } from 'react';

const NODE_COLOR = 'rgba(255, 255, 255, 0.5)';
const ACCENT_COLOR = 'rgba(52, 211, 153, 0.75)';
const LINE_COLOR = '255, 255, 255';
const LINK_DISTANCE = 130;

export default function MeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let nodes = [];
    let frame = 0;
    let running = false;

    function buildNodes() {
      const count = Math.min(
        70,
        Math.max(24, Math.round((width * height) / 26000)),
      );

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        accent: Math.random() < 0.12,
      }));
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      buildNodes();
    }

    function draw() {
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance < LINK_DISTANCE) {
            context.strokeStyle = `rgba(${LINE_COLOR}, ${(1 - distance / LINK_DISTANCE) * 0.14})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        context.fillStyle = node.accent ? ACCENT_COLOR : NODE_COLOR;
        context.beginPath();
        context.arc(node.x, node.y, node.accent ? 1.8 : 1.2, 0, Math.PI * 2);
        context.fill();
      }
    }

    function step() {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      draw();
      frame = window.requestAnimationFrame(step);
    }

    function start() {
      if (running) return;
      running = true;

      if (reducedMotion) {
        draw();
      } else {
        frame = window.requestAnimationFrame(step);
      }
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(frame);
    }

    resize();
    start();

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
    observer.observe(canvas);

    window.addEventListener('resize', resize);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-network" aria-hidden="true" />;
}
