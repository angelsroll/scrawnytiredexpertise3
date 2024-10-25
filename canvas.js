const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 1920; // Fullscreen width
canvas.height = 1080; // Fullscreen height

const baseImageSrc = 'https://drive.google.com/thumbnail?id=1uBpQpV2SPq07eLS0cJ4yuRewSy68TJUj';
const overlayImageSrc = 'https://drive.google.com/thumbnail?id=1PmNvzxhuSr0qJyL39OwZkgrAOkNxLYuq';

const rotationSpeedNormal = 0.2; // Radians per frame
const rotationSpeedCritical = 0.1; // Radians per frame for critical hit
const overlays = [];
let animationFrameId;

const baseImage = new Image();
const overlayImage = new Image();

baseImage.src = baseImageSrc;
overlayImage.src = overlayImageSrc;

let shake = false;
let shakeDuration = 0;
let shakeMagnitude = 10; // Adjusted the magnitude of the shake

baseImage.onload = () => {
    // Adjusted dimensions to slightly larger than canvas
    const adjustedWidth = canvas.width + 2 * shakeMagnitude;
    const adjustedHeight = canvas.height + 2 * shakeMagnitude;
    ctx.drawImage(baseImage, -shakeMagnitude, -shakeMagnitude, adjustedWidth, adjustedHeight);

    // Draw log background
    drawLogBackground();
    // Initial call to display the health bar
    updateHealthBar();
};

function drawOverlay() {
    // Apply shake effect
    let dx = 0;
    let dy = 0;
    if (shake && shakeDuration > 0) {
        dx = Math.random() * shakeMagnitude - shakeMagnitude / 2;
        dy = Math.random() * shakeMagnitude - shakeMagnitude / 2;
        shakeDuration--;
    }

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw base image with shake offset
    const adjustedWidth = canvas.width + 2 * shakeMagnitude;
    const adjustedHeight = canvas.height + 2 * shakeMagnitude;
    ctx.drawImage(baseImage, -shakeMagnitude + dx, -shakeMagnitude + dy, adjustedWidth, adjustedHeight);

    // Draw overlays
    overlays.forEach(overlay => {
        ctx.save();
        ctx.translate(overlay.x, overlay.y); // Translate to the bottom-left corner of the overlay
        ctx.rotate(-overlay.angle); // Rotate counterclockwise
        if (overlay.criticalHit) {
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 40; // Increased shadow blur for critical hit
        }
        ctx.drawImage(overlayImage, 0, -overlayImage.height, overlayImage.width, overlayImage.height); // Draw image rotated
        ctx.restore();

        // Draw the number with upward movement
        ctx.save();
        ctx.translate(overlay.x, overlay.y + overlay.textY); // Move text along with the overlay
        ctx.fillStyle = overlay.criticalHit ? 'orange' : 'white'; // Color based on critical hit
        ctx.font = overlay.criticalHit ? 'bold 20px Arial' : '20px Arial'; // Font style based on critical hit
        ctx.textAlign = 'center';
        ctx.fillText(overlay.numberToDisplay, overlayImage.width / 2, -overlayImage.height); // Draw the number
        ctx.restore();
    });

    // Draw log background on top
    drawLogBackground();
}

function drawLogBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Changed transparency to 40%
    ctx.fillRect(canvas.width * 0.8, 0, canvas.width * 0.2, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4; // Changed border width to 4pt
    ctx.strokeRect(canvas.width * 0.8, 0, canvas.width * 0.2, canvas.height);

    // Draw log header
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width * 0.8, 0, canvas.width * 0.2, 30); // Header background
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Battle Log', canvas.width * 0.9, 20); // Header text
}

function animateOverlay() {
    overlays.forEach(overlay => {
        overlay.angle += overlay.criticalHit ? rotationSpeedCritical : rotationSpeedNormal;
    });

    // Remove overlays that have rotated enough
    for (let i = overlays.length - 1; i >= 0; i--) {
        if (overlays[i].angle >= (0.9 * Math.PI)) {
            overlays.splice(i, 1);
        }
    }

    drawOverlay();
    if (overlays.length > 0 || shakeDuration > 0) {
        animationFrameId = requestAnimationFrame(animateOverlay);
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

// Start shake effect
shake = true;
shakeDuration = 10; // Adjust the duration of the shake
cancelAnimationFrame(animationFrameId);
animateOverlay();