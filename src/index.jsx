import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { Suspense, useCallback, useEffect, useState } from "react";
import PageLoader from "./PageLoader.jsx";
import { PORTFOLIO_ENTER_URL } from "./portfolio.js";

function App() {
  const [isLoaderGone, setIsLoaderGone] = useState(false);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const handleLoaderLeave = useCallback(() => setIsLoaderGone(true), []);
  const handleLidOpened = useCallback(() => setIsLidOpen(true), []);
  const handleEnter = useCallback(() => setIsEntering(true), []);
  const handleEntered = useCallback(
    () => window.location.assign(PORTFOLIO_ENTER_URL),
    []
  );

  // Coming back with the browser's Back button can restore this page mid-zoom from the cache; start over instead.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <>
      <Canvas
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

      {/* Fades to the portfolio's background just before navigating, so the hand-off doesn't flash. */}
      <div
        className={`enterFade ${isEntering ? "enterFadeVisible" : ""}`}
        aria-hidden="true"
      />

      <PageLoader onLeave={handleLoaderLeave} />
    </>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(<App />);
