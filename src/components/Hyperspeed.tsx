import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer, EffectPass, RenderPass, BloomEffect } from 'postprocessing';

interface HyperspeedProps {
  effectOptions?: any;
}

const Hyperspeed: React.FC<HyperspeedProps> = ({ effectOptions }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => ({
    distortion: "turbulentDistortion",
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [12, 80],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131313,
      brokenLines: 0x131313,
      leftCars: [0xd8af37, 0x674b02, 0xc2410c],
      rightCars: [0x03b3b3, 0x0e5f5f, 0x32454d],
      sticks: 0xd8af37
    },
    ...effectOptions
  }), [effectOptions]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(options.fov, width / height, 0.1, 10000);
    camera.position.z = -5;
    camera.position.y = 7;
    camera.position.x = 0;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: false
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    containerRef.current.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomEffect = new BloomEffect({
      intensity: 1.5,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.9,
      mipmapBlur: true,
    });
    
    composer.addPass(new EffectPass(camera, bloomEffect));

    // Shaders
    const distortionShaders: any = {
      turbulentDistortion: {
        uniforms: {
          uAmplitude: { value: new THREE.Vector2(2, 5) },
          uFreq: { value: new THREE.Vector2(4, 8) }
        },
        getDistortion: `
          uniform vec2 uAmplitude;
          uniform vec2 uFreq;
          #define PI 3.14159265358979
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          vec3 getDistortion(float progress){
            float xAmp = uAmplitude.x;
            float yAmp = uAmplitude.y;
            float xFreq = uFreq.x;
            float yFreq = uFreq.y;
            float x = sin(progress * PI * xFreq) * xAmp;
            float y = cos(progress * PI * yFreq) * yAmp;
            return vec3(x, y, 0.);
          }
        `
      }
    };

    const distortion = distortionShaders[options.distortion] || distortionShaders.turbulentDistortion;

    // Base Material for streaks
    const streakShader = {
      uniforms: {
        uColor: { value: new THREE.Color(0xffffff) },
        uTime: { value: 0 },
        uTravelLength: { value: options.length },
        uFade: { value: new THREE.Vector2(options.carLightsFade, 1.0) },
        ...distortion.uniforms
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTravelLength;
        attribute vec3 aOffset;
        attribute vec3 aMetrics;
        varying float vProgress;
        ${distortion.getDistortion}
        void main() {
          vec3 pos = position;
          float radius = aMetrics.r;
          float len = aMetrics.g;
          float speed = aMetrics.b;
          
          float progress = mod(aOffset.z + uTime * speed, uTravelLength);
          vProgress = progress / uTravelLength;
          
          vec3 distortion = getDistortion(vProgress);
          pos.z *= len;
          pos.xy *= radius;
          pos += aOffset;
          pos.z += progress;
          pos.xy += distortion.xy;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec2 uFade;
        varying float vProgress;
        void main() {
          float alpha = smoothstep(uFade.x, uFade.y, vProgress);
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    };

    // Create Streaks
    const createInstancedStreaks = (count: number, colors: number[], isLeft: boolean) => {
      const geometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
      geometry.rotateX(Math.PI / 2);
      
      const instancedGeo = new THREE.InstancedBufferGeometry();
      instancedGeo.instanceCount = count;
      instancedGeo.setAttribute('position', geometry.getAttribute('position'));
      instancedGeo.setAttribute('normal', geometry.getAttribute('normal'));
      instancedGeo.setAttribute('uv', geometry.getAttribute('uv'));
      instancedGeo.setIndex(geometry.getIndex());
      
      const offsets = new Float32Array(count * 3);
      const metrics = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        const side = isLeft ? 1 : -1;
        const x = side * (options.islandWidth / 2 + Math.random() * options.roadWidth);
        const y = THREE.MathUtils.randFloat(options.carFloorSeparation[0], options.carFloorSeparation[1]);
        const z = Math.random() * options.length;
        
        offsets[i * 3] = x;
        offsets[i * 3 + 1] = y;
        offsets[i * 3 + 2] = z;
        
        const radius = THREE.MathUtils.randFloat(options.carLightsRadius[0], options.carLightsRadius[1]);
        const len = THREE.MathUtils.randFloat(options.carLightsLength[0], options.carLightsLength[1]);
        const speed = isLeft ? 
          THREE.MathUtils.randFloat(options.movingAwaySpeed[0], options.movingAwaySpeed[1]) :
          THREE.MathUtils.randFloat(options.movingCloserSpeed[0], options.movingCloserSpeed[1]);
          
        metrics[i * 3] = radius;
        metrics[i * 3 + 1] = len;
        metrics[i * 3 + 2] = speed;
      }
      
      instancedGeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
      instancedGeo.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(metrics, 3));
      
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      const material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(streakShader.uniforms),
        vertexShader: streakShader.vertexShader,
        fragmentShader: streakShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      material.uniforms.uColor.value = color;
      
      return new THREE.Mesh(instancedGeo, material);
    };

    const leftStreaks = createInstancedStreaks(options.lightPairsPerRoadWay, options.colors.leftCars, true);
    const rightStreaks = createInstancedStreaks(options.lightPairsPerRoadWay, options.colors.rightCars, false);
    scene.add(leftStreaks);
    scene.add(rightStreaks);

    // Light Sticks
    const createLightSticks = (count: number, color: number) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const instancedGeo = new THREE.InstancedBufferGeometry();
      instancedGeo.instanceCount = count;
      instancedGeo.setAttribute('position', geometry.getAttribute('position'));
      instancedGeo.setAttribute('normal', geometry.getAttribute('normal'));
      instancedGeo.setAttribute('uv', geometry.getAttribute('uv'));
      instancedGeo.setIndex(geometry.getIndex());
      
      const offsets = new Float32Array(count * 3);
      const metrics = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const x = side * (options.roadWidth + options.islandWidth / 2 + 2);
        const y = THREE.MathUtils.randFloat(0, 5);
        const z = Math.random() * options.length;
        
        offsets[i * 3] = x;
        offsets[i * 3 + 1] = y;
        offsets[i * 3 + 2] = z;
        
        const width = THREE.MathUtils.randFloat(options.lightStickWidth[0], options.lightStickWidth[1]);
        const height = THREE.MathUtils.randFloat(options.lightStickHeight[0], options.lightStickHeight[1]);
        const speed = THREE.MathUtils.randFloat(options.movingAwaySpeed[0], options.movingAwaySpeed[1]);
        
        metrics[i * 3] = width;
        metrics[i * 3 + 1] = height;
        metrics[i * 3 + 2] = speed;
      }
      
      instancedGeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
      instancedGeo.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(metrics, 3));
      
      const material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(streakShader.uniforms),
        vertexShader: `
          uniform float uTime;
          uniform float uTravelLength;
          attribute vec3 aOffset;
          attribute vec3 aMetrics;
          varying float vProgress;
          ${distortion.getDistortion}
          void main() {
            vec3 pos = position;
            float w = aMetrics.r;
            float h = aMetrics.g;
            float speed = aMetrics.b;
            
            float progress = mod(aOffset.z + uTime * speed, uTravelLength);
            vProgress = progress / uTravelLength;
            
            vec3 distortion = getDistortion(vProgress);
            pos.x *= w;
            pos.y *= h;
            pos += aOffset;
            pos.z += progress;
            pos.xy += distortion.xy;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: streakShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      material.uniforms.uColor.value = new THREE.Color(color);
      
      return new THREE.Mesh(instancedGeo, material);
    };

    const sticks = createLightSticks(options.totalSideLightSticks, options.colors.sticks);
    scene.add(sticks);

    // Road Plane
    const roadGeo = new THREE.PlaneGeometry(options.roadWidth * 4, options.length, 1, 100);
    const roadMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(options.colors.roadColor) },
        uTravelLength: { value: options.length },
        ...distortion.uniforms
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTravelLength;
        varying float vProgress;
        ${distortion.getDistortion}
        void main() {
          vec3 pos = position;
          vProgress = (pos.z + uTravelLength / 2.) / uTravelLength;
          vec3 distortion = getDistortion(vProgress);
          pos.x += distortion.x;
          pos.y += distortion.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = options.length / 2;
    scene.add(road);

    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();
      
      leftStreaks.material.uniforms.uTime.value = time;
      rightStreaks.material.uniforms.uTime.value = time;
      sticks.material.uniforms.uTime.value = time;
      road.material.uniforms.uTime.value = time;

      camera.lookAt(0, 0, options.length);
      composer.render();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      composer.dispose();
      renderer.dispose();
    };
  }, [options]);

  return <div ref={containerRef} className="absolute inset-0" />;
};

export default Hyperspeed;
