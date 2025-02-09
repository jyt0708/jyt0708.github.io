const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;
console.log(chatbotToggler, closeBtn, chatbox);

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // return chat <li> element
}

// Function to generate response from Flask API
const generateResponse = async (chatElement) => {
    const input = document.querySelector('.chat-input input');
    const messageElement = chatElement.querySelector("p");

  try {
    const response = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Display bot response
    messageElement.textContent = "Bot: " + data.response.replace(/\*\*(.*?)\*\*/g, '$1');
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
}

// Handle sending messages
const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get the message and trim whitespace
  if (!userMessage) return;

  // Clear the input textarea
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." while waiting for a response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

// Adjust input textarea height
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Handle sending chat on Enter key
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});


sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Initialize the map
const map = L.map('map').setView([51.1657, 10.4515], 6);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
}).addTo(map);

const districtDropdown = document.getElementById('district-dropdown');
const highlightedDistricts = new Map();
const infoBoxContainer = document.getElementById('info-box-container');

// -----

let geoJsonLayer;

const defaultStyle = {
    fillColor: 'rgba(255, 255, 255, 0.8)',
    weight: 2,
    opacity: 1,
    color: 'grey',
    fillOpacity: 0.5
};

const highlightStyle = {
    fillColor: 'yellow',
    weight: 2,
    opacity: 1,
    color: 'orange',
    fillOpacity: 0.7
};

const cropColors = {
    "Potatoes": "#f4a261",
    "Silage Maize": "#2a9d8f",
    "Winter Wheat": "#e76f51",
    "Spring Barley": "#264653",
    "Sugarbeet": "#e9c46a",
    "Oats": "#a8dadc",
    "Rye": "#457b9d",
    "Canola": "#f94144"
};
/*

let isChatFirstOpened = true; // Flag to check if the chat box is being opened for the first time

function toggleChat() {
    const chatBox = document.querySelector('.chat-box');
    chatBox.style.display = chatBox.style.display === 'none' || chatBox.style.display === '' ? 'flex' : 'none';
}

function handleEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

async function sendMessage() {
    console.log('send message');
    const input = document.querySelector('.chat-input input');
    const messagesDiv = document.querySelector('.chat-messages');

    if (input.value.trim() !== '') {
        const userMessage = input.value.trim();
        const userMessageElem = document.createElement('p');
        userMessageElem.textContent = 'You: ' + userMessage;
        messagesDiv.appendChild(userMessageElem);

        // Send user message to the Flask backend
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        const botMessageElem = document.createElement('p');

        // Replace newlines with <br> to render line breaks in HTML
        botMessageElem.innerHTML = 'Bot: ' + data.response.replace(/\n/g, '<br>');

        setTimeout(() => messagesDiv.appendChild(botMessageElem), 500);

        input.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}
*/





// Fetch GeoJSON and add layers
fetch('http://127.0.0.1:5000/geojson/merged_counties_all.geojson')
    .then(response => response.json())
    .then(data => {
        console.log('Loaded GeoJSON data:', data); // Check if data is loaded
        geoJsonLayer = L.geoJSON(data, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => {
                console.log('Feature properties:', feature.properties); // Log each feature's properties
                const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

                // Add to dropdown
                const option = document.createElement('option');
                option.value = districtName;
                option.textContent = districtName;
                districtDropdown.appendChild(option);

                // Add click interactivity
                layer.on('click', () => toggleDistrictHighlight(layer, feature, filters));
            }
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds());
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// Toggle district highlight
function toggleDistrictHighlight(layer, feature, filters) {
    const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

    if (highlightedDistricts.has(layer)) {
        // Remove highlight and info box
        layer.setStyle(defaultStyle);
        highlightedDistricts.delete(layer);
        removeDistrictInfo(districtName);
    } else {
        // Highlight the district and add its info box with current filter values
        layer.setStyle(highlightStyle);
        highlightedDistricts.set(layer, districtName);
        addDistrictInfo(layer, feature, filters);
    }
}

function formatCropName(cropName) {
    const exceptions = {
        "potat_tot": "Potato",
        "silage_maize": "Silage Maize",
        "winter_wheat": "Winter Wheat",
        "spring_barley": "Spring Barley"
    };
    if (exceptions[cropName]) {
        return exceptions[cropName];
    }
    // Replace underscores with spaces and capitalize each word
    return cropName
        .split('_') // Split the string by underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join the words back with spaces
}

function addDistrictInfo(layer, feature, filters) {
    const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';
    const krsCode = Array.isArray(feature.properties.krs_code) ? feature.properties.krs_code[0] : 'Unknown Code';
    const climateData = feature.properties.climate_data || [];

    const matchingData = climateData.filter(entry =>
        entry["2 metre temperature"] === filters.temperature &&
        entry["Total precipitation"] === filters.precipitation &&
        entry["Surface net short-wave (solar) radiation"] === filters.radiation
    );

    let climateHtml = '<strong>Climate Data:</strong><ul>';
    let yieldHtml = '<strong>Top 3 Crops (t/ha):</strong><ul>';
    let bestCrop = null;

    if (matchingData.length > 0) {
        const params = matchingData[0];
        const temperature = params["2 metre temperature"] || "N/A";
        const precipitation = params["Total precipitation"] || "N/A";
        const radiation = params["Surface net short-wave (solar) radiation"] || "N/A";

        climateHtml += `
            <li>Temperature: ${temperature}\u00B0C</li>
            <li>Precipitation: ${precipitation} mm</li>
            <li>Solar Radiation: ${radiation} W/m<sup>2</sup></li>
        `;

        const maxYields = {};
        matchingData.forEach(entry => {
            const yields = entry["crop_yields_per_area"];
            if (yields) {
                for (const [crop, yieldValue] of Object.entries(yields)) {
                    if (!maxYields[crop] || yieldValue > maxYields[crop]) {
                        maxYields[crop] = yieldValue;
                    }
                }
            }
        });

        // Sort yields in descending order and select the top 3
        const sortedYields = Object.entries(maxYields)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        if (sortedYields.length > 0) {
            const [bestCropKey] = sortedYields[0];
            bestCrop = formatCropName(bestCropKey);

            sortedYields.forEach(([crop, yieldValue]) => {
                const formattedCropName = formatCropName(crop);
                yieldHtml += `<li>${formattedCropName}: ${yieldValue.toFixed(1)} t/ha</li>`;
            });
        }
    } else {
        climateHtml += '<li>No data matching filters.</li>';
        yieldHtml += '<li>No crop yield data available.</li>';
    }

    climateHtml += '</ul>';
    yieldHtml += '</ul>';

    const existingBox = document.getElementById(`info-box-${districtName}`);
    if (existingBox) {
        existingBox.innerHTML = `
            <strong>${districtName}</strong>
            <span>Code: ${krsCode}</span><br>
            ${climateHtml}
            ${yieldHtml}
        `;
    } else {
        const districtInfoBox = document.createElement('div');
        districtInfoBox.id = `info-box-${districtName}`;
        districtInfoBox.className = 'info-box';
        districtInfoBox.innerHTML = `
            <strong>${districtName}</strong>
            <span>Code: ${krsCode}</span><br>
            ${climateHtml}
            ${yieldHtml}
        `;
        infoBoxContainer.appendChild(districtInfoBox);
    }

    // Apply the best crop's color to the district
    if (bestCrop && cropColors[bestCrop]) {
        layer.setStyle({
            fillColor: cropColors[bestCrop],
            weight: 2,
            opacity: 1,
            color: 'grey',
            fillOpacity: 0.7
        });
    }
}

function createLegend() {
    const sliderContainer = document.getElementById('slider-container');
    const legend = document.createElement('div');
    legend.id = 'crop-legend';
    legend.style.marginTop = '10px';
    legend.style.padding = '10px';
    legend.style.background = 'white';
    legend.style.border = '1px solid grey';
    legend.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    legend.style.fontFamily = 'Arial, sans-serif';
    legend.style.fontSize = '14px';

    legend.innerHTML = '<strong>Crop Legend</strong><ul style="list-style: none; padding: 0; margin: 0;">';

    for (const [crop, color] of Object.entries(cropColors)) {
        legend.innerHTML += `<li style="margin: 5px 0;">
            <span style="display: inline-block; width: 20px; height: 10px; background: ${color}; margin-right: 5px;"></span>${crop}
        </li>`;
    }

    legend.innerHTML += '</ul>';
    sliderContainer.appendChild(legend);
}

// Call this function after the page loads or map initializes
createLegend();



// Update info boxes for all highlighted districts when sliders change
function updateDistrictInfoBoxes(filters) {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        if (highlightedDistricts.has(layer)) {
            addDistrictInfo(layer, feature, filters);
        }
    });
}

// Dropdown selection (preserve multiple selections)
districtDropdown.addEventListener('change', function () {
    const selectedDistrict = this.value;

    if (!selectedDistrict) {
        // If no district is selected, do nothing
        return;
    }

    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

        if (districtName === selectedDistrict) {
            // Highlight the district and add its info box
            if (!highlightedDistricts.has(layer)) {
                layer.setStyle(highlightStyle);
                highlightedDistricts.set(layer, districtName);
                addDistrictInfo(layer, feature, filters);
                map.fitBounds(layer.getBounds());
            }
        }
    });
});


// Event listeners for sliders
document.getElementById('temperature-slider').addEventListener('input', function () {
    filters.temperature = parseInt(this.value);
    document.getElementById('temperature-value').textContent = `${filters.temperature}\u00B0C`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('precipitation-slider').addEventListener('input', function () {
    filters.precipitation = parseInt(this.value);
    document.getElementById('precipitation-value').textContent = `${filters.precipitation} mm`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('radiation-slider').addEventListener('input', function () {
    filters.radiation = parseInt(this.value);
    document.getElementById('radiation-value').textContent = `${filters.radiation} W/m<sup>2</sup>`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('dewpoint-slider').addEventListener('input', function () {
    filters.dewpoint = parseInt(this.value);
    document.getElementById('dewpoint-value').textContent = `${filters.dewpoint}\u00B0C`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('snow-slider').addEventListener('input', function () {
    filters.snow = parseInt(this.value);
    document.getElementById('snow-value').textContent = `${filters.snow} cm`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('runoff-slider').addEventListener('input', function () {
    filters.runoff = parseInt(this.value);
    document.getElementById('runoff-value').textContent = `${filters.runoff} mm`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('totalEvap-slider').addEventListener('input', function () {
    filters.totalEvap = parseInt(this.value);
    document.getElementById('totalEvap-value').textContent = `${filters.totalEvap} mm`;
    updateDistrictInfoBoxes(filters);
});

document.getElementById('soilEvap-slider').addEventListener('input', function () {
    filters.soilEvap = parseInt(this.value);
    document.getElementById('soilEvap-value').textContent = `${filters.soilEvap} mm`;
    updateDistrictInfoBoxes(filters);
});

// Filters initialization
const filters = {
    temperature: 12,
    precipitation: 35,
    radiation: 5,
    dewpoint: 15,
    snow: 0,
    runoff: 1,
    totalEvap: 3,
    soilEvap: 2
    // TODO: add other parameters
};


function updateDistrictInfoBoxes(filters) {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;

        if (highlightedDistricts.has(layer)) {
            addDistrictInfo(layer, feature, filters);
        }
    });
}

function removeDistrictInfo(districtName) {
    const box = document.getElementById(`info-box-${districtName}`);
    if (box) {
        box.remove();
    }
}

// Select All functionality
document.getElementById('select-all-btn').addEventListener('click', () => {
    geoJsonLayer.eachLayer(layer => {
        const feature = layer.feature;
        const districtName = Array.isArray(feature.properties.krs_name) ? feature.properties.krs_name[0] : 'Unknown District';

        if (!highlightedDistricts.has(layer)) {
            // Highlight the district and add its info box
            layer.setStyle(highlightStyle);
            highlightedDistricts.set(layer, districtName);
            addDistrictInfo(layer, feature, filters);
        }
    });
});

document.getElementById('deselect-all-btn').addEventListener('click', () => {
    // Iterate through all highlighted layers
    highlightedDistricts.forEach((districtName, layer) => {
        // Reset layer style to default
        layer.setStyle(defaultStyle);

        // Remove the corresponding info box
        removeDistrictInfo(districtName);
    });

    // Clear the map of highlighted districts
    highlightedDistricts.clear();
});


function toggleSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    const checkbox = document.getElementById(sliderId + 'Checkbox');
    if (checkbox.checked) {
        slider.style.display = 'block';
    } else {
        slider.style.display = 'none';
    }
}