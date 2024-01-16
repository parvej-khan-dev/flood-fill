import React, { useEffect, useRef, useState, useCallback } from "react";
import FloodFill from "q-floodfill";

const Game = () => {
  const canvasRef = useRef(null);
  const [fillColor, setFillColor] = useState("#000000");
  const [filledAreas, setFilledAreas] = useState([]);
  const imageurl = window.location.search.split("=")[1];
  

  console.log("🚀 ~ Game ~ imageurl:", imageurl);

  const handleFill = useCallback((x, y, color) => {
    const context = canvasRef.current.getContext("2d");
    const imgData = context.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const floodFill = new FloodFill(imgData);
    floodFill.fill(color, x, y, 0);
    context.putImageData(floodFill.imageData, 0, 0);
  }, []);

  const handleClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFilledAreas((prevAreas) => [...prevAreas, { x, y, color: fillColor }]);
      handleFill(x, y, fillColor);
    },
    [handleFill, fillColor, setFilledAreas]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    const image = new Image();

    const setupImage = () => {
      image.src = imageurl; //"./boat.png";
      image.crossOrigin = "Anonymous";

      image.onload = () => {
        // Draw the image on the canvas
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        fillExistingColors();
      };

      canvas.addEventListener("click", handleClick);
    };

    setupImage();

    const cleanup = () => {
      canvas.removeEventListener("click", handleClick);
    };

    return cleanup;
  }, [fillColor]);

  const fillExistingColors = () => {
    console.log("filledAreas", filledAreas);
    // Redraw all filled areas when fillColor or filledAreas change
    filledAreas.forEach(({ x, y, color }) => {
      handleFill(x, y, color);
    });
  };

  return (
    <>
      <label htmlFor="color-picker">Choose your color</label>
      <input
        type="color"
        name="color-picker"
        onChange={(e) => setFillColor(e.target.value)}
        style={{ margin: "10px" }}
      />

      <canvas ref={canvasRef} height={500} className="canvas-temp" />
    </>
  );
};

export default Game;
