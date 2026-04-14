import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Ecctrl, { EcctrlAnimation } from 'ecctrl';
import { Model as Detective } from '../Detective'; 

export default function GameScene({ difficulty = 'Normal' }) {
  const [objective, setObjective] = useState("Find the evidence");
  console.log("Current Difficulty:", difficulty);

  // Difficulty Scaling
  let ambientLightIntensity = 0.5;
  let maxVelLimit = 5;

  if (difficulty === 'Easy') {
    ambientLightIntensity = 0.8;
    maxVelLimit = 6;
  } else if (difficulty === 'Hard') {
    ambientLightIntensity = 0.2;
    maxVelLimit = 3;
  }

  /**
   * animationSet required by EcctrlAnimation to map the controller's 
   * predefined internal states to the specific track names in your .glb.
   */
  const animationSet = {
    idle: 'mixamo.com',
    walk: 'mixamo.com.001',
    run: 'mixamo.com.001',       // Fallback for run
    jump: 'mixamo.com',      // Fallback for jump
    jumpIdle: 'mixamo.com',
    jumpLand: 'mixamo.com',
    fall: 'mixamo.com',      // Fallback for fall
    action1: 'mixamo.com',
    action2: 'mixamo.com',
    action3: 'mixamo.com',
    action4: 'mixamo.com',
  };

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

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 65 }}>
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
              camInitDis={-5} 
              camMaxDis={-7} 
              maxVelLimit={maxVelLimit} 
              jumpVel={0}
              position={[0, 2, 0]}
            >
              {/* 
                EcctrlAnimation watches the physical state of the Ecctrl wrapper 
                (moving, jumping, idle) and dynamically plays/blends the corresponding 
                animation tracks defined in animationSet.
              */}
              <EcctrlAnimation 
                characterURL="/mainChar.glb" 
                animationSet={animationSet}
              >
                <Detective />
              </EcctrlAnimation>
            </Ecctrl>

            {/* A static box acting as the ground plane for the player to walk on */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
              <mesh receiveShadow>
                <boxGeometry args={[50, 1, 50]} />
                <meshStandardMaterial color="#888888" />
              </mesh>
            </RigidBody>

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
    </div>
  );
}
