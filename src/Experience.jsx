import {
  useGLTF,
  Environment,
  PresentationControls,
  ContactShadows,
  Html,
  PerspectiveCamera,
} from '@react-three/drei'

import { useThree } from '@react-three/fiber'

export default function Experience() {
  const computer = useGLTF(
    'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf'
  )

  const { viewport } = useThree()
  const isMobile = window.innerWidth < 768;
  const responsiveRatio = viewport.width / 6;
  const laptopScaleRatio = Math.max(0.5, Math.min(0.9 * responsiveRatio, 0.9))

  return (
    <>
      <PerspectiveCamera manual>
        <Environment preset="city" />
        <PresentationControls
          global
          polar={[-0.4, 0.2]}
          azimuth={[-0.5, 1.25]}
          config={{ mass: 4, tension: 400 }}
          snap={{ mass: 2, tension: 400 }}
        >
          <rectAreaLight
            width={2.5}
            height={1.65}
            intensity={65}
            color={'#ff6900'}
            rotation={[-0.1, Math.PI, 0]}
            position={[0, 0.55, -1.15]}
          />
          <primitive
            object={computer.scene}
            position-y={isMobile ? -0.75 : - 1.25}
            scale={[laptopScaleRatio, laptopScaleRatio, laptopScaleRatio]}
          >
            <Html
              transform
              wrapperClass="htmlSection"
              distanceFactor={0.93}
              position={[0, 1.56, -1.4]}
              rotation-x={-0.256}
            >
              <iframe src="https://rafalmalyszko.netlify.app/" />
            </Html>
          </primitive>
        </PresentationControls>
        <ContactShadows position-y={-1.4} opacity={0.4} scale={5} blur={2.4} />
      </PerspectiveCamera>
    </>
  )
}
