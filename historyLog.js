document.addEventListener('DOMContentLoaded', () => {
    const historyLogCanvas = document.getElementById('historyLogCanvas');

    const createHistoryLog = () => {
        const historyLog = document.createElement('div');
        historyLog.id = 'historyLog';

        const header = document.createElement('div');
        header.id = 'historyLogHeader';
        header.textContent = 'Log';
        historyLog.appendChild(header);

        historyLogCanvas.appendChild(historyLog);

        return historyLog;
    };

    const historyLog = createHistoryLog();

    window.addHistoryEntry = (text) => {
        const entry = document.createElement('div');
        entry.classList.add('history-entry');
        entry.textContent = text;
        historyLog.appendChild(entry);

        // Check if the total height of the log exceeds the height of the canvas
        const historyLogCanvasHeight = historyLogCanvas.clientHeight;
        while (historyLog.scrollHeight > historyLogCanvasHeight) {
            // Remove the first entry if the total height exceeds the canvas height
            historyLog.removeChild(historyLog.children[1]); // children[0] is the header
        }
    };

});
