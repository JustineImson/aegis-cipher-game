import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';

export default function Detective(props) {
  const { scene, animations } = useGLTF('/mainChar.glb');
  const { actions } = useAnimations(animations, scene);
  const currentAction = useRef(null);

  // Hook directly into the keyboard instead of the physics engine!
  const [subscribeKeys] = useKeyboardControls();

  useEffect(() => {
    // 1. Start by playing the idle animation by default
    const idleAction = actions['mixamo.com.002'];
    if (idleAction) {
      idleAction.play();
      currentAction.current = idleAction;
    }

    // 2. Subscribe to keyboard movement
    const unsubscribe = subscribeKeys(
      // Listen for ANY movement key being pressed
      (state) => state.forward || state.backward || state.leftward || state.rightward,
      // This function runs whenever the movement state changes (true = moving, false = stopped)
      (isMoving) => {
        const targetTrack = isMoving ? 'mixamo.com.003' : 'mixamo.com.002';
        const nextAction = actions[targetTrack];

        console.log(`[Keyboard Animator] Moving: ${isMoving} | Track: ${targetTrack}`);

        if (nextAction && currentAction.current !== nextAction) {
          if (currentAction.current) {
            currentAction.current.fadeOut(0.2);
          }

          nextAction.reset().fadeIn(0.2).play();
          currentAction.current = nextAction;
        }
      }
    );

    // Cleanup the listener if the component unmounts
    return () => unsubscribe();
  }, [actions, subscribeKeys]);

  // Fix PBR Rendering and Transparency
  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthWrite = true;
          child.material.alphaTest = 0.5;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} {...props} />;
}