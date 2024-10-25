document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ballCanvas');
    const sideCanvas = document.getElementById('sideViewCanvas');
    const stage = new createjs.Stage(canvas);
    const sideStage = new createjs.Stage(sideCanvas);

    // Function to create a new ball
    const createBall = (color, radius) => {
        const ball = new createjs.Shape();
        ball.graphics.beginFill(color).drawCircle(0, 0, radius);
        return ball;
    };

    // Create initial blue ball for the main view
    const initialRadius = 50;
    const startScale = 3; // Start three times the initial size
    const gravity = 9.8; // Gravity constant
    let ball = createBall('blue', initialRadius);

    // Function to reset and position the main view ball
    const resetMainBall = () => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - initialRadius * startScale; // Start position (off-screen bottom)
        ball.scaleX = startScale;
        ball.scaleY = startScale;
        stage.removeAllChildren();
        stage.addChild(ball);
        stage.update();
    };

    // Create initial blue ball for the side view
    const sideInitialRadius = 5; // Smaller ball for side view
    let sideBall = createBall('blue', sideInitialRadius);

    // Create a red ball for the side view
    const redBall = createBall('red', sideInitialRadius);
    redBall.x = Math.random() * sideCanvas.width; // Random x position along the bottom
    redBall.y = sideCanvas.height - sideInitialRadius; // Position at the bottom

    // Draw ruler marks on the side view canvas
    const rulerMarkInterval = 100; // Distance between ruler marks
    const rulerMarkHeight = 10; // Height of ruler marks
    const rulerColor = "#666"; // Color of ruler marks
    const rulerGraphics = new createjs.Shape();
    rulerGraphics.graphics.setStrokeStyle(1).beginStroke(rulerColor);

    for (let x = 0; x <= sideCanvas.width; x += rulerMarkInterval) {
        rulerGraphics.graphics.moveTo(x, sideCanvas.height).lineTo(x, sideCanvas.height - rulerMarkHeight);
    }

    // Queue to keep track of the last 5 thrown balls
    const thrownBallsQueue = [];

    // Function to reset and position the side view ball
    const resetSideBall = () => {
        sideBall.x = sideInitialRadius; // Start at the left edge
        sideBall.y = sideCanvas.height - sideInitialRadius; // Start at the bottom
        sideStage.removeAllChildren();
        sideStage.addChild(sideBall);
        sideStage.addChild(redBall);
        sideStage.addChild(rulerGraphics);
        thrownBallsQueue.forEach(item => {
            sideStage.addChild(item.ball);
            sideStage.addChild(item.label);
        });
        sideStage.update();
    };

    // Initial reset of both balls
    resetMainBall();
    resetSideBall();

    document.getElementById('animateButton').addEventListener('click', () => {
        const power = parseFloat(document.getElementById('powerInput').value);
        const angle = parseFloat(document.getElementById('angleInput').value);

        if (isNaN(power) || power <= 0) {
            alert('Please enter a valid positive power value.');
            return;
        }

        if (isNaN(angle) || angle < 0 || angle > 90) {
            alert('Please enter a valid angle between 0 and 90 degrees.');
            return;
        }

        // Reset ball positions
        resetMainBall();
        resetSideBall();

        // Convert angle to radians
        const angleRadians = angle * (Math.PI / 180);

        // Calculate the initial vertical and horizontal velocities based on power and angle
        const initialVelocityY = power * Math.sin(angleRadians); // Vertical component
        const initialVelocityX = power * Math.cos(angleRadians); // Horizontal component

        // Calculate the peak height
        const peakHeight = ball.y - (initialVelocityY * initialVelocityY) / (2 * gravity);

        // Linear formula for final y position based on power and angle
        let finalYPosition;
        if (angle === 90) {
            finalYPosition = canvas.height - initialRadius * startScale;
        } else {
            finalYPosition = canvas.height - ((canvas.height / 2) / 100) * power * Math.sin(angleRadians);
        }

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

        // Tween for main ball position: move up to the peak height and then down to the final position
        createjs.Tween.get(ball)
            .to({ y: peakHeight }, duration / 2, createjs.Ease.getPowOut(2))
            .to({ y: finalYPosition }, duration / 2, createjs.Ease.getPowIn(2));

        // Tween for main ball scale: shrink continuously to the final scale
        createjs.Tween.get(ball)
            .to({ scaleX: finalScale, scaleY: finalScale }, duration, createjs.Ease.linear);

        // Scale the side canvas to match the maximum power and angle of 100 power and 45 degrees
        const maxPower = 100;
        const maxAngle = 45 * (Math.PI / 180);
        const maxInitialVelocityY = maxPower * Math.sin(maxAngle);
        const maxInitialVelocityX = maxPower * Math.cos(maxAngle);
        const totalDistance = sideCanvas.width;
        const maxPeakHeight = sideCanvas.height;

        // Function to calculate the y position based on the x position for a parabolic trajectory
        const calculateParabolicY = (x, initialVelocityX, initialVelocityY, gravity, totalDistance) => {
            const t = x / totalDistance * (duration / 1000); // Time based on x position
            const y = initialVelocityY * t - 0.5 * gravity * t * t;
            return sideCanvas.height - (y * (sideCanvas.height / maxPeakHeight)); // Adjust y scale
        };

        // Function to add a stationary ball to the queue
        const addStationaryBallToQueue = (x, y) => {
            // Create a new blue ball
            const newStationaryBall = createBall('blue', sideInitialRadius);
            newStationaryBall.x = x;
            newStationaryBall.y = y;

            // Create a label for the ball
            const userLabel = new createjs.Text("user", "12px Arial", "#000");
            userLabel.x = x - userLabel.getMeasuredWidth() / 2;
            userLabel.y = y - 20; // Position label above the ball

            // Add ball and label to the stage and queue
            sideStage.addChild(newStationaryBall, userLabel);
            thrownBallsQueue.push({ ball: newStationaryBall, label: userLabel });

            // Remove the oldest ball if the queue exceeds 5 items
            if (thrownBallsQueue.length > 5) {
                const oldest = thrownBallsQueue.shift();
                sideStage.removeChild(oldest.ball, oldest.label);
            }

            // Update the stage to reflect changes
            sideStage.update();
        };

        // Tween for side ball position: move along a parabolic path
        createjs.Tween.get(sideBall)
            .to({ x: totalDistance }, duration, createjs.Ease.linear)
            .addEventListener("change", () => {
                sideBall.y = calculateParabolicY(sideBall.x, initialVelocityX, initialVelocityY, gravity, totalDistance);

                // Check for collision with the red ball
                const dx = sideBall.x - redBall.x;
                const dy = sideBall.y - redBall.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < sideInitialRadius * 2) {
                    const contactText = new createjs.Text("Contact", "20px Arial", "#ff0000");
                    contactText.x = canvas.width / 2 - contactText.getMeasuredWidth() / 2;
                    contactText.y = 10; // Display at the top of the main canvas
                    stage.addChild(contactText);
                    stage.update();
                }
            })
            .call(() => {
                // Add a stationary ball at the final position
                addStationaryBallToQueue(sideBall.x, sideBall.y);
            });

        // Start the ticker to update both stages
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', () => {
            stage.update();
            sideStage.update();
        });
    });
});
