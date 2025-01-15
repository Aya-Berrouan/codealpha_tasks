import { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const colors = ['#FF5AAF', '#60B5FF', '#A1F55D', '#FFD761', '#B66DFF'];

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Particle Class
    class Particle {
      constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.velocityX = (Math.random() - 0.5) * 2;
        this.velocityY = (Math.random() - 0.5) * 2;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update(mouseX, mouseY) {
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Bounce on edges
        if (this.x < 0 || this.x > canvas.width) this.velocityX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.velocityY *= -1;

        // React to mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.x += dx / 10;
          this.y += dy / 10;
        }

        this.draw();
      }
    }

    // Create Particles
    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 150; i++) {
        const size = Math.random() * 5 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, size, color));
      }
    };

    // Animation state
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => particle.update(mouseX, mouseY));
      animationFrameId = requestAnimationFrame(animate);
    };

    // Event Listeners
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    };

    const handleResize = () => {
      setCanvasSize();
      createParticles();
    };

    // Initialize
    createParticles();
    animate();

    // Add event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'linear-gradient(135deg, rgba(255,90,175,0.1), rgba(96,181,255,0.1), rgba(161,245,93,0.1))' }}
    />
  );
}; 