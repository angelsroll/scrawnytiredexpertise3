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
    const initialHeight = 5
    let ball = createBall('blue', initialRadius);

    const resetMainBall = () => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - initialRadius * startScale - 50; //good
        ball.scaleX = startScale;
        ball.scaleY = startScale;
        stage.removeAllChildren();
        stage.addChild(ball);
        stage.update();
    };

    resetMainBall();

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

        resetMainBall();

        const angleRadians = angle * (Math.PI / 180); //good
        const initialVelocityY = power * Math.sin(angleRadians); //good
        const initialVelocityX = power * Math.cos(angleRadians); //good
        const peakHeight = initialHeight + ((initialVelocityY * initialVelocityY) / (2 * gravity));
        console.log("angleRadians" , angleRadians);
        console.log("initialVelocityY", initialVelocityY);
        console.log("initialVelocityX", initialVelocityX);
        console.log("peakHeight", peakHeight);

        const calculateTotalTimeInAir = (peakHeight) => {
            const totalTime = (initialVelocityY / gravity) + Math.sqrt((2 * peakHeight) / gravity);
            console.log("totalTime", totalTime);
            return totalTime * 1000;// Convert to milliseconds
        };

        const duration = calculateTotalTimeInAir(power, angleRadians, ball.y);
        console.log("duration", duration);
        const totalDistance = initialVelocityX * (duration / 1000);
        console.log("totalDistance", totalDistance);
        const finalScale = startScale / (1 + totalDistance / 10);//seems good
        console.log("finalScale", finalScale);
        const finalYPosition = canvas.height - ((canvas.height / 2) / 100) * initialVelocityY;//needs to be worked on
        console.log("finalYPosition", finalYPosition);

        createjs.Tween.get(ball)
            .to({ y: -8.8 * peakHeight + 880 }, duration / 2, createjs.Ease.getPowOut(2))//might be good actually
            .to({ y: Math.max(finalYPosition, canvas.height / 2) }, duration / 2, createjs.Ease.getPowIn(2))//figure out the finalYPosition, create background image you'd like first

        createjs.Tween.get(ball)
            .to({ scaleX: finalScale, scaleY: finalScale }, duration, createjs.Ease.linear);

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', () => {
            stage.update();//seems good
        });

        window.dispatchEvent(new CustomEvent('startSideAnimation', { detail: { power, angle, duration } }));
    });
});
