import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { Suspense, useCallback, useEffect, useState } from "react";
import PageLoader from "./PageLoader.jsx";

function App() {
  const [isLoaderGone, setIsLoaderGone] = useState(false);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoaderLeave = useCallback(() => setIsLoaderGone(true), []);
  const handleLidOpened = useCallback(() => setIsLidOpen(true), []);
  const handleEnter = useCallback(() => setIsEntering(true), []);
  const handleEntered = useCallback(() => setIsFullscreen(true), []);

  // Once the camera has flown into the screen, the laptop's iframe itself is lifted out of the 3D scene to cover
  // the window (see .portfolioFullscreen in style.css) — the same element, so the portfolio doesn't reload.
  useEffect(() => {
    if (!isFullscreen) return;
    document.documentElement.classList.add("portfolioFullscreen");
    // Expand on the next frames so the size change animates from the starting position.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() =>
        document.documentElement.classList.add("portfolioExpanded")
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [isFullscreen]);

  return (
    <>
      <Canvas
        frameloop={isFullscreen ? "never" : "always"}
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [0, 2, 4],
        }}
      >
        <Suspense fallback={null}>
          <Experience
            openLid={isLoaderGone}
            onLidOpened={handleLidOpened}
            entering={isEntering}
            onEnter={handleEnter}
            onEntered={handleEntered}
          />
        </Suspense>
      </Canvas>

      <button
        className={`enterButton ${
          isLidOpen && !isEntering ? "enterButtonVisible" : ""
        }`}
        onClick={handleEnter}
        tabIndex={isLidOpen && !isEntering ? 0 : -1}
      >
        Wyświetl portfolio na pełnym ekranie <span aria-hidden="true">→</span>
      </button>

      <PageLoader onLeave={handleLoaderLeave} />
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(<App />);
