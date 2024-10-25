document.addEventListener("DOMContentLoaded", () => {
    const sideCanvas = document.getElementById("sideViewCanvas");
    const sideStage = new createjs.Stage(sideCanvas);

    const createBall = (color, radius) => {
        const ball = new createjs.Shape();
        ball.graphics.beginFill(color).drawCircle(0, 0, radius);
        return ball;
    };

    const sideInitialRadius = 5;
    let sideBall = createBall("blue", sideInitialRadius);

    const redBall = createBall("red", sideInitialRadius);
    redBall.x = Math.random() * sideCanvas.width;
    redBall.y = sideCanvas.height - sideInitialRadius;

    const rulerMarkInterval = 100;
    const rulerMarkHeight = 10;
    const rulerColor = "#666";
    const rulerGraphics = new createjs.Shape();
    rulerGraphics.graphics.setStrokeStyle(1).beginStroke(rulerColor);

    for (let x = 0; x <= sideCanvas.width; x += rulerMarkInterval) {
        rulerGraphics.graphics
            .moveTo(x, sideCanvas.height)
            .lineTo(x, sideCanvas.height - rulerMarkHeight);
    }

    const thrownBallsQueue = [];

    const resetSideBall = () => {
        sideBall.x = sideInitialRadius;
        sideBall.y = sideCanvas.height - sideInitialRadius;
        sideStage.removeAllChildren();
        sideStage.addChild(sideBall);
        sideStage.addChild(redBall);
        sideStage.addChild(rulerGraphics);
        thrownBallsQueue.forEach((item) => {
            sideStage.addChild(item.ball);
            sideStage.addChild(item.label);
        });
        sideStage.update();
    };

    resetSideBall();

    window.addEventListener("startSideAnimation", (event) => {
        const { userName, power, angle, duration } = event.detail;

        resetSideBall();

        //const userName = document.getElementById("userName").value;
        const angleRadians = angle * (Math.PI / 180);
        const initialVelocityY = power * Math.sin(angleRadians);
        const initialVelocityX = power * Math.cos(angleRadians);
        const gravity = 32.2;
        const initialHeight = 5;
        const screenDistance = Math.random() * (1000 - 100) + 100; //distance the whole sideview screen represents
        console.log("screenDistance", screenDistance);
        const totalDistance =
            initialVelocityX * (duration / 1000) + sideInitialRadius; //distance ball travels
        console.log("totalDistance", totalDistance);
        const finalYPosition = sideCanvas.height - sideInitialRadius; //needs to be worked on
        console.log("finalYPosition", finalYPosition);
        const peakHeight =
            initialHeight +
            (initialVelocityY * initialVelocityY) / (2 * gravity);
        console.log("peakHeight", peakHeight);

        const addStationaryBallToQueue = (x, y) => {
            const newStationaryBall = createBall("blue", sideInitialRadius);
            newStationaryBall.x = x;
            newStationaryBall.y = y;

            const userLabel = new createjs.Text(userName, "12px Arial", "#000");
            userLabel.x = x - userLabel.getMeasuredWidth() / 2;
            userLabel.y = y - 20;

            sideStage.addChild(newStationaryBall, userLabel);
            thrownBallsQueue.push({
                ball: newStationaryBall,
                label: userLabel,
            });

            if (thrownBallsQueue.length > 5) {
                const oldest = thrownBallsQueue.shift();
                sideStage.removeChild(oldest.ball, oldest.label);
            }

            sideStage.update();
        };

        // Variable to track if contact has been made
        let contactMade = false;

        createjs.Tween.get(sideBall).to(
            { x: totalDistance },
            duration,
            createjs.Ease.linear,
        );
        createjs.Tween.get(sideBall)
            .to(
                { y: sideCanvas.height - sideInitialRadius - peakHeight },
                duration / 2,
                createjs.Ease.getPowOut(2),
            ) //might be good actually
            .to({ y: finalYPosition }, duration / 2, createjs.Ease.getPowIn(2)) //figure out the finalYPosition, create background image you'd like first
            .addEventListener("change", () => {
                const dx = sideBall.x - redBall.x;
                const dy = sideBall.y - redBall.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < sideInitialRadius * 2 && !contactMade) {
                    contactMade = true;
                    const contactText = new createjs.Text(
                        "Contact",
                        "20px Arial",
                        "#ff0000",
                    );
                    contactText.x =
                        sideCanvas.width / 2 -
                        contactText.getMeasuredWidth() / 2;
                    contactText.y = 10;
                    sideStage.addChild(contactText);
                    sideStage.update();

                    // Log the contact message immediately
                    const message = `${userName} made contact!`;
                    window.addHistoryEntry(message);
                }
            });
        createjs.Tween.get(sideBall)
            .wait(duration)
            .call(() => {
                addStationaryBallToQueue(sideBall.x, sideBall.y);
                // If contact was not made, determine the message based on distance
                if (!contactMade) {
                    let message = "";
                    if (totalDistance > redBall.x + 100) {
                        message = `${userName} way overthrew the target.`;
                    } else if (totalDistance > redBall.x) {
                        message = `${userName} was close but overthrew.`;
                    } else if (totalDistance > redBall.x - 100) {
                        message = `${userName} was close but came up short.`;
                    } else {
                        message = `${userName} missed way short.`;
                    }
                    window.addHistoryEntry(message);
                }
            });

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", () => {
            sideStage.update();
        });
    });
});
