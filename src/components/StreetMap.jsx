import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function StreetMap({ onLoad, ...props }) {
  // Load the single, fully-baked .glb file from the public folder
  const { scene } = useGLTF('/streetMap.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Ensure the map can cast and receive shadows from the DirectionalLight
        child.receiveShadow = true;
        child.castShadow = true;

        // CRITICAL: Force the material to recompile with shadow support
        // Without this, the shader program never includes shadow sampling code
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });

    // Signal that the map is fully loaded and ready for physics
    if (onLoad) {
      // Small delay gives Rapier time to build the trimesh collider from the geometry
      const timer = setTimeout(onLoad, 300);
      return () => clearTimeout(timer);
    }
  }, [scene, onLoad]);

  return (
    // 'trimesh' ensures the character walks perfectly on the uneven geometry
    <RigidBody type="fixed" colliders="trimesh" friction={0.8} restitution={0} {...props}>
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
    </RigidBody>
  );
}

// Preload to prevent stuttering when the component mounts
useGLTF.preload('/streetMap.glb');
