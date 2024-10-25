const socket = new WebSocket('wss://ScrawnyTiredExpertise.beachycarrotop.repl.co');  // Update with your WebSocket server URL

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'triggerOverlay') {
    const { user } = data;
    triggerOverlay(user);
  }
};

function triggerOverlay(user) {
  const criticalHit = Math.random() < 0.1; // 10% chance of critical hit
  const randomNum = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
  const numberToDisplay = criticalHit ? randomNum * 2 : randomNum;

  if (criticalHit) {
    shakeMagnitude = 20; // Double the magnitude
  } else {
    shakeMagnitude = 10;
  }

  const overlay = {
    x: Math.random() * (canvas.width - overlayImage.width),
    y: canvas.height - Math.random() * (canvas.height / 10),
    angle: 0, // Start angle at 0 radians
    criticalHit: criticalHit,
    numberToDisplay: numberToDisplay,
    textY: 0, // Initial position of the text relative to the overlay
    textSpeed: -1, // Slower speed to make it last longer
    textUp: true // Indicates whether the text is moving up or down
  };

  overlays.push(overlay);
  if (overlays.length === 1) {
    cancelAnimationFrame(animationFrameId);
    animateOverlay();
  }

  // Start shake effect
  shake = true;
  shakeDuration = 20; // Adjusted duration of the shake
  cancelAnimationFrame(animationFrameId);
  animateOverlay();

  // Add log entry
  const logEntry = `${user} dealt ${numberToDisplay} damage`;
  battleLog.unshift(logEntry); // Add entry to the beginning of the array
  if (battleLog.length > 5) {
    battleLog.pop(); // Remove the last entry if the log length exceeds 5
  }

  // Write log entries to file
  // Here you can implement logic to write to a separate log file
}