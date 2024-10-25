document.getElementById('animateButton').addEventListener('click', () => {
    const canvas = document.getElementById('ballCanvas');
    const stage = new createjs.Stage(canvas);
    const power = parseFloat(document.getElementById('powerInput').value);

    if (isNaN(power) || power <= 0) {
        alert('Please enter a valid positive power value.');
        return;
    }

    // Create a blue ball
    const ball = new createjs.Shape();
    const initialRadius = 50;
    const startScale = 3; // Start three times the initial size
    const gravity = 9.8; // Gravity constant

    ball.graphics.beginFill('blue').drawCircle(0, 0, initialRadius);
    ball.x = canvas.width / 2;
    ball.y = canvas.height - initialRadius * startScale; // Start position (off-screen bottom)
    ball.scaleX = startScale;
    ball.scaleY = startScale;

    stage.addChild(ball);
    stage.update();

    // Calculate the initial velocity based on power
    const initialVelocity = power; // Directly use the power value as initial velocity

    // Calculate the peak height
    const peakHeight = ball.y - (initialVelocity * initialVelocity) / (2 * gravity);

    // Linear formula for final y position based on power
    const finalYPosition = canvas.height - ((canvas.height / 2) / 100) * power; // Adjusted formula for final y-position

    // Final scale based on power (higher power results in a smaller ball, but with less drastic shrinking)
    const finalScale = 1 / (1 + power / 10); // Adjust the divisor to make the change more gradual

    // Calculate the duration based on power
    let duration;
    if (power > 100) {
        duration = 5 * 1000; // Duration for power over 100 (5 seconds)
    } else if (power > 50) {
        duration = 10 * 1000; // Duration for power over 50 (10 seconds)
    } else {
        duration = 10 * 1000 * (power / 50); // Transition duration in milliseconds
    }

    // Tween for position: move up to the peak height and then down to the final position
    createjs.Tween.get(ball)
        .to({ y: peakHeight }, duration / 2, createjs.Ease.getPowOut(2))
        .to({ y: finalYPosition }, duration / 2, createjs.Ease.getPowIn(2));

    // Tween for scale: shrink continuously to the final scale
    createjs.Tween.get(ball)
        .to({ scaleX: finalScale, scaleY: finalScale }, duration, createjs.Ease.linear);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', stage);
});
