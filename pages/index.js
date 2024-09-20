import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import * as THREE from 'three';

const PoolGame = () => {
  const mountRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create pool table
    const tableGeometry = new THREE.BoxGeometry(10, 0.5, 5);
    const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    scene.add(table);

    // Create pool ball
    const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0.5, 0);
    scene.add(ball);

    camera.position.z = 10;

    // Socket.io setup
    socketRef.current = io();

    socketRef.current.on('updateBallPosition', (position) => {
      ball.position.set(position.x, position.y, position.z);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      socketRef.current.disconnect();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  const handleClick = () => {
    // Send ball movement to server
    socketRef.current.emit('moveBall', { x: Math.random() * 5 - 2.5, y: 0.5, z: Math.random() * 2.5 - 1.25 });
  };

  return (
    <div>
      <div ref={mountRef} />
      <button onClick={handleClick} style={{ position: 'absolute', top: 10, left: 10 }}>Move Ball</button>
    </div>
  );
};

export default PoolGame;
