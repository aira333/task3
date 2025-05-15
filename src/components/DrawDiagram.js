import React, { useRef, useState } from 'react';

const DrawDiagram = ({ onSubmit }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const startDrawing = (e) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSubmit) {
      onSubmit(dataUrl);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Draw a Diagram</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border rounded bg-white cursor-crosshair"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="mt-2 flex gap-2">
        <button onClick={handleClear} className="px-2 py-1 bg-gray-200 rounded">Clear</button>
        <button onClick={handleSubmit} className="px-2 py-1 bg-blue-500 text-white rounded">Submit Diagram</button>
      </div>
    </div>
  );
};

export default DrawDiagram; 