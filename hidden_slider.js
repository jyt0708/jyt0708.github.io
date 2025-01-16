// Function to update the value of a slider and display it
function updateSliderValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueLabel = document.getElementById(valueId);
    valueLabel.textContent = slider.value + (sliderId === "2mTemperatureSlider" || sliderId === "soilTemperatureLevel2Slider" ? "°C" :
        sliderId === "evaporationFromBareSoilSlider" || sliderId === "totalEvaporationSlider" || sliderId === "runoffSlider" || sliderId === "snowCoverSlider" ? " mm" :
        sliderId === "surfaceNetSolarRadiationSlider" ? " W/m²" : " mm/day");
}

// Function to show or hide sliders based on checkbox selection
function toggleSlider(parameterId) {
    const checkbox = document.getElementById(parameterId + "Checkbox");
    const slider = document.getElementById(parameterId);

    if (checkbox.checked) {
        slider.style.display = "block";
    } else {
        slider.style.display = "none";
    }
}

// Initialize the sliders and checkbox events
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all sliders with their values
    updateSliderValue("2mTemperatureSlider", "2mTemperatureValue");
    updateSliderValue("soilTemperatureLevel2Slider", "soilTemperatureLevel2Value");
    updateSliderValue("evaporationFromBareSoilSlider", "evaporationFromBareSoilValue");
    updateSliderValue("surfaceNetSolarRadiationSlider", "surfaceNetSolarRadiationValue");
    updateSliderValue("totalPrecipitationSlider", "totalPrecipitationValue");
    updateSliderValue("2mDewpointTemperatureSlider", "2mDewpointTemperatureValue");
    updateSliderValue("snowCoverSlider", "snowCoverValue");
    updateSliderValue("runoffSlider", "runoffValue");
    updateSliderValue("totalEvaporationSlider", "totalEvaporationValue");

    // Attach event listeners to each slider to update values when changed
    document.getElementById("2mTemperatureSlider").addEventListener('input', () => updateSliderValue("2mTemperatureSlider", "2mTemperatureValue"));
    document.getElementById("soilTemperatureLevel2Slider").addEventListener('input', () => updateSliderValue("soilTemperatureLevel2Slider", "soilTemperatureLevel2Value"));
    document.getElementById("evaporationFromBareSoilSlider").addEventListener('input', () => updateSliderValue("evaporationFromBareSoilSlider", "evaporationFromBareSoilValue"));
    document.getElementById("surfaceNetSolarRadiationSlider").addEventListener('input', () => updateSliderValue("surfaceNetSolarRadiationSlider", "surfaceNetSolarRadiationValue"));
    document.getElementById("totalPrecipitationSlider").addEventListener('input', () => updateSliderValue("totalPrecipitationSlider", "totalPrecipitationValue"));
    document.getElementById("2mDewpointTemperatureSlider").addEventListener('input', () => updateSliderValue("2mDewpointTemperatureSlider", "2mDewpointTemperatureValue"));
    document.getElementById("snowCoverSlider").addEventListener('input', () => updateSliderValue("snowCoverSlider", "snowCoverValue"));
    document.getElementById("runoffSlider").addEventListener('input', () => updateSliderValue("runoffSlider", "runoffValue"));
    document.getElementById("totalEvaporationSlider").addEventListener('input', () => updateSliderValue("totalEvaporationSlider", "totalEvaporationValue"));

    // Initialize checkbox events for showing or hiding sliders
    document.getElementById("2mTemperatureCheckbox").addEventListener('change', () => toggleSlider('2m_temperature'));
    document.getElementById("soilTemperatureCheckbox").addEventListener('change', () => toggleSlider('soil_temperature_level_2'));
    document.getElementById("evapCheckbox").addEventListener('change', () => toggleSlider('evaporation_from_bare_soil'));
    document.getElementById("radiationCheckbox").addEventListener('change', () => toggleSlider('surface_net_solar_radiation'));
    document.getElementById("precipCheckbox").addEventListener('change', () => toggleSlider('total_precipitation'));
    document.getElementById("dewpointCheckbox").addEventListener('change', () => toggleSlider('2m_dewpoint_temperature'));
    document.getElementById("snowCheckbox").addEventListener('change', () => toggleSlider('snow_cover'));
    document.getElementById("runoffCheckbox").addEventListener('change', () => toggleSlider('runoff'));
    document.getElementById("totalEvapCheckbox").addEventListener('change', () => toggleSlider('total_evaporation'));
});
