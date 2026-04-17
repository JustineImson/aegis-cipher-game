import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function StreetMap(props) {
  // Load the single, fully-baked .glb file from the public folder
  const { scene } = useGLTF('/streetMap.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Ensure the map can cast and receive shadows from the DirectionalLight
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
  }, [scene]);

  return (
    // 'trimesh' ensures the character walks perfectly on the uneven geometry
    <RigidBody type="fixed" colliders="trimesh" {...props}>
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
    </RigidBody>
  );
}

// Preload to prevent stuttering when the component mounts
useGLTF.preload('/streetMap.glb');
