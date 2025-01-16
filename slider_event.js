// Function to toggle visibility of sliders based on checkbox status
function toggleSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    const checkbox = document.getElementById(sliderId + 'Checkbox');
    if (checkbox.checked) {
        slider.style.display = 'block';
    } else {
        slider.style.display = 'none';
    }
}

// Function to update slider values
function updateSliderValue(sliderId, value) {
    const valueDisplay = document.getElementById(sliderId + 'Value');
    valueDisplay.textContent = value;
}

/**
 * Retrieves the current values of all sliders on the page.
 * 
 * @returns {Object<string, string>} An object where the keys are slider IDs and the values are their current values.
 */
function getAllSliderValues() {

    const sliderValues = {};

    // Select all input sliders in the document
    const sliders = document.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
        const sliderId = slider.id;
        const value = slider.value;
        sliderValues[sliderId] = value;
    });

    return sliderValues;
}

async function getPrediction() {
    const sliderValues = getAllSliderValues();
    const queryString = new URLSearchParams(sliderValues).toString();

    try {
        // Send a GET request to the Flask server with the query parameters
        const response = await fetch(`http://localhost:5000/predict-yield?${queryString}`, {
            method: "GET",
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // For test
        console.log("Prediction Data:", data);

        if (data.prediction !== undefined) {
            document.getElementById('yied-result').innerText = `Result: ${data.prediction}`;
        } else {
            console.error("Prediction not found in the response:", data);
        }

    } catch (error) {
        // Log any errors that occur during the fetch process
        console.error("Error fetching data:", error);
    }
}

// Add event listeners to each slider for updating the displayed value
document.addEventListener('DOMContentLoaded', function () {
    toggleSlider('temperature');
    toggleSlider('soilEvap');
    toggleSlider('radiation');
    toggleSlider('precip');
    toggleSlider('dewpoint');
    toggleSlider('snow');
    toggleSlider('runoff');
    toggleSlider('totalEvap');

    // Update value when sliders are moved
    document.getElementById('temperatureSlider').addEventListener('input', function () {
        updateSliderValue('temperature', this.value + '°C');
        getPrediction();
    });

    document.getElementById('soilEvapSlider').addEventListener('input', function () {
        updateSliderValue('soilEvap', this.value + ' mm');
        getPrediction();
    });

    document.getElementById('radiationSlider').addEventListener('input', function () {
        updateSliderValue('radiation', this.value + ' W/m²');
        getPrediction();
    });

    document.getElementById('precipSlider').addEventListener('input', function () {
        updateSliderValue('precip', this.value + ' mm');
        getPrediction();
    });

    document.getElementById('dewpointSlider').addEventListener('input', function () {
        updateSliderValue('dewpoint', this.value + '°C');
        getPrediction();
    });

    document.getElementById('snowSlider').addEventListener('input', function () {
        updateSliderValue('snow', this.value + ' cm');
        getPrediction();
    });

    document.getElementById('runoffSlider').addEventListener('input', function () {
        updateSliderValue('runoff', this.value + ' mm');
        getPrediction();
    });

    document.getElementById('totalEvapSlider').addEventListener('input', function () {
        updateSliderValue('totalEvap', this.value + ' mm');
        getPrediction();
    });
});
