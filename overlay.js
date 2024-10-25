document.addEventListener("DOMContentLoaded", () => {
    const queueLogContainer = document.getElementById("queueLogCanvas");

    // Create the header for the queue log and add it to the end of the container
    const queueHeader = document.createElement("div");
    queueHeader.id = "queueLogHeader";
    queueHeader.innerText = "↑ Next Up ↑";
    queueLogContainer.appendChild(queueHeader);

    // Array to store user data (username, power, angle, timestamp)
    let queueArray = [];

    // Function to update the time remaining display for users within 2 minutes of their last throw
    const updateTimeRemaining = () => {
        const now = Date.now();

        queueArray.forEach((user, index) => {
            const timeDiff = now - user.timestamp;

            if (timeDiff < 120000) { // 2 minutes in milliseconds
                const remainingTime = Math.ceil((120000 - timeDiff) / 1000);
                user.timeDisplay.innerText = ` (${remainingTime}s remaining)`;
                user.timeDisplay.style.color = "red";
            } else if (!user.inQueue) {
                user.timeDisplay.innerText = ''; // Clear remaining time when cooldown ends
                user.inQueue = true;

                // Dispatch the startMainAnimation event
                const event = new CustomEvent("startMainAnimation", { detail: user });
                window.dispatchEvent(event);

                // Remove the user from the queue after triggering the event
                queueArray.splice(index, 1);
            }
        });
    };

    // Function to add a user's turn message to the queue log and store their data
    const addUserTurnToQueue = (userName, power, angle, timestamp, autoAdd = false) => {
        const userTurnDiv = document.createElement("div");
        userTurnDiv.className = "queue-entry";
        userTurnDiv.innerText = `${userName}'s turn`;

        // Create and attach the time display element
        const timeDisplay = document.createElement("span");
        userTurnDiv.appendChild(timeDisplay);

        // Append the new entry to the container
        queueLogContainer.appendChild(userTurnDiv);

        // Store user data in the array
        queueArray.push({ userName, power, angle, timestamp, timeDisplay, inQueue: autoAdd });

        // Immediately update the time remaining if the user is within cooldown
        if (Date.now() - timestamp < 120000) {
            updateTimeRemaining();
        }
    };

    // Add event listener to the button
    document.getElementById('animateButton').addEventListener('click', () => {
        const userName = document.getElementById('userName').value;
        const power = document.getElementById('powerInput').value;
        const angle = document.getElementById('angleInput').value;
        const now = Date.now();

        if (userName && power && angle) {
            const existingUser = queueArray.find(user => user.userName === userName);

            if (existingUser) {
                // Check if the user is already in the queue
                if (!existingUser.inQueue || now - existingUser.timestamp < 120000) {
                    alert("Please wait for your throw to complete before adding a new throw.");
                    return;
                }
            }
            addUserTurnToQueue(userName, power, angle, now);
        }
    });

    // Periodically update the time remaining
    setInterval(updateTimeRemaining, 1000); // Update every second
});
