document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ballCanvas');
    const stage = new createjs.Stage(canvas);

    const createBall = (color, radius) => {
        const ball = new createjs.Shape();
        ball.graphics.beginFill(color).drawCircle(0, 0, radius);
        return ball;
    };

    const initialRadius = 50;
    const startScale = 3;
    const gravity = 32.2; // gravity in m/s^2
    const initialHeight = 5;
    let ball = createBall('blue', initialRadius);

    const resetMainBall = () => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - initialRadius * startScale - 50;
        ball.scaleX = startScale;
        ball.scaleY = startScale;
        stage.removeAllChildren();
        stage.addChild(ball);
        stage.update();
    };

    resetMainBall();

    window.addEventListener("startMainAnimation", (event) => {
        const { userName, power, angle } = event.detail;
        console.log(`Starting animation for ${userName} with power: ${power}, angle: ${angle}`);

        resetMainBall();

        const angleRadians = angle * (Math.PI / 180);
        const initialVelocityY = power * Math.sin(angleRadians);
        const initialVelocityX = power * Math.cos(angleRadians);
        const peakHeight = initialHeight + ((initialVelocityY * initialVelocityY) / (2 * gravity));

        const calculateTotalTimeInAir = (peakHeight) => {
            const totalTime = (initialVelocityY / gravity) + Math.sqrt((2 * peakHeight) / gravity);
            return totalTime * 1000; // Convert to milliseconds
        };

        const duration = calculateTotalTimeInAir(peakHeight);
        const totalDistance = initialVelocityX * (duration / 1000);
        const finalScale = startScale / (1 + totalDistance / 10);
        const finalYPosition = canvas.height - ((canvas.height / 2) / 100) * initialVelocityY;

        createjs.Tween.get(ball)
            .to({ y: -8.8 * peakHeight + 880 }, duration / 2, createjs.Ease.getPowOut(2))
            .to({ y: Math.max(finalYPosition, canvas.height / 2) }, duration / 2, createjs.Ease.getPowIn(2));

        createjs.Tween.get(ball)
            .to({ scaleX: finalScale, scaleY: finalScale }, duration, createjs.Ease.linear);

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', () => {
            stage.update();
        });

        window.dispatchEvent(new CustomEvent('startSideAnimation', { detail: { userName, power, angle, duration } }));

        // Dispatch an event to indicate the end of the animation
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('endMainAnimation'));
        }, duration);
    });
});
