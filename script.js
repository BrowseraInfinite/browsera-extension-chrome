function updateClock() {
    const now = new Date();
    
    // Time: 12:36
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    // Date: Tuesday, June 23
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    document.getElementById('time').innerText = timeStr;
    document.getElementById('date').innerText = dateStr;
}

setInterval(updateClock, 1000);

updateClock();