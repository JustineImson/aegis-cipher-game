import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Ecctrl from 'ecctrl';
import { KeyboardControls, Environment, Sky } from '@react-three/drei';
import Detective from '../Detective';
import StreetMap from './StreetMap';
export default function GameScene({ difficulty = 'Normal' }) {
  const [objective, setObjective] = useState("Find the evidence");
  console.log("Current Difficulty:", difficulty);

  // Difficulty Scaling
  let ambientLightIntensity = 0.5;
  let maxVelLimit = 2.5;

  if (difficulty === 'Easy') {
    ambientLightIntensity = 0.8;
    maxVelLimit = 6;
  } else if (difficulty === 'Hard') {
    ambientLightIntensity = 0.2;
    maxVelLimit = 2.5;
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
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 65 }}>
          <Environment preset="city" />
          {/* Visual sun to improve visual environment details */}
          <Sky sunPosition={[10, 10, 5]} />
          {/* Basic lighting required for standard materials and shadows */}
          <ambientLight intensity={ambientLightIntensity} />
          <directionalLight
            castShadow
            position={[10, 10, 5]}
            intensity={1.5}
            shadow-mapSize={[1024, 1024]}
          />

          <Suspense fallback={null}>
            <Physics debug={false} timeStep="vary">

              {/* 
              Ecctrl is the character controller physics wrapper. 
              It reads keyboard/joystick inputs, calculates forces and velocities,
              manages the camera, and applies movement to the internal RigidBody.
            */}
              <Ecctrl
                animated={true}
                animationSet={animationSet}
                camInitDis={-5}
                camMaxDis={-7}
                maxVelLimit={maxVelLimit}
                jumpVel={0}
                position={[8, 5, 0]}
              >
                <Detective />
              </Ecctrl>

              <StreetMap position={[0, 0, 0]} />

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
