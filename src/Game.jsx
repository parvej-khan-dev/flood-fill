import React, { useEffect, useRef, useState, useCallback } from "react";
import FloodFill from "q-floodfill";

const Game = () => {
  const canvasRef = useRef(null);
  const [fillColor, setFillColor] = useState("#348D73");
  const [filledAreas, setFilledAreas] = useState([]);
  const imageurl = window.location.search.split("=")[1].replace("&height", "");

  const inputRef = useRef(null);

  const searchParam = window.location.search.split("&");
  console.log("🚀 ~ Game ~ searchParam:", searchParam);

  // let width;
  // let height;

  // searchParam.forEach((item) => {
  //   const length = item.split("=")[1];
  //   if (item.includes("width")) {
  //     width = length;
  //   }
  //   if (item.includes("height")) {
  //     height = length;
  //   }
  // });

  const width = +window.location.search.split("&")[1].split("=")[1];
  const height = +window.location.search.split("&")[2].split("=")[1];

  console.log("🚀 ~ Game ~ width:", width);
  console.log("🚀 ~ Game ~ height:", height);

  console.log("window", window.location.search);
  console.log("🚀 ~ Game ~ imageurl:", imageurl);

  const handleFill = (x, y, color) => {
    if (x && y && color) {
      x = Math.floor(x);
      y = Math.floor(y);
      const context = canvasRef.current.getContext("2d");
      const imgData = context.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const floodFill = new FloodFill(imgData);
      console.log("🚀 ~ handleFill ~ floodFill:", floodFill);
      floodFill.fill(color, x, y, 0);
      context.putImageData(floodFill.imageData, 0, 0);
    } else {
      console.log("Invalid coordinate");
    }
  };

  // const handleClick = useCallback(
  //   (e) => {
  //     const rect = canvasRef.current.getBoundingClientRect();
  //     console.log("🚀 ~ Game ~ rect:", rect);
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;

  //     setFilledAreas((prevAreas) => [...prevAreas, { x, y, color: fillColor }]);

  //     handleFill(x, y, fillColor);
  //   },
  //   [handleFill, fillColor, setFilledAreas]
  // );

  const handleClick = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const context = canvasRef.current.getContext("2d");
      const pixelData = context.getImageData(x, y, 1, 1).data;

      // Check if the alpha value is 0 (fully transparent)
      if (pixelData[3] !== 0) {
        console.log("Clicked on the border, not filling color");
        return;
      }

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

      filledAreas.forEach(({ x, y, color }) => {
        handleFill(x, y, color);
      });
    }
  };

  useEffect(() => {
    fillExistingColors();
  }, [fillColor, filledAreas, handleFill]);

  function fetchEventLister(e) {
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

  const enableColorPicker = (e) => {
    if (inputRef != null) {
      // inputRef.current.click();
      document.querySelector("#colorPickerWrapper input").click();
    }
  }

  if (width && height) {
    return (
      <>
        <div className="draw-pad phone">
          <div id="colorPickerWrapper" style={{backgroundColor: fillColor}}>
            <input
              ref={inputRef}
              type="color"
              name="color-picker"
              className="color-picker"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              style={{ margin: "10px" }}
            />
            <a href="javascript:;" onClick={enableColorPicker} >
              <img src="/color_picker_n.png" alt="Color Picker" />
            </a>
          </div>

          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="canvas-temp"
          />
        </div>
      </>
    );
  }
};

export default Game;
