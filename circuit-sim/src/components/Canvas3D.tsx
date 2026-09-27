import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PlacedComponent, WireConnection } from '../types';
import { COMPONENT_CATALOG } from '../catalog';

interface Canvas3DProps {
  components: PlacedComponent[];
  wires: WireConnection[];
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  isRunning: boolean;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({
  components,
  wires,
  selectedId,
  onSelectComponent,
  isRunning,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#10141d');
    scene.fog = new THREE.FogExp2('#10141d', 0.0015);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(200, 350, 450);
    camera.lookAt(200, 0, 150);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(300, 500, 300);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(2000, 80, 0x3b82f6, 0x1e293b);
    gridHelper.position.set(200, -2, 200);
    scene.add(gridHelper);

    // --- Component 3D Model Builders ---
    const buildComponentModel = (comp: PlacedComponent): THREE.Group => {
      const group = new THREE.Group();
      group.position.set(comp.x, 0, comp.y);
      group.rotation.y = (comp.rotation * Math.PI) / 180;
      group.userData = { id: comp.id };

      switch (comp.type) {
        case 'arduino-uno': {
          // PCB Board
          const pcbGeo = new THREE.BoxGeometry(160, 6, 110);
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x006699, roughness: 0.3 });
          const pcb = new THREE.Mesh(pcbGeo, pcbMat);
          pcb.position.set(0, 3, 0);
          pcb.castShadow = true;
          group.add(pcb);

          // USB Connector
          const usbGeo = new THREE.BoxGeometry(30, 20, 25);
          const usbMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });
          const usb = new THREE.Mesh(usbGeo, usbMat);
          usb.position.set(-65, 12, -30);
          group.add(usb);

          // ATmega328 Chip
          const chipGeo = new THREE.BoxGeometry(70, 8, 20);
          const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
          const chip = new THREE.Mesh(chipGeo, chipMat);
          chip.position.set(10, 8, 15);
          group.add(chip);
          break;
        }

        case 'breadboard-mini': {
          // Mini Breadboard (170 tie points, 200x120)
          const bbGeo = new THREE.BoxGeometry(200, 14, 120);
          const bbMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.05 });
          const bb = new THREE.Mesh(bbGeo, bbMat);
          bb.position.set(0, 7, 0);
          bb.castShadow = true;
          bb.receiveShadow = true;
          group.add(bb);

          const foamGeo = new THREE.BoxGeometry(198, 2, 118);
          const foamMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
          const foam = new THREE.Mesh(foamGeo, foamMat);
          foam.position.set(0, 1, 0);
          group.add(foam);

          const troughGeo = new THREE.BoxGeometry(180, 4, 8);
          const troughMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
          const trough = new THREE.Mesh(troughGeo, troughMat);
          trough.position.set(0, 12.5, 0);
          group.add(trough);

          const socketGeo = new THREE.BoxGeometry(4, 2, 4);
          const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.4 });
          const instancedSockets = new THREE.InstancedMesh(socketGeo, socketMat, 17 * 10);
          const dummy = new THREE.Object3D();
          let idx = 0;
          const startX = -75;
          const stepX = 9.3;

          for (let col = 0; col < 17; col++) {
            const posX = startX + col * stepX;
            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, -38 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }
            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, 10 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }
          }
          instancedSockets.instanceMatrix.needsUpdate = true;
          group.add(instancedSockets);
          break;
        }

        case 'breadboard-full': {
          // Full Breadboard (830 tie points, 680x180)
          const bbGeo = new THREE.BoxGeometry(680, 14, 180);
          const bbMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.05 });
          const bb = new THREE.Mesh(bbGeo, bbMat);
          bb.position.set(0, 7, 0);
          bb.castShadow = true;
          bb.receiveShadow = true;
          group.add(bb);

          const foamGeo = new THREE.BoxGeometry(678, 2, 178);
          const foamMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
          const foam = new THREE.Mesh(foamGeo, foamMat);
          foam.position.set(0, 1, 0);
          group.add(foam);

          const troughGeo = new THREE.BoxGeometry(650, 4, 10);
          const troughMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
          const trough = new THREE.Mesh(troughGeo, troughMat);
          trough.position.set(0, 12.5, 0);
          group.add(trough);

          const railGrooveGeo = new THREE.BoxGeometry(650, 3, 4);
          const grooveMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
          const topGroove = new THREE.Mesh(railGrooveGeo, grooveMat);
          topGroove.position.set(0, 13, -58);
          group.add(topGroove);

          const botGroove = new THREE.Mesh(railGrooveGeo, grooveMat);
          botGroove.position.set(0, 13, 58);
          group.add(botGroove);

          const stripeGeo = new THREE.BoxGeometry(640, 1.2, 2.5);
          const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const blueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

          const topRed = new THREE.Mesh(stripeGeo, redMat);
          topRed.position.set(0, 14.1, -74);
          group.add(topRed);

          const topBlue = new THREE.Mesh(stripeGeo, blueMat);
          topBlue.position.set(0, 14.1, -64);
          group.add(topBlue);

          const botRed = new THREE.Mesh(stripeGeo, redMat);
          botRed.position.set(0, 14.1, 64);
          group.add(botRed);

          const botBlue = new THREE.Mesh(stripeGeo, blueMat);
          botBlue.position.set(0, 14.1, 74);
          group.add(botBlue);

          const socketGeo = new THREE.BoxGeometry(4, 2, 4);
          const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.4 });
          const instancedSockets = new THREE.InstancedMesh(socketGeo, socketMat, 63 * 14);
          const dummy = new THREE.Object3D();
          let idx = 0;

          const startX = -310;
          const stepX = 10;

          for (let col = 0; col < 63; col++) {
            const posX = startX + col * stepX;
            dummy.position.set(posX, 13.8, -78);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            dummy.position.set(posX, 13.8, -68);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, -46 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }

            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, 18 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }

            dummy.position.set(posX, 13.8, 68);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            dummy.position.set(posX, 13.8, 78);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);
          }

          instancedSockets.instanceMatrix.needsUpdate = true;
          group.add(instancedSockets);
          break;
        }

        case 'breadboard-half': {
          // Main white ABS plastic body
          const bbGeo = new THREE.BoxGeometry(340, 14, 180);
          const bbMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.05 });
          const bb = new THREE.Mesh(bbGeo, bbMat);
          bb.position.set(0, 7, 0);
          bb.castShadow = true;
          bb.receiveShadow = true;
          group.add(bb);

          // Foam adhesive backing pad under breadboard
          const foamGeo = new THREE.BoxGeometry(338, 2, 178);
          const foamMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
          const foam = new THREE.Mesh(foamGeo, foamMat);
          foam.position.set(0, 1, 0);
          group.add(foam);

          // Recessed center divider channel (DIP socket trough)
          const troughGeo = new THREE.BoxGeometry(320, 4, 10);
          const troughMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
          const trough = new THREE.Mesh(troughGeo, troughMat);
          trough.position.set(0, 12.5, 0);
          group.add(trough);

          // Top and Bottom Power Rail Grooves
          const railGrooveGeo = new THREE.BoxGeometry(320, 3, 4);
          const grooveMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
          
          const topGroove = new THREE.Mesh(railGrooveGeo, grooveMat);
          topGroove.position.set(0, 13, -58);
          group.add(topGroove);

          const botGroove = new THREE.Mesh(railGrooveGeo, grooveMat);
          botGroove.position.set(0, 13, 58);
          group.add(botGroove);

          // Red (+) and Blue (-) Power Stripe Lines
          const stripeGeo = new THREE.BoxGeometry(310, 1.2, 2.5);
          const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const blueMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });

          // Top Power Rail Stripes
          const topRed = new THREE.Mesh(stripeGeo, redMat);
          topRed.position.set(0, 14.1, -74);
          group.add(topRed);

          const topBlue = new THREE.Mesh(stripeGeo, blueMat);
          topBlue.position.set(0, 14.1, -64);
          group.add(topBlue);

          // Bottom Power Rail Stripes
          const botRed = new THREE.Mesh(stripeGeo, redMat);
          botRed.position.set(0, 14.1, 64);
          group.add(botRed);

          const botBlue = new THREE.Mesh(stripeGeo, blueMat);
          botBlue.position.set(0, 14.1, 74);
          group.add(botBlue);

          // 420 Metallic Pin Sockets (30 Columns x 10 Terminal Rows + Power Rail Holes)
          const socketGeo = new THREE.BoxGeometry(4, 2, 4);
          const socketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.4 });

          const totalSockets = 30 * 14;
          const instancedSockets = new THREE.InstancedMesh(socketGeo, socketMat, totalSockets);
          const dummy = new THREE.Object3D();
          let idx = 0;

          const startX = -135;
          const stepX = 9.3;

          for (let col = 0; col < 30; col++) {
            const posX = startX + col * stepX;

            // Top Power Rail Sockets (2 rows)
            dummy.position.set(posX, 13.8, -78);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            dummy.position.set(posX, 13.8, -68);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            // Top Terminal Rows (a, b, c, d, e)
            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, -46 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }

            // Bottom Terminal Rows (f, g, h, i, j)
            for (let row = 0; row < 5; row++) {
              dummy.position.set(posX, 13.8, 18 + row * 7);
              dummy.updateMatrix();
              instancedSockets.setMatrixAt(idx++, dummy.matrix);
            }

            // Bottom Power Rail Sockets (2 rows)
            dummy.position.set(posX, 13.8, 68);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);

            dummy.position.set(posX, 13.8, 78);
            dummy.updateMatrix();
            instancedSockets.setMatrixAt(idx++, dummy.matrix);
          }

          instancedSockets.instanceMatrix.needsUpdate = true;
          group.add(instancedSockets);
          break;
        }

        case 'led': {
          const isLit = comp.props?.value || comp.state?.ledOn;
          const ledMat = new THREE.MeshPhysicalMaterial({
            color: comp.props?.color === 'red' ? 0xef4444 : 0x22c55e,
            emissive: isLit ? (comp.props?.color === 'red' ? 0xff0000 : 0x00ff00) : 0x000000,
            emissiveIntensity: isLit ? 1.5 : 0,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
          });
          const ledGeo = new THREE.CylinderGeometry(12, 12, 25, 32);
          const ledDome = new THREE.SphereGeometry(12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);

          const cylinder = new THREE.Mesh(ledGeo, ledMat);
          cylinder.position.set(0, 12.5, 0);
          const dome = new THREE.Mesh(ledDome, ledMat);
          dome.position.set(0, 25, 0);

          group.add(cylinder);
          group.add(dome);
          break;
        }

        case 'resistor': {
          const bodyGeo = new THREE.CylinderGeometry(6, 6, 35, 16);
          bodyGeo.rotateZ(Math.PI / 2);
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4b886, roughness: 0.6 });
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.set(0, 10, 0);
          group.add(body);
          break;
        }

        case 'buzzer': {
          const buzGeo = new THREE.CylinderGeometry(20, 20, 18, 32);
          const buzMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
          const buz = new THREE.Mesh(buzGeo, buzMat);
          buz.position.set(0, 9, 0);
          group.add(buz);
          break;
        }

        case 'pushbutton': {
          const baseGeo = new THREE.BoxGeometry(30, 8, 30);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
          const base = new THREE.Mesh(baseGeo, baseMat);
          base.position.set(0, 4, 0);
          group.add(base);

          const btnGeo = new THREE.CylinderGeometry(10, 10, 8, 16);
          const btnMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2 });
          const btn = new THREE.Mesh(btnGeo, btnMat);
          btn.position.set(0, 10, 0);
          group.add(btn);
          break;
        }

        case 'relay-5v': {
          // PCB Substrate Board
          const pcbGeo = new THREE.BoxGeometry(140, 4, 100);
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
          const pcb = new THREE.Mesh(pcbGeo, pcbMat);
          pcb.position.set(0, 2, 0);
          pcb.castShadow = true;
          group.add(pcb);

          // Songle Relay Box
          const isActive = isRunning && comp.state?.active;
          const relayGeo = new THREE.BoxGeometry(60, 36, 48);
          const relayMat = new THREE.MeshStandardMaterial({
            color: isActive ? 0x2563eb : 0x1d4ed8,
            roughness: 0.3,
            metalness: 0.1,
          });
          const relay = new THREE.Mesh(relayGeo, relayMat);
          relay.position.set(0, 20, 5);
          relay.castShadow = true;
          group.add(relay);

          // Screw Terminal Block (NO, COM, NC)
          const termGeo = new THREE.BoxGeometry(110, 18, 22);
          const termMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
          const term = new THREE.Mesh(termGeo, termMat);
          term.position.set(0, 11, -35);
          group.add(term);

          // Silver Terminal Screws
          const screwGeo = new THREE.CylinderGeometry(3.5, 3.5, 3, 16);
          const screwMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
          [-42, 0, 42].forEach((xOff) => {
            const screw = new THREE.Mesh(screwGeo, screwMat);
            screw.position.set(xOff, 20, -35);
            group.add(screw);
          });

          // Indicator LEDs (Red PWR, Green Signal)
          const ledPwrGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
          const ledPwrMat = new THREE.MeshStandardMaterial({
            color: isRunning ? 0xef4444 : 0x475569,
            emissive: isRunning ? 0xef4444 : 0x000000,
            emissiveIntensity: isRunning ? 0.8 : 0,
          });
          const ledPwr = new THREE.Mesh(ledPwrGeo, ledPwrMat);
          ledPwr.position.set(-52, 5, 38);
          group.add(ledPwr);

          const ledSigMat = new THREE.MeshStandardMaterial({
            color: isActive ? 0x10b981 : 0x475569,
            emissive: isActive ? 0x10b981 : 0x000000,
            emissiveIntensity: isActive ? 0.9 : 0,
          });
          const ledSig = new THREE.Mesh(ledPwrGeo, ledSigMat);
          ledSig.position.set(-38, 5, 38);
          group.add(ledSig);
          break;
        }

        case 'relay-5v-2ch': {
          // PCB Substrate Board
          const pcbGeo = new THREE.BoxGeometry(200, 4, 110);
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
          const pcb = new THREE.Mesh(pcbGeo, pcbMat);
          pcb.position.set(0, 2, 0);
          pcb.castShadow = true;
          group.add(pcb);

          // Dual Songle Relay Cubes
          const isActive1 = isRunning && comp.state?.active1;
          const isActive2 = isRunning && comp.state?.active2;
          const relayGeo = new THREE.BoxGeometry(54, 36, 48);

          const relay1Mat = new THREE.MeshStandardMaterial({
            color: isActive1 ? 0x2563eb : 0x1d4ed8,
            roughness: 0.3,
          });
          const relay1 = new THREE.Mesh(relayGeo, relay1Mat);
          relay1.position.set(-46, 20, 5);
          relay1.castShadow = true;
          group.add(relay1);

          const relay2Mat = new THREE.MeshStandardMaterial({
            color: isActive2 ? 0x2563eb : 0x1d4ed8,
            roughness: 0.3,
          });
          const relay2 = new THREE.Mesh(relayGeo, relay2Mat);
          relay2.position.set(46, 20, 5);
          relay2.castShadow = true;
          group.add(relay2);

          // Terminal Blocks
          const termGeo = new THREE.BoxGeometry(85, 18, 22);
          const termMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
          const term1 = new THREE.Mesh(termGeo, termMat);
          term1.position.set(-46, 11, -38);
          group.add(term1);

          const term2 = new THREE.Mesh(termGeo, termMat);
          term2.position.set(46, 11, -38);
          group.add(term2);

          // Screw Heads
          const screwGeo = new THREE.CylinderGeometry(3, 3, 3, 16);
          const screwMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
          [-76, -46, -16, 16, 46, 76].forEach((xOff) => {
            const screw = new THREE.Mesh(screwGeo, screwMat);
            screw.position.set(xOff, 20, -38);
            group.add(screw);
          });

          // Indicator LEDs
          const ledGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
          const ledPwrMat = new THREE.MeshStandardMaterial({
            color: isRunning ? 0xef4444 : 0x475569,
            emissive: isRunning ? 0xef4444 : 0x000000,
            emissiveIntensity: isRunning ? 0.8 : 0,
          });
          const ledPwr = new THREE.Mesh(ledGeo, ledPwrMat);
          ledPwr.position.set(-65, 5, 35);
          group.add(ledPwr);

          const ledSig1Mat = new THREE.MeshStandardMaterial({
            color: isActive1 ? 0x10b981 : 0x475569,
            emissive: isActive1 ? 0x10b981 : 0x000000,
            emissiveIntensity: isActive1 ? 0.9 : 0,
          });
          const ledSig1 = new THREE.Mesh(ledGeo, ledSig1Mat);
          ledSig1.position.set(-52, 5, 35);
          group.add(ledSig1);

          const ledSig2Mat = new THREE.MeshStandardMaterial({
            color: isActive2 ? 0x10b981 : 0x475569,
            emissive: isActive2 ? 0x10b981 : 0x000000,
            emissiveIntensity: isActive2 ? 0.9 : 0,
          });
          const ledSig2 = new THREE.Mesh(ledGeo, ledSig2Mat);
          ledSig2.position.set(-39, 5, 35);
          group.add(ledSig2);
          break;
        }

        case 'lm35': {
          // PCB Substrate Module Board
          const pcbGeo = new THREE.BoxGeometry(60, 4, 60);
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
          const pcb = new THREE.Mesh(pcbGeo, pcbMat);
          pcb.position.set(0, 2, 0);
          pcb.castShadow = true;
          group.add(pcb);

          // TO-92 Transistor / Sensor Epoxy Body
          const bodyGeo = new THREE.CylinderGeometry(12, 12, 24, 32);
          const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.set(0, 16, 0);
          body.castShadow = true;
          group.add(body);

          // Metallic Pin Terminals (VCC, OUT, GND)
          const pinGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 12);
          const pinMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.2 });
          [-14, 0, 14].forEach((xOff) => {
            const pinMesh = new THREE.Mesh(pinGeo, pinMat);
            pinMesh.position.set(xOff, 7, 15);
            group.add(pinMesh);
          });
          break;
        }

        case 'ir-sensor': {
          // PCB Module Substrate Board (Navy Blue)
          const pcbGeo = new THREE.BoxGeometry(80, 4, 60);
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
          const pcb = new THREE.Mesh(pcbGeo, pcbMat);
          pcb.position.set(0, 2, 0);
          pcb.castShadow = true;
          group.add(pcb);

          // Clear IR Emitter LED (Left)
          const emitterGeo = new THREE.CylinderGeometry(4, 4, 14, 16);
          const emitterMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.85 });
          const emitter = new THREE.Mesh(emitterGeo, emitterMat);
          emitter.rotation.x = Math.PI / 2;
          emitter.position.set(-16, 8, -28);
          group.add(emitter);

          // Dark Tinted IR Receiver Photodiode (Right)
          const rxGeo = new THREE.CylinderGeometry(4, 4, 14, 16);
          const rxMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.2 });
          const receiver = new THREE.Mesh(rxGeo, rxMat);
          receiver.rotation.x = Math.PI / 2;
          receiver.position.set(16, 8, -28);
          group.add(receiver);

          // LM393 Dual Comparator IC
          const chipGeo = new THREE.BoxGeometry(24, 5, 16);
          const chipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
          const chip = new THREE.Mesh(chipGeo, chipMat);
          chip.position.set(0, 5, 0);
          group.add(chip);

          // Blue Trimpot Potentiometer
          const potGeo = new THREE.BoxGeometry(14, 8, 14);
          const potMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
          const pot = new THREE.Mesh(potGeo, potMat);
          pot.position.set(-20, 6, 8);
          group.add(pot);

          // 3-Pin Header Pins (VCC, GND, OUT)
          const pinGeo = new THREE.CylinderGeometry(1.2, 1.2, 12, 12);
          const pinMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
          [-20, 0, 20].forEach((xOff) => {
            const pinMesh = new THREE.Mesh(pinGeo, pinMat);
            pinMesh.position.set(xOff, 6, 25);
            group.add(pinMesh);
          });
          break;
        }

        default: {
          // Generic component block
          const boxGeo = new THREE.BoxGeometry(50, 15, 40);
          const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
          const box = new THREE.Mesh(boxGeo, boxMat);
          box.position.set(0, 7.5, 0);
          group.add(box);
        }
      }

      // Selection highlight ring
      if (comp.id === selectedId) {
        const ringGeo = new THREE.RingGeometry(40, 44, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 1, 0);
        group.add(ring);
      }

      return group;
    };

    // Render placed components
    const compGroupMap = new Map<string, THREE.Group>();
    components.forEach((comp) => {
      const model = buildComponentModel(comp);
      scene.add(model);
      compGroupMap.set(comp.id, model);
    });

    // Helper to calculate exact 3D pin coordinates
    const get3DPinCoords = (comp: PlacedComponent, pinId: string) => {
      const compDef = COMPONENT_CATALOG.find((cat) => cat.type === comp.type);
      const pin = compDef?.pins.find((p) => p.id === pinId);
      const width = compDef?.width || 140;
      const height = compDef?.height || 90;
      const pinX = pin?.x ?? width / 2;
      const pinY = pin?.y ?? height / 2;

      const cx = width / 2;
      const cy = height / 2;
      const dx = pinX - cx;
      const dy = pinY - cy;

      const rad = (comp.rotation * Math.PI) / 180;
      const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotatedZ = dx * Math.sin(rad) + dy * Math.cos(rad);

      return new THREE.Vector3(comp.x + rotatedX, 14, comp.y + rotatedZ);
    };

    // --- Wire Particle Curves ---
    const wireParticleSystems: { mesh: THREE.InstancedMesh; curve: THREE.CatmullRomCurve3 }[] = [];

    wires.forEach((w) => {
      const fromComp = components.find((c) => c.id === w.fromComponentId);
      const toComp = components.find((c) => c.id === w.toComponentId);
      if (!fromComp || !toComp) return;

      const p1 = get3DPinCoords(fromComp, w.fromPinId);
      const p2 = get3DPinCoords(toComp, w.toPinId);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 8; // Slight lift above surface for neat pin-to-pin wire

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 2.5, 8, false);
      const wireColor = w.color === 'red' ? 0xef4444 : w.color === 'black' ? 0x111111 : 0x3b82f6;
      const tubeMat = new THREE.MeshStandardMaterial({ color: wireColor, roughness: 0.3 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);

      // Terminal pin plugs at wire endpoints
      const plugGeo = new THREE.CylinderGeometry(2, 2, 4, 16);
      const plugMat = new THREE.MeshStandardMaterial({ color: wireColor, metalness: 0.6 });
      
      const plug1 = new THREE.Mesh(plugGeo, plugMat);
      plug1.position.copy(p1);
      scene.add(plug1);

      const plug2 = new THREE.Mesh(plugGeo, plugMat);
      plug2.position.copy(p2);
      scene.add(plug2);

      // Current particle animation dots when simulation is active
      if (isRunning) {
        const particleGeo = new THREE.SphereGeometry(2, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const instancedMesh = new THREE.InstancedMesh(particleGeo, particleMat, 6);

        scene.add(instancedMesh);
        wireParticleSystems.push({ mesh: instancedMesh, curve });
      }
    });

    // --- Animation Loop & Orbit Pan controls ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate current flow particles along wire curves
      if (isRunning) {
        wireParticleSystems.forEach(({ mesh, curve }) => {
          const dummy = new THREE.Object3D();
          for (let i = 0; i < 6; i++) {
            const t = ((elapsed * 0.8 + i / 6) % 1.0);
            const pt = curve.getPoint(t);
            dummy.position.copy(pt);
            dummy.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.5);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
          }
          mesh.instanceMatrix.needsUpdate = true;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Mouse Click Object Pick ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundId: string | null = null;
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== scene) {
          if (parent.userData?.id) {
            foundId = parent.userData.id;
            break;
          }
          parent = parent.parent;
        }
        if (foundId) break;
      }

      onSelectComponent(foundId);
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [components, wires, selectedId, isRunning, onSelectComponent]);

  return <div ref={mountRef} className="canvas-3d-container" style={{ width: '100%', height: '100%' }} />;
};
