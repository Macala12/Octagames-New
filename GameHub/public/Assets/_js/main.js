function setupTournamentTimer(tournamentId, startTimeStr, endTimeStr) {
    const startTime = new Date(startTimeStr).getTime();
    const endTime = new Date(endTimeStr).getTime();
    const timerElement = document.getElementById(`timer-${tournamentId}`);
    const statusElement = document.getElementById(`status-${tournamentId}`);

    if (!timerElement || !statusElement) return;

    const interval = setInterval(() => {
        const now = new Date().getTime();

        if (now < startTime) {
            // Before tournament starts
            const timeLeft = startTime - now;
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            statusElement.innerText = "Starts in:";
            timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else if (now >= startTime && now < endTime) {
            // Tournament is live
            const timeLeft = endTime - now;
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            statusElement.innerText = `Live: Ends in:`;
            timerElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            // Tournament has ended
            statusElement.innerText = "Ended";
            timerElement.innerText = "";
            clearInterval(interval);
        }
    }, 1000); 
}
