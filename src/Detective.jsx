import React, { useEffect, useLayoutEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Detective(props) {
  // Make sure this matches the exact filename in the public folder!
  const { scene, animations } = useGLTF('/mainChar.glb') 
  const { actions } = useAnimations(animations, scene)

  // Log the exact animation names to the console so we can map them
  useEffect(() => {
    console.log("EXACT ANIMATION NAMES:", Object.keys(actions))
  }, [actions])

  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        if (child.material) {
          child.material.depthWrite = true;
          child.material.alphaTest = 0.5;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />
}
