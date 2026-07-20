// Road Trip Planner App Logic

let tripData = {
    stops: [],
    notes: ''
};

// DOM Elements
const stopInput = document.getElementById('stopInput');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const tripList = document.getElementById('tripList');
const stopCount = document.getElementById('stopCount');
const totalDistance = document.getElementById('totalDistance');
const tripNotes = document.getElementById('tripNotes');

// Load data from localStorage when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadTrip();
    renderTrip();
});

// Save data to localStorage whenever it changes
window.addEventListener('beforeunload', () => {
    saveTrip();
});

// Event Listeners
addBtn.addEventListener('click', addStop);
stopInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addStop();
});
clearAllBtn.addEventListener('click', clearAllStops);
exportBtn.addEventListener('click', exportTrip);
tripNotes.addEventListener('change', () => {
    tripData.notes = tripNotes.value;
    saveTrip();
});

// Add a new stop to the trip
function addStop() {
    const stopName = stopInput.value.trim();
    
    if (stopName === '') {
        alert('Please enter a city or location');
        return;
    }

    // Check for duplicates
    if (tripData.stops.some(stop => stop.name.toLowerCase() === stopName.toLowerCase())) {
        alert('This location is already in your trip!');
        stopInput.value = '';
        stopInput.focus();
        return;
    }

    // Add new stop
    const newStop = {
        id: Date.now(),
        name: stopName,
        order: tripData.stops.length + 1,
        distanceFromPrevious: tripData.stops.length > 0 ? estimateDistance() : 0
    };

    tripData.stops.push(newStop);
    
    // Clear input and re-render
    stopInput.value = '';
    stopInput.focus();
    renderTrip();
    saveTrip();
}

// Estimate distance between stops (simplified - adds 100-150 miles per stop for demo)
function estimateDistance() {
    return Math.floor(Math.random() * 50) + 100; // Random between 100-150 miles
}

// Calculate total distance
function calculateTotalDistance() {
    return tripData.stops.reduce((total, stop) => total + stop.distanceFromPrevious, 0);
}

// Render the trip list
function renderTrip() {
    tripList.innerHTML = '';

    if (tripData.stops.length === 0) {
        tripList.innerHTML = '<li class="empty-state">No stops added yet. Start planning your trip!</li>';
        stopCount.textContent = '0';
        totalDistance.textContent = '0 mi';
        return;
    }

    tripData.stops.forEach((stop, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="stop-info">
                <div class="stop-name">${index + 1}. ${escapeHtml(stop.name)}</div>
                <div class="stop-number">${index === 0 ? 'Starting Point' : `Distance from previous: ${stop.distanceFromPrevious} mi`}</div>
            </div>
            ${index > 0 ? `<div class="stop-distance">${stop.distanceFromPrevious} mi</div>` : ''}
            <button class="delete-btn" data-id="${stop.id}">Remove</button>
        `;

        // Add delete event listener
        li.querySelector('.delete-btn').addEventListener('click', () => deleteStop(stop.id));

        tripList.appendChild(li);
    });

    // Update stats
    stopCount.textContent = tripData.stops.length;
    const totalDist = calculateTotalDistance();
    totalDistance.textContent = `${totalDist} mi`;
}

// Delete a stop
function deleteStop(stopId) {
    tripData.stops = tripData.stops.filter(stop => stop.id !== stopId);
    renderTrip();
    saveTrip();
}

// Clear all stops
function clearAllStops() {
    if (tripData.stops.length === 0) {
        alert('No stops to clear!');
        return;
    }

    if (confirm('Are you sure you want to clear all stops? This cannot be undone.')) {
        tripData.stops = [];
        tripNotes.value = '';
        tripData.notes = '';
        renderTrip();
        saveTrip();
    }
}

// Export trip as text
function exportTrip() {
    if (tripData.stops.length === 0) {
        alert('Add some stops before exporting!');
        return;
    }

    let exportText = '=== ROAD TRIP ITINERARY ===\n\n';
    
    tripData.stops.forEach((stop, index) => {
        exportText += `${index + 1}. ${stop.name}`;
        if (index > 0) {
            exportText += ` (${stop.distanceFromPrevious} mi from previous)`;
        }
        exportText += '\n';
    });

    const totalDist = calculateTotalDistance();
    exportText += `\nTotal Distance: ${totalDist} miles\n`;
    exportText += `Total Stops: ${tripData.stops.length}\n`;

    if (tripData.notes) {
        exportText += `\n=== NOTES ===\n${tripData.notes}\n`;
    }

    exportText += `\nPlanned on: ${new Date().toLocaleDateString()}\n`;

    // Create downloadable file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportText));
    element.setAttribute('download', `road-trip-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('Trip exported successfully!');
}

// Save trip to localStorage
function saveTrip() {
    localStorage.setItem('roadTripData', JSON.stringify(tripData));
}

// Load trip from localStorage
function loadTrip() {
    const saved = localStorage.getItem('roadTripData');
    if (saved) {
        try {
            tripData = JSON.parse(saved);
            tripNotes.value = tripData.notes || '';
        } catch (e) {
            console.error('Error loading saved trip:', e);
            tripData = { stops: [], notes: '' };
        }
    }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Auto-save periodically
setInterval(saveTrip, 10000); // Save every 10 seconds
