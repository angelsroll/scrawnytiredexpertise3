document.addEventListener('DOMContentLoaded', () => {
    const sideCanvas = document.getElementById('sideViewCanvas');
    const sideStage = new createjs.Stage(sideCanvas);

    const createBall = (color, radius) => {
        const ball = new createjs.Shape();
        ball.graphics.beginFill(color).drawCircle(0, 0, radius);
        return ball;
    };

    const sideInitialRadius = 5;
    let sideBall = createBall('blue', sideInitialRadius);

    const redBall = createBall('red', sideInitialRadius);
    redBall.x = Math.random() * sideCanvas.width;
    redBall.y = sideCanvas.height - sideInitialRadius;

    const rulerMarkInterval = 100;
    const rulerMarkHeight = 10;
    const rulerColor = "#666";
    const rulerGraphics = new createjs.Shape();
    rulerGraphics.graphics.setStrokeStyle(1).beginStroke(rulerColor);

    for (let x = 0; x <= sideCanvas.width; x += rulerMarkInterval) {
        rulerGraphics.graphics.moveTo(x, sideCanvas.height).lineTo(x, sideCanvas.height - rulerMarkHeight);
    }

    const thrownBallsQueue = [];

    const resetSideBall = () => {
        sideBall.x = sideInitialRadius;
        sideBall.y = sideCanvas.height - sideInitialRadius;
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

    resetSideBall();

    window.addEventListener('startSideAnimation', (event) => {
        const { power, angle, duration } = event.detail;

        resetSideBall();

        const angleRadians = angle * (Math.PI / 180);
        const initialVelocityY = power * Math.sin(angleRadians);
        const initialVelocityX = power * Math.cos(angleRadians);
        const gravity = 32.2;
        const initialHeight = 5;
        const screenDistance = Math.random() * (1000 - 100) + 100; //distance the whole sideview screen represents
        console.log("screenDistance", screenDistance);
        const totalDistance = initialVelocityX * (duration / 1000); //distance ball travels
        console.log("totalDistance", totalDistance);

        const calculateParabolicY = (x, initialHeight, initialVelocityY, gravity, totalDistance) => {
            const t = duration / 1000;
            console.log("duration", duration);
            const y = initialVelocityY * t - 0.5 * gravity * t * t + initialHeight;
            return Math.min(sideCanvas.height - (y * (sideCanvas.height / 100)), sideCanvas.height - sideInitialRadius);
        };

        const addStationaryBallToQueue = (x, y) => {
            const newStationaryBall = createBall('blue', sideInitialRadius);
            newStationaryBall.x = x;
            newStationaryBall.y = y;

            const userLabel = new createjs.Text("user", "12px Arial", "#000");
            userLabel.x = x - userLabel.getMeasuredWidth() / 2;
            userLabel.y = y - 20;

            sideStage.addChild(newStationaryBall, userLabel);
            thrownBallsQueue.push({ ball: newStationaryBall, label: userLabel });

            if (thrownBallsQueue.length > 5) {
                const oldest = thrownBallsQueue.shift();
                sideStage.removeChild(oldest.ball, oldest.label);
            }

            sideStage.update();
        };

        createjs.Tween.get(sideBall)
            .to({ x: totalDistance }, duration, createjs.Ease.linear)
            .addEventListener("change", () => {
                sideBall.y = calculateParabolicY(sideBall.x, initialHeight, initialVelocityY, gravity, totalDistance);

                const dx = sideBall.x - redBall.x;
                const dy = sideBall.y - redBall.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < sideInitialRadius * 2) {
                    const contactText = new createjs.Text("Contact", "20px Arial", "#ff0000");
                    contactText.x = sideCanvas.width / 2 - contactText.getMeasuredWidth() / 2;
                    contactText.y = 10;
                    sideStage.addChild(contactText);
                    sideStage.update();
                }

                if (sideBall.y >= sideCanvas.height - sideInitialRadius) {
                    createjs.Tween.removeTweens(sideBall);
                }
            })
            .call(() => {
                addStationaryBallToQueue(sideBall.x, sideBall.y);
            });

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick', () => {
            sideStage.update();
        });
    });
});
