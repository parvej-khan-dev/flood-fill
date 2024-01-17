import React, { useEffect, useRef, useState, useCallback } from "react";
import FloodFill from "q-floodfill";

const Game = () => {
  const canvasRef = useRef(null);
  const [fillColor, setFillColor] = useState("#000000");
  const [filledAreas, setFilledAreas] = useState([]);
  const imageurl = window.location.search.split("=")[1].replace("&height", "");

  const width = +window.location.search.split("&")[1].split("=")[1];
  const height = +window.location.search.split("&")[2].split("=")[1];

  console.log("🚀 ~ Game ~ width:", width);
  console.log("🚀 ~ Game ~ height:", height);

  console.log("window", window.location.search);
  console.log("🚀 ~ Game ~ imageurl:", imageurl);

  const handleFill = (x, y, color) => {
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
  };

  const handleClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFilledAreas((prevAreas) => [...prevAreas, { x, y, color: fillColor }]);
      console.log("82374873892789", {
        x,
        y,
        fillColor,
      });
      handleFill(x, y, fillColor);
    },
    [handleFill, fillColor, setFilledAreas]
  );

  // useEffect(() => {
  //   const canvas = canvasRef.current;

  //   if (!canvas) {
  //     return;
  //   }

  //   const context = canvas.getContext("2d");

  //   const image = new Image();

  //   const setupImage = (width, height) => {
  //     console.log("🚀 ~ setupImage ~ width:", width, height);
  //     image.src = imageurl; //"./boat.png";
  //     image.crossOrigin = "Anonymous";

  //     image.onload = () => {
  //       // Draw the image on the canvas
  //       context.drawImage(
  //         image,
  //         0,
  //         0,
  //         width ? width : canvas.width,
  //         height ? height : canvas.height
  //       );
  //       fillExistingColors();
  //     };

  //     canvas.addEventListener("click", handleClick);
  //   };

  //   setupImage();
  //   function handleResize() {
  //     const setWindowWidth = window.outerWidth;
  //     const setWidthHeight = window.outerHeight;

  //     setupImage(setWindowWidth, setWidthHeight);
  //   }

  //   window.addEventListener("resize", () => {
  //     console.log("window.innerHeight", window.innerWidth);
  //     handleResize();
  //   });

  //   const cleanup = () => {
  //     canvas.removeEventListener("click", handleClick);
  //     window.removeEventListener("resize", handleResize);
  //   };

  //   return cleanup;
  // }, [fillColor]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    const image = new Image();

    const setupImage = (width, height) => {
      console.log("🚀 ~ setupImage ~ width:", width);
      image.src = imageurl; //"./boat.png";
      image.crossOrigin = "Anonymous";

      image.onload = () => {
        // Draw the image on the canvas
        context.drawImage(
          image,
          0,
          0,
          width ? width : canvas.width,
          canvas.height
        );
        fillExistingColors();
      };

      canvas.addEventListener("click", handleClick);
    };

    setupImage();
    function handleResize() {
      const setWindowWidth = window.outerWidth - 50;
      // const setHeight = window.outerHeight - 50;
      // setWidth(setWindowWidth);
      setupImage(setWindowWidth);
    }

    window.addEventListener("resize", () => {
      console.log("window.innerHeight", window.innerWidth);
      handleResize();
    });

    const cleanup = () => {
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };

    return cleanup;
  }, [fillColor]);

  const fillExistingColors = (filledValueArray) => {
    if (Array.isArray(filledValueArray) && filledValueArray.length > 0) {
      console.log(
        "🚀 ~ fillExistingColors ~ filledValueArray:",
        filledValueArray
      );
      filledValueArray.forEach(({ x, y, color }) => {
        handleFill(x, y, color);
      });
    } else {
      console.log("filledAreas ---------------", filledAreas);
      // Redraw all filled areas when fillColor or filledAreas change
      filledAreas.forEach(({ x, y, color }) => {
        handleFill(x, y, color);
      });
    }
  };

  useEffect(() => {
    fillExistingColors();
  }, [fillColor, filledAreas, handleFill]);

  function fetchEventLister(e) {
    console.log("e .data", e.data, typeof e.data);
    if (e && typeof e.data === "string") {
      console.log(e.data);
      const eventType = JSON.parse(e.data);
      switch (eventType.type) {
        case "width":
          break;
        case "undo":
          if (filledAreas.length > 0) {
            const newFilledAreas = filledAreas.pop();

            const { x, y } = newFilledAreas;
            let color = "#fff";
            handleFill(x, y, color);
          }
          break;
        case "save":
          const base64Data = canvasRef.current.toDataURL("image/png");
          window.parent.postMessage(
            JSON.stringify({ type: "image", data: base64Data }),
            "*"
          );
          break;
        default:
          break;
      }
    }
  }

  useEffect(() => {
    window.addEventListener("message", fetchEventLister);
    return () => {
      window.removeEventListener("message", fetchEventLister);
    };
  }, [filledAreas]);

  return (
    <>
      <div className="draw-pad phone">
        <input
          type="color"
          name="color-picker"
          className="color-picker"
          onChange={(e) => setFillColor(e.target.value)}
          style={{ margin: "10px" }}
        />

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="canvas-temp"
        />
      </div>
      {/* <div className="draw-pad ipad">
        <input
          type="color"
          name="color-picker"
          className="color-picker"
          onChange={(e) => setFillColor(e.target.value)}
          style={{ margin: "10px" }}
        />

        <canvas
          ref={canvasRef}
          width={620}
          height={620}
          className="canvas-temp"
        />
      </div> */}
    </>
  );
};

export default Game;
