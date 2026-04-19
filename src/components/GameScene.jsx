import React, { Suspense, useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import Ecctrl from 'ecctrl';
import { KeyboardControls, useTexture, useKeyboardControls, useGLTF } from '@react-three/drei';
import Detective from '../Detective';
import StreetMap from './StreetMap';
import Hallway from './Hallway'; // NEW IMPORT

// --- COMPONENT: Custom Skydome ---
function SkyDome() {
  const texture = useTexture('/sky.jpg');
  return (
    <mesh>
      <sphereGeometry args={[200, 32, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// --- COMPONENT: Glowing Door Marker with Physics Sensor ---
function DoorMarker({ position, doorId, onEnter, onExit }) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      sensor
      onIntersectionEnter={() => onEnter(doorId)}
      onIntersectionExit={() => onExit()}
    >
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
        <meshBasicMaterial color="#fcd34d" transparent={true} opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </RigidBody>
  );
}

// --- COMPONENT: Invisible Keypress Listener ---
function InteractionManager({ activeDoor, onEnterDoor }) {
  const [subscribeKeys] = useKeyboardControls();

  useEffect(() => {
    return subscribeKeys(
      (state) => state.interact,
      (pressed) => {
        if (pressed && activeDoor) {
          onEnterDoor(activeDoor);
        }
      }
    );
  }, [activeDoor, onEnterDoor, subscribeKeys]);

  return null;
}

export default function GameScene({ difficulty = 'Normal' }) {
  const [objective, setObjective] = useState("Find the evidence");
  const [mapReady, setMapReady] = useState(false);
  const [currentMap, setCurrentMap] = useState('city'); // NEW: Tracks which level to load
  const [activeDoor, setActiveDoor] = useState(null);   // NEW: Tracks if player is near a door

  // Configure the spawn positions for each map here so you can easily adjust them
  const spawnPositions = {
    city: [8, 2, 0],
    hallway: [0, 0.5, -2.5],
    hallway3: [0, 1.5, 0], // Spawn higher to avoid floor clipping
    hallway4: [0, 0.5, 0],
  };

  const sunRef = useRef();

  let ambientLightIntensity = 0.2;
  let maxVelLimit = 5.5;
  if (difficulty === 'Easy') { ambientLightIntensity = 0.3; }
  else if (difficulty === 'Hard') { ambientLightIntensity = 0.1; }

  const animationSet = { idle: 'Idle', walk: 'Walk', run: 'Run', jump: 'Jump', jumpIdle: 'JumpIdle', jumpLand: 'JumpLand', fall: 'Fall' };

  // NEW: Added 'interact' key (F)
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
    { name: 'interact', keys: ['KeyF'] },
  ];

  const handleEnterDoor = (doorId) => {
    console.log("Entering door:", doorId);
    if (doorId === 'hallway_1' || doorId === 'hallway') {
      setMapReady(false); // Pauses character so they don't fall into the void
      setCurrentMap('hallway');
      setActiveDoor(null); // Clear the UI prompt
    } else if (doorId === 'hallway3') {
      setMapReady(false);
      setCurrentMap('hallway3');
      setActiveDoor(null);
    } else if (doorId === 'hallway4') {
      setMapReady(false);
      setCurrentMap('hallway4');
      setActiveDoor(null);
    } else if (doorId === 'exit' || doorId === 'city') {
      setMapReady(false);
      setCurrentMap('city');
      setActiveDoor(null);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

      {/* --- NEW LOADING SCREEN --- */}
      {!mapReady && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999, background: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fcd34d', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '10px' }}>Loading Map...</h1>
          <p>Downloading high-resolution textures...</p>
        </div>
      )}

      {/* Objective UI */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: 'rgba(0, 0, 0, 0.7)', color: '#fcd34d', padding: '15px 25px', borderRadius: '8px', border: '1px solid #d97706', fontFamily: 'serif', fontSize: '20px', fontWeight: 'bold', pointerEvents: 'none' }}>
        Objective: {objective}
      </div>

      {/* Interaction UI */}
      {activeDoor && (
        <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 30px', borderRadius: '8px', fontSize: '24px', border: '2px solid #fcd34d', pointerEvents: 'none' }}>
          Press [ F ] to Enter
        </div>
      )}

      <KeyboardControls map={keyboardMap}>
        <Canvas shadows="PCFSoft" camera={{ position: [0, 5, 10], fov: 65, near: 0.01 }}>
          <Suspense fallback={null}>
            {currentMap === 'city' && <SkyDome />}
          </Suspense>

          <InteractionManager activeDoor={activeDoor} onEnterDoor={handleEnterDoor} />

          <ambientLight intensity={ambientLightIntensity} />
          <directionalLight ref={sunRef} castShadow position={[30, 50, 30]} intensity={3} shadow-mapSize={[2048, 2048]} shadow-camera-left={-100} shadow-camera-right={100} shadow-camera-top={100} shadow-camera-bottom={-100} shadow-camera-near={0.1} shadow-camera-far={300} shadow-bias={-0.0005} />
          <directionalLight position={[-20, 30, -20]} intensity={0.5} />

          <Suspense fallback={null}>
            <Physics debug={false}>

              {/* --- MAP MANAGER --- */}
              {currentMap === 'city' && (
                <group key="map-city">
                  <StreetMap position={[0, 0, 0]} onLoad={() => setMapReady(true)} />
                  <RigidBody type="fixed" position={[0, 0.01, 0]}>
                    <mesh><boxGeometry args={[500, 0.01, 500]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>

                  {/* First door set to hallway_1 */}
                  <DoorMarker position={[0, 1, 14.3]} doorId="hallway_1" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                  <DoorMarker position={[13.1, 1, -14.2]} doorId="hallway3" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                  <DoorMarker position={[8, 1, -8.3]} doorId="hallway4" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                </group>
              )}

              {/* --- HALLWAY 1 --- */}
              {currentMap === 'hallway' && (
                <group key="map-hallway">
                  <Hallway modelPath="/hallway.glb" position={[0, 0, 0]} onLoad={() => setMapReady(true)} />
                  <RigidBody type="fixed" position={[0, 0.01, 0]}>
                    <mesh><boxGeometry args={[500, 0.01, 500]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>
                  <pointLight castShadow position={[0.55, 0.9, -4.9]} color="#ff9900" intensity={4} distance={10} decay={2} />
                  <pointLight castShadow position={[-0.6, 0.8, -0.1]} color="#ff9900" intensity={4} distance={10} decay={2} />

                  {/* Adjustable Markers for Hallway 1 doors */}
                  <DoorMarker position={[0, 1, -4.5]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                  <DoorMarker position={[-0.6, 1, 0.5]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                </group>
              )}

              {/* --- HALLWAY 3 --- */}
              {currentMap === 'hallway3' && (
                <group key="map-hallway3">
                  <Hallway modelPath="/hallway3.glb" position={[0, 0, 0]} colliders={false} onLoad={() => setMapReady(true)} />
                  {/* Floor collider */}
                  <RigidBody type="fixed" position={[0, 0.01, 0]}>
                    <mesh><boxGeometry args={[500, 0.01, 500]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>

                  {/* === MANUAL WALL COLLIDERS (invisible) === */}
                  {/* Left wall */}
                  <RigidBody type="fixed" position={[-0.65, 1, 0]}>
                    <mesh><boxGeometry args={[0.1, 3, 5]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>
                  {/* Right wall */}
                  <RigidBody type="fixed" position={[0.65, 1, 0]}>
                    <mesh><boxGeometry args={[0.1, 3, 5]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>
                  {/* Back wall (far -Z end) */}
                  <RigidBody type="fixed" position={[0, 1, -2.2]}>
                    <mesh><boxGeometry args={[1.5, 3, 0.1]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>
                  {/* Front wall (far +Z end) */}
                  <RigidBody type="fixed" position={[0, 1, 2.2]}>
                    <mesh><boxGeometry args={[1.5, 3, 0.1]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>

                  {/* Adjust these light positions for Hallway 3! */}
                  <pointLight castShadow position={[0, 0.8, -1.8]} color="#ff9900" intensity={4} distance={10} decay={2} />
                  <pointLight castShadow position={[0, 0.8, 1.8]} color="#ff9900" intensity={4} distance={10} decay={2} />

                  {/* Adjustable Markers for Hallway 3 doors */}
                  <DoorMarker position={[0, 1, -1.7]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                  <DoorMarker position={[0, 1, 1.7]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                </group>
              )}

              {/* --- HALLWAY 4 --- */}
              {currentMap === 'hallway4' && (
                <group key="map-hallway4">
                  <Hallway modelPath="/hallway4.glb" position={[0, 0, 0]} onLoad={() => setMapReady(true)} />
                  <RigidBody type="fixed" position={[0, 0.01, 0]}>
                    <mesh><boxGeometry args={[500, 0.01, 500]} /><meshBasicMaterial transparent opacity={0} /></mesh>
                  </RigidBody>
                  {/* Adjust these light positions for Hallway 4! */}
                  <pointLight castShadow position={[-0.66, 1, -0.82]} color="#ff9900" intensity={4} distance={10} decay={2} />
                  <pointLight castShadow position={[-0.66, 1, 0.9]} color="#ff9900" intensity={4} distance={10} decay={2} />

                  {/* Adjustable Markers for Hallway 4 doors */}
                  <DoorMarker position={[-0.1, 1, -2.1]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                  <DoorMarker position={[-0.66, 1, -0.1]} doorId="city" onEnter={setActiveDoor} onExit={() => setActiveDoor(null)} />
                </group>
              )}

              {/* CHARACTER LOADS SECOND */}
              {mapReady && (
                <Ecctrl
                  key={`player-${currentMap}`} // Force remount on map change to reset physics position
                  animated={true}
                  animationSet={animationSet}
                  // ANY map that is not 'city' is indoors. Snap to First-Person!
                  camInitDis={currentMap !== 'city' ? -0.1 : -3}
                  camMaxDis={currentMap !== 'city' ? -0.1 : -5}
                  camCollision={currentMap === 'city'}
                  maxVelLimit={maxVelLimit}
                  jumpVel={0}
                  position={spawnPositions[currentMap] || [0, 0.9, 0]}
                  radius={0.15}
                  halfHeight={0.3}
                >
                  <Detective scale={[0.55, 0.55, 0.55]} position={[0, -0.9, 0]} />
                </Ecctrl>
              )}

            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

useGLTF.preload('/streetMap.glb');
useGLTF.preload('/hallway.glb');
useGLTF.preload('/hallway3.glb');
useGLTF.preload('/hallway4.glb');
