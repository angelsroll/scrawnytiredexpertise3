// Declare queueArray, animationQueue, and lock variables globally
var queueArray = [];
var animationQueue = [];
let isAnimationActive = false;
let isQueueLocked = false;  // Queue lock to prevent race conditions

document.addEventListener("DOMContentLoaded", () => {
    const queueLogContainer = document.getElementById("queueLogCanvas");

    const queueHeader = document.createElement("div");
    queueHeader.id = "queueLogHeader";
    queueHeader.innerText = "↑ Next Up ↑";
    queueLogContainer.appendChild(queueHeader);

    const addUserTurnToQueue = (userName, power, angle) => {
        // If the queue is locked, wait and retry
        if (isQueueLocked) {
            setTimeout(() => addUserTurnToQueue(userName, power, angle), 100);
            return;
        }

        isQueueLocked = true;  // Lock the queue during critical operation

        const timestamp = Date.now();
        const user = { userName, power, angle, timestamp, timeDisplay: null, inQueue: true };

        if (userHasCooldown(userName)) {
            const userTurnDiv = createUserTurnDiv(userName);
            queueLogContainer.appendChild(userTurnDiv);
            queueArray.push(user);
            startCooldown(userName, userTurnDiv);
        } else if (animationQueue.length > 0 || isAnimationActive) {
            const userTurnDiv = createUserTurnDiv(userName);
            queueLogContainer.appendChild(userTurnDiv);
            queueArray.push(user);
            animationQueue.push(user);  // Add to animation queue
        } else {
            user.lastThrowTime = timestamp;
            queueArray.push(user);
            animationQueue.push(user);  // Add to animation queue immediately
            startNextAnimation();
        }

        sortQueueLog();
        isQueueLocked = false;  // Unlock the queue after the operation
    };

    const createUserTurnDiv = (userName) => {
        const userTurnDiv = document.createElement("div");
        userTurnDiv.className = "queue-entry";
        userTurnDiv.innerText = `${userName}'s turn`;
        return userTurnDiv;
    };

    const userHasCooldown = (userName) => {
        const now = Date.now();
        const user = queueArray.find(user => user.userName === userName && user.inQueue);
        if (!user || !user.lastThrowTime) return false;
        const timeDiff = now - user.lastThrowTime;
        return timeDiff < 120000;  // Cooldown is 2 minutes (120000ms)
    };

    const isUserInQueueLog = (userName) => {
        return Array.from(queueLogContainer.children).some(div => div.innerText.startsWith(`${userName}'s turn`));
    };

    const startNextAnimation = () => {
        if (isQueueLocked || animationQueue.length === 0) {
            // Retry if the queue is locked or there's no animation to start
            setTimeout(startNextAnimation, 100);
            return;
        }

        isQueueLocked = true;  // Lock the queue during animation start

        const { userName, power, angle } = animationQueue.shift();
        isAnimationActive = true;

        const user = queueArray.find(user => user.userName === userName && user.inQueue);
        if (user) {
            user.lastThrowTime = Date.now();
        }

        const userTurnDiv = Array.from(queueLogContainer.children).find(div => div.innerText.startsWith(`${userName}'s turn`));
        if (userTurnDiv) {
            queueLogContainer.removeChild(userTurnDiv);
        }

        const event = new CustomEvent("startMainAnimation", { detail: { userName, power, angle } });
        window.dispatchEvent(event);

        isQueueLocked = false;  // Unlock the queue after starting the animation
    };

    const startCooldown = (userName, userTurnDiv) => {
        const allUserEntries = queueArray.filter(user => user.userName === userName && user.inQueue);

        // Get the older entry (assumed to be first), and also the newer one (if exists)
        const olderEntry = allUserEntries[0];
        const newerEntry = allUserEntries.length > 1 ? allUserEntries[allUserEntries.length - 1] : null;

        const lastThrowTime = olderEntry.lastThrowTime || Date.now();

        olderEntry.timeDisplay = document.createElement("span");
        olderEntry.timeDisplay.style.color = "red";
        olderEntry.inQueue = true;

        if (userTurnDiv) {
            userTurnDiv.appendChild(olderEntry.timeDisplay);
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeDiff = now - lastThrowTime;

            if (timeDiff < 120000) {
                const remainingTime = Math.ceil((120000 - timeDiff) / 1000);
                olderEntry.timeDisplay.innerText = ` (${remainingTime}s remaining)`;
            } else {
                clearInterval(intervalId);
                olderEntry.timeDisplay.innerText = '';

                // Lock the queue during cooldown completion
                if (isQueueLocked) {
                    setTimeout(() => startCooldown(userName, userTurnDiv), 100);
                    return;
                }

                isQueueLocked = true;

                // If there's a newer entry, remove the older entry and manage the newer one
                if (newerEntry) {
                    // Remove the older entry from queueArray and the log
                    queueArray = queueArray.filter(u => u !== olderEntry);

                    if (userTurnDiv) {
                        queueLogContainer.removeChild(userTurnDiv);
                    }

                    // Check if the newer entry should start the animation
                    if (animationQueue.length === 0 && !isAnimationActive) {
                        animationQueue.push({ userName: newerEntry.userName, power: newerEntry.power, angle: newerEntry.angle });
                        startNextAnimation();
                    } else {
                        animationQueue.push({ userName: newerEntry.userName, power: newerEntry.power, angle: newerEntry.angle });
                    }

                    newerEntry.inQueue = false;  // Mark newer entry as processed
                } else {
                    // If no newer entry, proceed with the older one
                    animationQueue.push({ userName: olderEntry.userName, power: olderEntry.power, angle: olderEntry.angle });
                    olderEntry.inQueue = false;
                    queueArray = queueArray.filter(u => u !== olderEntry);  // Remove the completed entry
                    if (userTurnDiv) {
                        queueLogContainer.removeChild(userTurnDiv);
                    }

                    if (!isAnimationActive) {
                        startNextAnimation();
                    }
                }

                isQueueLocked = false;  // Unlock the queue after processing
            }
        }, 1000);
    };



    const sortQueueLog = () => {
        const logEntries = Array.from(queueLogContainer.children).filter(child => child !== queueHeader);
        logEntries.sort((a, b) => {
            const userA = queueArray.find(user => a.innerText.startsWith(`${user.userName}'s turn`));
            const userB = queueArray.find(user => b.innerText.startsWith(`${user.userName}'s turn`));

            const remainingA = userHasCooldown(userA.userName) ? 120000 - (Date.now() - userA.lastThrowTime) : 0;
            const remainingB = userHasCooldown(userB.userName) ? 120000 - (Date.now() - userB.lastThrowTime) : 0;

            if (remainingA === 0 && remainingB === 0) return 0;
            if (remainingA === 0) return -1;
            if (remainingB === 0) return 1;
            return remainingA - remainingB;
        });

        logEntries.forEach(entry => queueLogContainer.removeChild(entry));
        logEntries.forEach(entry => queueLogContainer.appendChild(entry));
    };

    document.getElementById('animateButton').addEventListener('click', () => {
        const userName = document.getElementById('userName').value;
        const power = document.getElementById('powerInput').value;
        const angle = document.getElementById('angleInput').value;

        if (isNaN(power) || power <= 0) {
            alert('Please enter a valid positive power value.');
            return;
        }

        if (isNaN(angle) || angle < 0 || angle > 90) {
            alert('Please enter a valid angle between 0 and 90 degrees.');
            return;
        }

        if (userName && power && angle) {
            const existingUser = queueArray.find(user => user.userName === userName);

            if (existingUser && isUserInQueueLog(userName)) {
                alert("Please wait for your throw to complete before adding a new throw.");
                return;
            }

            addUserTurnToQueue(userName, power, angle);
        }
    });

    window.addEventListener("endMainAnimation", () => {
        isAnimationActive = false;
        setTimeout(() => {
            startNextAnimation();
        }, 10000);  // Wait 10 seconds before starting the next animation
    });
});
