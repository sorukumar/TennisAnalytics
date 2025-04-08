// Basic tennis ball click animation
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS for the tennis ball
  const style = document.createElement('style');
  style.textContent = `
    /* Tennis racket cursor */
    body {
      cursor: url('image/tennis-racket-cursor.png'), auto;
    }

    /* Tennis ball animation */
    .tennis-ball {
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: #ccff00;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      opacity: 0;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);

  // Add click event listener
  document.addEventListener('click', function(e) {
    // Create tennis ball
    const ball = document.createElement('div');
    ball.className = 'tennis-ball';
    
    // Position at click location
    ball.style.left = (e.pageX - 10) + 'px';
    ball.style.top = (e.pageY - 10) + 'px';
    
    // Add to document
    document.body.appendChild(ball);
    
    // Animate
    setTimeout(() => {
      ball.style.opacity = '1';
      ball.style.transform = 'translate(' + (Math.random() * 40 - 20) + 'px, ' + (Math.random() * 40 - 20) + 'px)';
      
      // Remove after animation
      setTimeout(() => {
        document.body.removeChild(ball);
      }, 300);
    }, 10);
  });
});