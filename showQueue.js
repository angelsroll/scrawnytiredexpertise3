document.getElementById('showQueue').addEventListener('click', () => {
    const queueContent = document.getElementById('queueContent');
    queueContent.innerHTML = ''; // Clear existing content

    if (queueArray.length === 0 && animationQueue.length === 0) {
        queueContent.innerText = 'No queue information available.';
    } else {
        queueArray.forEach(user => {
            const queueEntry = document.createElement('div');
            queueEntry.className = 'queue-entry-modal';
            queueEntry.innerText = `${user.userName}'s turn (Power: ${user.power}, Angle: ${user.angle})`;
            queueContent.appendChild(queueEntry);
        });
    }

    document.getElementById('queueModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('queueModal').style.display = 'none';
});
