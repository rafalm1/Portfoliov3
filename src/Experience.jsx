import {
  useGLTF,
  Environment,
  PresentationControls,
  ContactShadows,
  Html,
  PerspectiveCamera,
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";

export default function Experience() {
  const computer = useGLTF("/mac-draco.glb");

  const { viewport } = useThree();
  const responsiveRatio = viewport.width / 6;
  const laptopScaleRatio =
    Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.9)) * 0.3;

  return (
    <>
      <PerspectiveCamera manual>
        <Environment preset="city" />
        <PresentationControls
          global
          polar={[-0.2, 0.5]}
          azimuth={[-0.5, 0.9]}
          config={{ mass: 4, tension: 400 }}
          snap={{ mass: 2, tension: 400 }}
        >
          <primitive
            object={computer.scene}
            scale={[laptopScaleRatio, laptopScaleRatio, laptopScaleRatio]}
          >
            <Html
              transform
              wrapperClass="htmlSection"
              distanceFactor={2.95}
              position={[0, 3.025, 0.35]}
              rotation-x={0}
            >
              <iframe src="https://rafalmalyszkov2.netlify.app/" />
            </Html>
          </primitive>
        </PresentationControls>
        <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} />
      </PerspectiveCamera>
    </>
  );
}
1;
