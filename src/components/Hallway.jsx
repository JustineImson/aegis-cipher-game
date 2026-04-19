import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Hallway({ modelPath = '/hallway.glb', onLoad, colliders = 'trimesh', ...props }) {
  // Load the map dynamically, but DO NOT CLONE IT. 
  // Rely on R3F's native Suspense handling.
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });

    if (onLoad) {
      const timer = setTimeout(onLoad, 300);
      return () => clearTimeout(timer);
    }
  }, [scene, onLoad]);

  return (
    <RigidBody type="fixed" colliders={colliders} friction={0} restitution={0} {...props}>
      {/* Reverted back to rendering the direct scene to prevent invisible meshes */}
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} dispose={null} />
    </RigidBody>
  );
}
