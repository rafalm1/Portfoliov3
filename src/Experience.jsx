import {
  useGLTF,
  Environment,
  PresentationControls,
  ContactShadows,
  Html,
  PerspectiveCamera,
} from "@react-three/drei";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { PORTFOLIO_ENTER_URL } from "./portfolio.js";

// Lid opening on entry: starts closed (lying on the keyboard) and swings open once the loader has faded out.
const LID_OPEN_DELAY = 0.4; // seconds after the loader starts fading out (its fade-out time)
const LID_OPEN_DURATION = 1.8; // seconds
const LID_CLOSED_OFFSET = Math.PI / 2; // extra hinge rotation that folds the lid shut

// "Enter" zoom: the camera flies up to the screen until it fills the window.
const ZOOM_DURATION = 1.2; // seconds
const SCREEN_WIDTH_PX = 1140; // keep in sync with .htmlSection iframe in style.css
const SCREEN_HEIGHT_PX = 735;
const SCREEN_DISTANCE_FACTOR = 2.95;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const screenCenter = new Vector3();
const screenNormal = new Vector3();
const screenScale = new Vector3();
const zoomTarget = new Vector3();
const lookTarget = new Vector3();

export default function Experience({
  openLid,
  onLidOpened,
  entering,
  onEnter,
  onEntered,
}) {
  const computer = useGLTF("/mac-draco.glb");
  const lid = computer.nodes.screenflip;
  // The GLTF is cached across remounts, so remember the modelled (open) angle only once.
  lid.userData.openRotation ??= lid.rotation.x;

  // The model's screen has a desktop wallpaper baked in; show a switched-off screen (the portfolio's background
  // colour) instead, so nothing but the portfolio ever appears on it.
  const screenMaterial = computer.materials["screen.001"];
  if (screenMaterial.map) {
    screenMaterial.map = null;
    screenMaterial.color.set("#111110");
    screenMaterial.needsUpdate = true;
  }

  const screenHinge = useRef();
  const screenContent = useRef();
  const screenAnchor = useRef();
  const lidAnimationStart = useRef(null);
  const lidAnimationDone = useRef(false);
  const zoom = useRef(null);
  const pointerDownAt = useRef(null);

  const { viewport } = useThree();
  const responsiveRatio = viewport.width / 6;
  const laptopScaleRatio =
    Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.9)) * 0.3;

  useFrame(({ clock, camera, size }) => {
    if (!lidAnimationDone.current) {
      // The lid stays shut while the loader covers the scene.
      if (openLid && lidAnimationStart.current === null)
        lidAnimationStart.current = clock.elapsedTime;

      const elapsed =
        lidAnimationStart.current === null
          ? 0
          : clock.elapsedTime - lidAnimationStart.current - LID_OPEN_DELAY;
      const progress = prefersReducedMotion
        ? 1
        : MathUtils.clamp(elapsed / LID_OPEN_DURATION, 0, 1);
      const hingeOffset = (1 - easeInOutCubic(progress)) * LID_CLOSED_OFFSET;

      lid.rotation.x = lid.userData.openRotation + hingeOffset;
      screenHinge.current.rotation.x = hingeOffset;
      // HTML is drawn over the canvas and can't be hidden by the closed lid, so it fades in near the end.
      screenContent.current.style.opacity = MathUtils.smoothstep(
        progress,
        0.6,
        1
      );

      if (progress === 1) {
        lidAnimationDone.current = true;
        onLidOpened();
      }
    }

    if (!entering) return;

    if (zoom.current === null)
      zoom.current = {
        start: clock.elapsedTime,
        fromPosition: camera.position.clone(),
        fromLookAt: new Vector3(0, 0, 0), // the default camera looks at the origin
      };

    // Recomputed every frame because the controls may still be springing back to the default angle.
    const anchor = screenAnchor.current;
    anchor.getWorldPosition(screenCenter);
    anchor.getWorldScale(screenScale);
    screenNormal.set(0, 0, 1).transformDirection(anchor.matrixWorld);

    // Distance at which the screen covers the whole window.
    const pxToWorld = (SCREEN_DISTANCE_FACTOR / 400) * screenScale.y;
    const halfFovTan = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const fillHeight = (SCREEN_HEIGHT_PX * pxToWorld) / 2 / halfFovTan;
    const fillWidth =
      (SCREEN_WIDTH_PX * pxToWorld) / 2 / (halfFovTan * (size.width / size.height));
    zoomTarget
      .copy(screenCenter)
      .addScaledVector(screenNormal, Math.min(fillHeight, fillWidth));

    const progress = prefersReducedMotion
      ? 1
      : MathUtils.clamp(
          (clock.elapsedTime - zoom.current.start) / ZOOM_DURATION,
          0,
          1
        );
    const eased = easeInOutCubic(progress);

    camera.position.lerpVectors(zoom.current.fromPosition, zoomTarget, eased);
    lookTarget.lerpVectors(zoom.current.fromLookAt, screenCenter, eased);
    camera.lookAt(lookTarget);

    if (progress === 1 && !zoom.current.finished) {
      zoom.current.finished = true;
      onEntered();
    }
  });

  // A drag on the screen rotates the laptop; only a click without movement enters the portfolio.
  const handleScreenPointerDown = (event) => {
    pointerDownAt.current = { x: event.clientX, y: event.clientY };
  };
  const handleScreenClick = (event) => {
    const start = pointerDownAt.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6)
      onEnter();
  };

  return (
    <>
      <PerspectiveCamera manual>
        <Environment preset="city" />
        <PresentationControls
          global
          enabled={!entering}
          polar={[-0.2, 0.5]}
          azimuth={[-0.5, 0.9]}
          config={{ mass: 4, tension: 400 }}
          snap={{ mass: 2, tension: 400 }}
        >
          <primitive
            object={computer.scene}
            scale={[laptopScaleRatio, laptopScaleRatio, laptopScaleRatio]}
          >
            {/* Pivots the screen content around the lid's hinge so it moves together with the lid. */}
            <group position={lid.position}>
              <group ref={screenHinge}>
                <group position={lid.position.clone().negate()}>
                  <group ref={screenAnchor} position={[0, 3.025, 0.35]} />
                  <Html
                    transform
                    wrapperClass="htmlSection"
                    distanceFactor={SCREEN_DISTANCE_FACTOR}
                    position={[0, 3.025, 0.35]}
                    rotation-x={0}
                  >
                    {/* A preview only: the iframe ignores the pointer, a click opens the full portfolio. */}
                    <div
                      ref={screenContent}
                      className="screenPreview"
                      style={{ opacity: 0 }}
                      onPointerDown={handleScreenPointerDown}
                      onClick={handleScreenClick}
                    >
                      {/* Loaded only once the lid starts opening, so the portfolio's name animation plays
                          while the screen fades in instead of finishing behind the loader. */}
                      <iframe
                        src={openLid ? PORTFOLIO_ENTER_URL : "about:blank"}
                        tabIndex={-1}
                      />
                    </div>
                  </Html>
                </group>
              </group>
            </group>
          </primitive>
        </PresentationControls>
        <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} />
      </PerspectiveCamera>
    </>
  );
}
