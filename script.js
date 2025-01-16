document.getElementById('dewpoint').oninput = function () {
    document.getElementById('dewpointValue').textContent = this.value + '°C';
};

document.getElementById('temperature').oninput = function() {
    document.getElementById('tempValue').textContent = this.value + '°C';
};

document.getElementById('soilTemp').oninput = function() {
    document.getElementById('soilTempValue').textContent = this.value + '°C';
};

document.getElementById('snow').oninput = function() {
    document.getElementById('snowValue').textContent = this.value + ' cm';
};

document.getElementById('soilEvap').oninput = function() {
    document.getElementById('soilEvapValue').textContent = this.value + ' mm';
};

document.getElementById('radiation').oninput = function() {
    document.getElementById('radiationValue').textContent = this.value + ' W/m²';
};

document.getElementById('runoff').oninput = function() {
    document.getElementById('runoffValue').textContent = this.value + ' mm';
};

document.getElementById('totalEvap').oninput = function() {
    document.getElementById('totalEvapValue').textContent = this.value + ' mm';
};

document.getElementById('precip').oninput = function() {
    document.getElementById('precipValue').textContent = this.value + ' mm';
};

document.getElementById('district').oninput = function() {
    document.getElementById('districtValue').textContent = 'District ' + this.value;
};


// Collect slider values and send to the backend
function sendSliderValues() {
    const sliderValues = {
        dewpoint: document.getElementById('dewpoint').value,
        temperature: document.getElementById('temperature').value,
        soilTemp: document.getElementById('soilTemp').value,
        snow: document.getElementById('snow').value,
        soilEvap: document.getElementById('soilEvap').value,
        radiation: document.getElementById('radiation').value,
        runoff: document.getElementById('runoff').value,
        totalEvap: document.getElementById('totalEvap').value,
        precip: document.getElementById('precip').value,
        district: document.getElementById('district').value,
    };

    // Send the data to the backend via POST
    fetch('/update-slider-values', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sliderValues)
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}

// Trigger the sendSliderValues function when sliders are updated
const sliders = document.querySelectorAll('input[type="range"]');
sliders.forEach(slider => {
    slider.addEventListener('input', sendSliderValues);
});
