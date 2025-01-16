// Function to update the displayed slider value

// get values for all sliders
function getSliderValues() {
    return {
        dewpoint: document.getElementById("dewpoint").value,
        temperature: document.getElementById("temperature").value,
        soilTemp: document.getElementById("soilTemp").value,
        snow: document.getElementById("snow").value,
        soilEvap: document.getElementById("soilEvap").value,
        radiation: document.getElementById("radiation").value,
        runoff: document.getElementById("runoff").value,
        totalEvap: document.getElementById("totalEvap").value,
        precip: document.getElementById("precip").value,
        district: document.getElementById("district").value,
    };
}

// Function to handle the "Submit" button click
document.getElementById("submitButton").addEventListener("click", function() {
    // Get slider values as an object
    const sliderValues = getSliderValues();

    // Convert the object to a query string
    const queryString = new URLSearchParams(sliderValues).toString();

    // Send a GET request with the slider values in the query string
    fetch(`http://localhost:5000/fetch-data?${queryString}`, {
        method: "GET",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data fetched from database:", data);
            // You can display the fetched data here
        })
        .catch(error => console.error("Error fetching data:", error));
});

function updateSliderValue(sliderId, displayId, unit) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);

    // Add event listener for live updates
    slider.addEventListener('input', function () {
        display.textContent = this.value + unit;
        console.log(`${sliderId}: ${this.value}${unit}`); // Log the live value
    });
}

// Attach event listeners to each slider
updateSliderValue('dewpoint', 'dewpointValue', '°C');
updateSliderValue('temperature', 'tempValue', '°C');
updateSliderValue('soilTemp', 'soilTempValue', '°C');
updateSliderValue('snow', 'snowValue', ' cm');
updateSliderValue('soilEvap', 'soilEvapValue', ' mm');
updateSliderValue('radiation', 'radiationValue', ' W/m²');
updateSliderValue('runoff', 'runoffValue', ' mm');
updateSliderValue('totalEvap', 'totalEvapValue', ' mm');
updateSliderValue('precip', 'precipValue', ' mm');
updateSliderValue('district', 'districtValue', ''); // No unit for district, handled separately

// Special handling for District slider
document.getElementById('district').addEventListener('input', function () {
    const districtValue = document.getElementById('districtValue');
    districtValue.textContent = `District ${this.value}`;
    console.log(`district: District ${this.value}`);
});


document.getElementById("submitButton").addEventListener("click", function() {
    const data = {
        dewpoint: document.getElementById("dewpoint").value,
        temperature: document.getElementById("temperature").value,
        soilTemp: document.getElementById("soilTemp").value
    };

    fetch("/process-sliders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => console.log("Success:", data))
        .catch(error => console.error("Error:", error));
});
