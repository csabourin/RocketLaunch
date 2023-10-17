window.onload = function() {
  let fireworkAnimationActive = false;  // New flag to control firework animation
  const urlParams = new URLSearchParams(window.location.search);
  const course = urlParams.get('course') || 'A new product!'; // Replace 'DEFAULT' with whatever fallback you'd like

    // Get canvas and context
  const canvas = document.getElementById("gameCanvas");
  const launchButton = document.getElementById("launchButton");
  const ctx = canvas.getContext("2d");
  let scaledHeight;
  let stars = [];
  let r = 135, g = 206, b = 250;  // Initial RGB values for sky blue


  // Load sprite
  const sprite = new Image();
  sprite.src = "sprite.png";

  const sprite2 = new Image();
  sprite2.src = "sprite2.png";
  let currentSprite = sprite;  // Keep track of the current sprite
  let frameCount = 0;  // Frame counter
  const frameSwitch = 10;  // Switch sprite every 10 frames

  // Initialize the sound
  const rocketSound = new Audio('zapsplat_launch.mp3');

  // Initial sprite coordinates
  let x = 0;
  let y = canvas.height;
  let particles = [];

  // Control points for quadratic bezier curve
  let cpX = canvas.width / 2;
  let cpY = canvas.height / 2;

  // Final sprite coordinates
  let finalX = canvas.width;
  let finalY = 0;

  // Animation properties
  const duration = 6000; // 6 seconds
  let startTime = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth+1;
    canvas.height = window.innerHeight+1;

    // Update control points for quadratic bezier curve
    cpX = canvas.width / 8;
    cpY = canvas.height / 8;

    // Update final sprite coordinates
    finalX = canvas.width;
    finalY = 0;

    // Reset animation start time
    startTime = null;
  }

  function animate(time) {
    if (!startTime) startTime = time;
    // Increment frame counter
    frameCount++;

    // Switch sprite every frameSwitch frames
    if (frameCount % frameSwitch === 0) {
      currentSprite = (currentSprite === sprite) ? sprite2 : sprite;
    }

    // Calculate elapsed time and t parameter
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);

    // Calculate sprite position using quadratic bezier curve formula
    x = Math.pow(1 - t, 2) * 0 + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * finalX;
    y = Math.pow(1 - t, 2) * canvas.height + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * finalY;

  // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the sprite if it's loaded
    if (currentSprite.complete) {
      
      const scaledWidth = currentSprite.width * 1.5;
      scaledHeight = currentSprite.height * 1.5;
      // Update background color based on t
      r = Math.floor(135 + (0 - 135) * t);
      g = Math.floor(206 + (0 - 206) * t);
      b = Math.floor(250 + (0 - 250) * t);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      updateStars();
      drawStars();  // Draw the stars

      // Inside the if (currentSprite.complete) block
      ctx.save();
      ctx.translate(x, y + scaledHeight); // Translated to the bottom-left corner
      const dynamicAngle = -35 + (35 * t);
      const angleInRadians = (dynamicAngle * Math.PI) / 180;
      ctx.rotate(angleInRadians);
      ctx.drawImage(currentSprite, 0, -scaledHeight, scaledWidth, scaledHeight); // Draw it back up
      ctx.restore();
      
      // ctx.drawImage(currentSprite, x, y, scaledWidth, scaledHeight);
    }


    if (t < 1) {
      addParticle(scaledHeight);  // Add particles while t < 1
    }
      // Always update particles, regardless of sprite's position
      updateParticles();

      // Check if all particles are off-screen
      const areParticlesOffScreen = particles.every(p => p.alpha <= 0 || p.radius <= 0);

    if (t > 0.5 && stars.length < 500) {  // Adjust these numbers as needed
      addStar();
    }

    

      // Continue animation if either sprite or any particles are on-screen
      if (t < 1 || !areParticlesOffScreen) {
        requestAnimationFrame(animate);
      } else {
         drawEndingScene(course);
        startTime = null;  // Reset for next animation cycle
        launchButton.innerText="Launched!"
      }
    }

  // Modified addParticle function
  function addParticle(scaledHeight) {
    const particle = {
      x: x + Math.random() * 20 - 10,
      y: y + scaledHeight + Math.random() * 20 - 10, // Y-coordinate adjusted
      radius: 18 + Math.random() * 4,
      alpha: 1
    };
    particles.push(particle);
  }

  function drawEndingScene(course) {
      
    fireworkAnimationActive=true;

      // Generate fireworks
    fireworkAnimate();
  }

  function fireworkAnimate() {
    if (!fireworkAnimationActive) {
        return;  // Exit animation loop if it's not active
    }

    // Clear canvas or use a transparent fill to create a trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStars();

    // Generate new firework particles at random positions
    if (Math.random() < 0.05) {
        const originX = Math.random() * canvas.width;
        const originY = Math.random() * canvas.height / 2;  // top half of canvas
        for (let i = 0; i < 50; i++) {  // Generate 50 particles per firework
            addFireworkParticle(originX, originY);
        }
    }

    // Draw course name
    ctx.font = '160px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(course, canvas.width / 2, canvas.height / 3);

    // Update and draw particles
    updateFireworkParticles();

    requestAnimationFrame(fireworkAnimate);
  }

  // Initial call to start the animation loop


  function addFireworkParticle(originX, originY) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1; // Random speed between 1 and 6
      const velocity = {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
      };
      const particle = {
          x: originX,
          y: originY,
          velocity,
          radius: 4 + Math.random() * 4,  // Random radius between 4 and 8
          alpha: 1,
          color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
      };
      particles.push(particle);
  }

  function updateFireworkParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i];
          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;

          // Gravity effect - optional
          particle.velocity.y += 0.05;

          // Reduce alpha and radius
          particle.alpha -= 0.01;
          particle.radius -= 0.01;

          // Remove particles that are no longer visible
          if (particle.alpha <= 0 || particle.radius <= 0) {
              particles.splice(i, 1);
              continue;
          }

          // Draw particle
          ctx.globalAlpha = particle.alpha;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
      }
      ctx.globalAlpha = 1;  // Reset alpha
  }



  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];

      // Reduce alpha and radius
      particle.alpha -= 0.009;
      particle.radius -= 0.1;

      // Remove particles that are no longer visible
      if (particle.alpha <= 0 || particle.radius <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Draw particle
      ctx.globalAlpha = particle.alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";  // Cloud color
      ctx.fill();
    }
    ctx.globalAlpha = 1;  // Reset alpha
  }

  function addStar() {
    const star = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3,
      alpha: 0  // Initial alpha value
    };
    stars.push(star);
  }

  function drawStars() {
    stars.forEach(star => {
      ctx.globalAlpha = star.alpha;  // Use star's alpha value
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });
    ctx.globalAlpha = 1;  // Reset alpha to default value
  }

  function updateStars() {
    stars.forEach(star => {
      if (star.alpha < 1) {
        star.alpha += 0.01;  // Increase alpha, capping it at 1
      }
    });
  }

  function drawSprite(ctx, sprite) {
    ctx.save(); // Save current state of the canvas

    // Translate to the sprite's position
    ctx.translate(sprite.x, sprite.y);

    // Rotate based on velocity or fixed angle
    const angleInRadians = Math.atan2(sprite.velocity.y, sprite.velocity.x);
    ctx.rotate(angleInRadians - Math.PI / 9); // Subtracting Math.PI/9 rotates by -20 degrees

    // Draw the sprite at the new origin
    ctx.drawImage(sprite.image, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);

    ctx.restore(); // Restore to the original state
  }



  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);


  launchButton.onclick = function() {
    if (startTime === null) {  // Prevent new animation if one is already running
      stars = [];
      fireworkAnimationActive = false; 
      // launchButton.style.zIndex = 1;
      launchButton.innerText="Launching";
      
      rocketSound.play();
      // Play the sound when the rocket launches
      

      requestAnimationFrame(animate);
    }
  };
};
