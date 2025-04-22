document.addEventListener('DOMContentLoaded', async () => {
    const tournamentData = {
        tournamentName: "Subway Surfers",
        tournamentImgUrl: "./Assets/_games/_img/subway.jpeg",
        tournamentReward: "5000"
    }

    try {
        const response = await fetch(`${API_BASE_URL}/new_tournaments`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(tournamentData)
        })
        const result = await response.json();
        console.log("Server Response:", result);

    } catch (error) {
        
    }
})