import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Map(props) {
  const { scene } = useGLTF('/streetMap.glb');

  // Ensure the map can cast and receive shadows
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
  }, [scene]);

  return (
    // 'trimesh' wraps the physics exactly around the buildings and streets
    <RigidBody type="fixed" colliders="trimesh" {...props}>
      {/* Scaling the map down so it matches the size of the Detective */}
      <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
    </RigidBody>
  );
}

useGLTF.preload('/streetMap.glb');