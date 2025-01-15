import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const InteractiveBackground = () => {
    const containerRef = useRef(null);
    const mousePosition = useRef({ x: 0, y: 0 });
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    
    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup with a softer background color
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#FDF8FF');
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            alpha: false
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor('#FDF8FF', 1);
        containerRef.current.appendChild(renderer.domElement);
        
        camera.position.z = 30;
        
        // Create more vibrant particles with increased count
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 4000; // Increased particle count
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        const sizes = new Float32Array(particlesCount);
        const originalPositions = new Float32Array(particlesCount * 3);
        
        const color1 = new THREE.Color('#8B4C70'); // Iris
        const color2 = new THREE.Color('#E8DFF5'); // Light purple
        const color3 = new THREE.Color('#F5E6E8'); // Misty rose
        
        for(let i = 0; i < particlesCount * 3; i += 3) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 50;
            
            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;
            
            originalPositions[i] = x;
            originalPositions[i + 1] = y;
            originalPositions[i + 2] = z;
            
            // Create a more vibrant color mix
            const colorChoice = Math.random();
            let mixedColor;
            if (colorChoice < 0.33) {
                mixedColor = color1.clone();
            } else if (colorChoice < 0.66) {
                mixedColor = color2.clone();
            } else {
                mixedColor = color3.clone();
            }
            
            colors[i] = mixedColor.r;
            colors[i + 1] = mixedColor.g;
            colors[i + 2] = mixedColor.b;
            
            // Vary particle sizes
            sizes[i / 3] = Math.random() * 0.3 + 0.1;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create custom shader material for better-looking particles
        const particlesMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        
        // Enhanced lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const pointLight1 = new THREE.PointLight(0x8B4C70, 3);
        pointLight1.position.set(25, 25, 25);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xF5E6E8, 3);
        pointLight2.position.set(-25, -25, 25);
        scene.add(pointLight2);
        
        // Mouse interaction
        const onMouseMove = (event) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            mousePosition.current = {
                x: event.clientX - window.innerWidth / 2,
                y: -(event.clientY - window.innerHeight / 2)
            };
        };
        
        window.addEventListener('mousemove', onMouseMove);
        
        // Animation loop with enhanced interactivity
        let frame = 0;
        const clock = new THREE.Clock();
        
        const animate = () => {
            frame = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            // Update particles with more natural movement
            const positions = particlesGeometry.attributes.position.array;
            const sizes = particlesGeometry.attributes.size.array;
            
            for(let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                const dx = mousePosition.current.x / 50 - x;
                const dy = mousePosition.current.y / 50 - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 10) {
                    const force = (1 - dist / 10) * 0.015;
                    positions[i] += dx * force;
                    positions[i + 1] += dy * force;
                    
                    // Make particles slightly larger when near mouse
                    sizes[i / 3] = Math.min(sizes[i / 3] * 1.01, 0.5);
                } else {
                    positions[i] += (originalPositions[i] - positions[i]) * 0.015;
                    positions[i + 1] += (originalPositions[i + 1] - positions[i + 1]) * 0.015;
                    positions[i + 2] += (originalPositions[i + 2] - positions[i + 2]) * 0.015;
                    
                    // Return particles to original size
                    sizes[i / 3] *= 0.99;
                    if (sizes[i / 3] < 0.1) sizes[i / 3] = 0.1;
                }
                
                // Add subtle wave motion
                positions[i + 2] = originalPositions[i + 2] + Math.sin(elapsedTime + x * 0.1) * 0.5;
            }
            
            particlesGeometry.attributes.position.needsUpdate = true;
            particlesGeometry.attributes.size.needsUpdate = true;
            
            // Gentle particle system rotation
            particlesMesh.rotation.y = Math.sin(elapsedTime * 0.1) * 0.1;
            particlesMesh.rotation.x = Math.cos(elapsedTime * 0.1) * 0.1;
            
            renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frame);
            
            if (containerRef.current?.contains(renderer.domElement)) {
                containerRef.current.removeChild(renderer.domElement);
            }
            
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            renderer.dispose();
        };
    }, []);
    
    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full"
            style={{
                zIndex: 0,
                background: 'linear-gradient(135deg, rgba(139, 76, 112, 0.03), rgba(245, 230, 232, 0.03))'
            }}
        />
    );
};

export default InteractiveBackground; 