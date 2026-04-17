import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Ecctrl from 'ecctrl';
import { KeyboardControls, Environment, Sky } from '@react-three/drei';
import Detective from '../Detective';
import StreetMap from './StreetMap';

export default function GameScene({ difficulty = 'Normal' }) {
  const [objective, setObjective] = useState("Find the evidence");
  const [mapReady, setMapReady] = useState(false);
  const sunRef = useRef();

  console.log("Current Difficulty:", difficulty);

  // Difficulty Scaling (Temporarily lowering ambient light so we can easily see shadows!)
  let ambientLightIntensity = 0.2; 
  let maxVelLimit = 1.5;

  if (difficulty === 'Easy') {
    ambientLightIntensity = 0.3;
    maxVelLimit = 1.5;
  } else if (difficulty === 'Hard') {
    ambientLightIntensity = 0.1;
    maxVelLimit = 1.5;
  }

  // Restore animationSet to fix missing movement states
  const animationSet = {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    jump: 'Jump',
    jumpIdle: 'JumpIdle',
    jumpLand: 'JumpLand',
    fall: 'Fall'
  };
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: [] },
    { name: 'run', keys: [] },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 2D Overlay for Objective */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fcd34d', // amber-300
          padding: '15px 25px',
          borderRadius: '8px',
          border: '1px solid #d97706', // amber-600
          fontFamily: 'serif',
          fontSize: '20px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        Objective: {objective}
      </div>

      <KeyboardControls map={keyboardMap}>
        {/* Force soft shadows in the Canvas */}
        <Canvas shadows="PCFSoft" camera={{ position: [0, 5, 10], fov: 65 }}>
          
          {/* TEMPORARILY DISABLED: Environment map washes out shadows */}
          {/* <Environment preset="city" /> */}
          
          <Sky sunPosition={[30, 50, 30]} />
          <ambientLight intensity={ambientLightIntensity} />

          {/* DECLARATIVE SHADOW CAMERA: Replaces the buggy useEffect */}
          <directionalLight
            ref={sunRef}
            castShadow
            position={[30, 50, 30]}
            intensity={3}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-camera-near={0.1}
            shadow-camera-far={300}
            shadow-bias={-0.0005}
          />

          {/* Subtle fill light without shadows to brighten the dark sides of buildings */}
          <directionalLight position={[-20, 30, -20]} intensity={0.5} />

          <Suspense fallback={null}>
            {/* Removed timeStep="vary" — it causes massive delta-time spikes during load, tunneling the character through the floor */}
            <Physics debug={false}>

              {/* MAP LOADS FIRST: always rendered, signals onLoad when trimesh collider is ready */}
              <StreetMap position={[0, 0, 0]} onLoad={() => setMapReady(true)} />

              {/* CHARACTER LOADS SECOND: only spawns after the map's trimesh is fully initialized */}
              {mapReady && (
                <Ecctrl
                  animated={true}
                  animationSet={animationSet}
                  camInitDis={-3}
                  camMaxDis={-5}
                  maxVelLimit={maxVelLimit}
                  jumpVel={0}
                  // Y=2 gives a short safe drop — the map collider is guaranteed ready
                  position={[8, 2, 0]}
                  // Shrink the physics capsule to match the smaller model
                  radius={0.15}
                  halfHeight={0.3}
                >
                  {/* Scale down to door-size (~0.4). Offset Y = -(radius + halfHeight) = -0.45 */}
                  <Detective scale={[0.55, 0.55, 0.55]} position={[0, -0.9, 0]} />
                </Ecctrl>
              )}

              {/* Invisible Sensor Clue */}
              <RigidBody
                type="fixed"
                position={[5, 0, 5]}
                sensor
                onIntersectionEnter={(payload) => {
                  // When detective enters sensor
                  setObjective("Evidence Found! Case Closed.");
                }}
              >
                <mesh>
                  <boxGeometry args={[2, 2, 2]} />
                  {/* Make it invisible as requested */}
                  <meshBasicMaterial transparent opacity={0} />
                </mesh>
              </RigidBody>

            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
