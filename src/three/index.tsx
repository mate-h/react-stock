import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function Chart3D() {
  return (
    <Canvas>
      <OrbitControls />
      <gridHelper />
    </Canvas>
  )
}
