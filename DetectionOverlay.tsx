
import React, { useEffect, useRef } from 'react';
import { PotholeDetection, Severity } from '../types';

interface Props {
  imageSrc: string;
  detections: PotholeDetection[];
}

const DetectionOverlay: React.FC<Props> = ({ imageSrc, detections }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const displayWidth = containerRef.current?.clientWidth || img.width;
      const scale = displayWidth / img.width;
      const displayHeight = img.height * scale;

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      detections.forEach((det) => {
        const [ymin, xmin, ymax, xmax] = det.box_2d;
        
        // Gemini returns normalized 0-1000
        const x = (xmin / 1000) * displayWidth;
        const y = (ymin / 1000) * displayHeight;
        const w = ((xmax - xmin) / 1000) * displayWidth;
        const h = ((ymax - ymin) / 1000) * displayHeight;

        // Color based on severity
        let color = '#EAB308'; // Yellow (Medium)
        if (det.severity === Severity.LOW) color = '#22C55E'; // Green
        if (det.severity === Severity.HIGH) color = '#EF4444'; // Red

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Label bg
        ctx.fillStyle = color;
        const label = `${det.severity} Hazard (${Math.round(det.confidence * 100)}%)`;
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x, y - 20, textWidth + 10, 20);

        // Label text
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 5, y - 6);
      });
    };
    img.src = imageSrc;
  }, [imageSrc, detections]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-black shadow-lg">
      <canvas ref={canvasRef} className="block w-full h-auto" />
    </div>
  );
};

export default DetectionOverlay;
