import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 1500; // stays up at least this long, even when everything is cached
const FADE_OUT_MS = 400; // keep in sync with .pageLoader transition in style.css

// Covers the page until the laptop model and environment map have loaded.
// Calls onLeave when it starts fading out, so the lid only opens once it's visible.
export default function PageLoader({ onLeave }) {
  const { active, progress } = useProgress();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const leaving = minTimePassed && !active && progress === 100;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    onLeave();
    const timer = setTimeout(() => setRemoved(true), FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [leaving, onLeave]);

  if (removed) return null;

  return (
    <div
      className={`pageLoader ${leaving ? "pageLoaderLeaving" : ""}`}
      role="status"
      aria-label="Loading portfolio"
    >
      <div className="pageLoaderSpinner" />
    </div>
  );
}
