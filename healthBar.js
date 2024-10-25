// Constants
const initialHealth = 100; // Initial health value
let currentHealth = initialHealth; // Current health value
let damageTaken = 0; // Damage taken in the current attack

// Function to update the health bar
function updateHealthBar() {
  // Calculate the percentage of health remaining
  const healthPercentage = currentHealth / initialHealth;

  // Clear the health bar area
  ctx.clearRect(0, 0, canvas.width, 40);

  // Draw the green health bar background
  const barWidth = canvas.width * 0.8; // 80% of the canvas width
  const barHeight = 20; // Height of the bar
  const barX = (canvas.width - barWidth) / 2; // Center the bar horizontally
  const barY = 40; // Top margin for the bar, just below the battle log header
  ctx.fillStyle = 'green';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Draw the red damage indicator
  const damageWidth = barWidth * (damageTaken / initialHealth);
  ctx.fillStyle = 'red';
  ctx.fillRect(barX + damageWidth, barY, barWidth - damageWidth, barHeight);

  // Draw the current health value
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Health: ${currentHealth}`, canvas.width / 2, barY - 10); // Above the health bar
}

// Function to apply damage to the health bar
function applyDamage() {
  currentHealth -= damageTaken;
  if (currentHealth < 0) {
    currentHealth = 0;
  }
  updateHealthBar();
}

// Listen for the attack button click event
document.getElementById('moveButton').addEventListener('click', () => {
  // Update damage taken with the latest attack value from overlay.js
  damageTaken = overlays.length > 0 ? overlays[0].numberToDisplay : 0;
  applyDamage();
});