import spacy
from spacy.matcher import Matcher
from .data_access import *
"""
Possible questions to ask:
  1. Crop:
  2. Crop & City:  Is growing crop x possible in city y?
    2.1 Any recommendations?
  3. Crop & City & Month: Is growing crop x in city y in month a-b possible?
    3.1 Any recommendations?
"""

context = {
    "last_result": None,
    "last_bad_conditions": None,
    "last_crop": None,
    "last_weather": None,
    "last_city": None
}


def get_recommendation_for_bad_conditions():
    """Generate recommendations for bad conditions."""
    recommendations_texts = []
    crop = context['last_crop']
    bad_conditions = context["last_bad_conditions"]
    city = context['last_city']

    # Updated mapping of parameters to recommendations and interventions
    parameter_recommendations = {
        "2m_dewpoint_temperature": {
            "low": "The dewpoint temperature is too low, which could indicate drought. I recommend implementing irrigation systems or mulching to retain soil moisture.",
            "high": "High dewpoint temperature can lead to high humidity, increasing the risk of fungal and bacterial diseases. Improve ventilation or use disease-resistant crop varieties."
        },
        "runoff": {
            "low": "Low runoff may indicate drought conditions. Consider rainwater harvesting or irrigation to address the water deficit.",
            "high": "High runoff could signal potential flooding or soil erosion. Implement soil conservation practices or water retention systems."
        },
        "soil_temperature_level_2": {
            "low": "Low soil temperature might indicate drought. Use mulching or irrigation to retain soil moisture and reduce heat loss.",
            "high": "High soil temperature can accelerate evaporation, worsening drought conditions. Apply shading techniques or increase irrigation to mitigate water loss."
        },
        "surface_net_solar_radiation": {
            "low": "Low solar radiation can decrease crop yield. Consider subsidies for shade-tolerant or low-light-adapted crop varieties and policies to prevent deforestation or pollution.",
            "high": "High solar radiation is generally good for crops. Ensure adequate water supply to sustain growth."
        },
        "total_evaporation": {
            "low": "Low total evaporation is good for maintaining soil moisture. Monitor water balance to prevent over-saturation.",
            "high": "High total evaporation could indicate drought due to excessive water loss. Use mulching or drip irrigation to conserve water."
        },
        "total_precipitation": {
            "low": "Low precipitation indicates drought. Implement rainwater harvesting or irrigation systems to compensate.",
            "high": "High precipitation is generally good, but excessive rainfall may cause flooding. Improve drainage systems and adopt policies to prevent deforestation."
        },
        "2m_temperature": {
            "low": "Low temperature may hinder crop growth. Use greenhousing or thermal covers to maintain optimal conditions.",
            "high": "High temperature can stress crops. Grow heat-resistant varieties or implement shading and cooling techniques."
        },
    }

    for condition in bad_conditions:
        parameter = condition['parameter']
        actual = condition['actual_value']
        required_range = condition['required_range']

        # Determine if the value is too low or too high
        if actual < required_range[0]:
            action = parameter_recommendations.get(parameter, {}).get(
                "low",
                f"No specific recommendation available for increasing {parameter}."
            )
            recommendation = (
                f"The {parameter} in {city} is lower than the required range for {crop}. "
                f"{action}\n"
            )
        elif actual > required_range[1]:
            action = parameter_recommendations.get(parameter, {}).get(
                "high",
                f"No specific recommendation available for reducing {parameter}."
            )
            recommendation = (
                f"The {parameter} in {city} is higher than the required range for {crop}."
                f"{action}\n"
            )
        else:
            recommendation = (
                f"The {parameter} in {city} is within the required range for {crop} "
                f"(actual: {actual}, required: {required_range[0]} to {required_range[1]}).\n"
            )

        recommendations_texts.append(recommendation)

    return "\n".join(recommendations_texts)


# def get_recommendation_for_bad_conditions():
#     """Generate recommendations for bad conditions."""
#     recommendations_texts = []
#     crop = context['last_crop']
#     bad_conditions = context["last_bad_conditions"]
#     city = context['last_city']
#
#     for condition in bad_conditions:
#         parameter = condition['parameter']
#         actual = condition['actual_value']
#         required_range = condition['required_range']
#         recommendation = recommendations.get(crop, {}).get(
#             parameter.lower(),
#             f"No specific recommendation available for {crop} under the condition: {parameter}."
#         )
#         recommendations_texts.append(
#             f"Condition: {parameter} (actual: {actual}, required: {required_range[0]} to {required_range[1]}). Recommendation: {recommendation}"
#         )
#     return "\n".join(recommendations_texts)


# Predefined list of crops
crops = [
    "spring barley", "winter barley", "grain maize", "silage maize", "oats",
    "potatoes", "winter rape", "rye", "sugarbeet", "triticale", "winter wheat"
]
weather_conditions =  ["drought", "heavy rain", "rain"]

# Load spaCy model
def start():
    cities = get_cities()
    nlp = spacy.load("en_core_web_sm")

    # Set up spaCy Matcher
    matcher = Matcher(nlp.vocab)
    matcher.add("CROP",
                [[{"LOWER": crop.split()[0]}, {"LOWER": crop.split()[1]}] if " " in crop else [{"LOWER": crop}] for crop
                 in
                 crops])
    matcher.add("CITY", [[{"LOWER": city}] for city in cities])
    matcher.add("WEATHER", [[{"LOWER": "drought"}], [{"LOWER": "rain"}], [{"LOWER": "heavy"}, {"LOWER": "rain"}]])
    return nlp, matcher


def parse_input(user_input, nlp, matcher):
    """Extract crop, weather, and city from user input."""
    doc = nlp(user_input)
    matches = matcher(doc)
    cities = get_cities()

    crop = None
    weather = None
    city = None

    for match_id, start, end in matches:
        match = doc[start:end].text.lower()

        # Check for crop matches
        if crop is None:  # Only assign if crop hasn't been set
            for full_crop in crops:
                if match in full_crop:
                    crop = full_crop
                    break

        # Check for weather matches
        if weather is None:  # Only assign if weather hasn't been set
            for full_weather in weather_conditions:
                if match in full_weather.lower():
                    weather = full_weather
                    break

        # Check for city matches
        if city is None:  # Only assign if city hasn't been set
            for full_city in cities:
                if match in full_city.lower():  # Check if partial match exists
                    city = full_city  # Store the full city name
                    break

    return crop, weather, city



def get_response(crop, weather, city, start_month, end_month):
    """Generate response based on crop, weather, and city."""

    # Mapping of cities and codes
    # {'flensburg, kreisfreie stadt': '01001', 'kiel, kreisfreie stadt': '01002', ...}
    global context
    city_mapping = create_city_mapping()

    if city and crop:
        # Handle case when city and crop are provided but no weather condition
        city_code = city_mapping.get(city)
        try:
            # Fetch city climate data
            print(f"City {city} and Crop {crop} dected, start month: {start_month}, end month: {end_month}")
            city_climate_data = calculate_city_averages((start_month, end_month), city_code)
            crop_ranges_list = convert_json_to_dict('crop_shield/crop_condition.json')
            crop_requirement_list = parse_crop_requirements(crop_ranges_list)

            # Check suitability
            result = calculate_crop_suitability(city_climate_data, crop_requirement_list, crop)

            # Format response
            good_conditions = ", ".join(result['conditions_met'])
            bad_conditions = ", ".join(
                f"{item['parameter']} (Actual: {item['actual_value']}. Required: {item['required_range'][0]} to {item['required_range'][1]})"
                for item in result['conditions_failed']
            )

            bad_conditions_context = [
                {
                    "parameter": item['parameter'],
                    "actual_value": item['actual_value'],
                    "required_range": item['required_range']
                }
                for item in result['conditions_failed']
            ]

            context["last_result"] = result
            context["last_bad_conditions"] = bad_conditions_context
            context["last_crop"] = crop
            context["last_city"] = city

            # Use "is" for singular and "are" for plural conditions
            good_verb = "is" if len(result['conditions_met']) == 1 else "are"
            bad_verb = "is" if len(result['conditions_failed']) == 1 else "are"

            return (f"Suitability score of growing {result['crop']} in {city}: {result['suitability_score']:.2f}. \n"
                    f"\nThe {good_conditions} {good_verb} good. \n"
                    f"\nThe {bad_conditions} condition {bad_verb} not good.")
        except FileNotFoundError as e:
            print(e)
            return f"Error accessing data: {e}"
        except Exception as e:
            print(e)
            return f"An error occurred while processing your request: {e}"

    if city:
        return f"{city.capitalize()} is supported. Please specify a crop or weather scenario for more details."

    # if weather:


    if crop and weather:
        # Handle crop-weather recommendations
        return recommendations.get(crop, {}).get(
            weather, f"No specific recommendation available for {crop} under {weather}."
        )

    if crop:
        return f"{crop.capitalize()} is a valid crop. You can ask about its suitability for specific cities or weather conditions."

    return "Sorry, I couldn't understand your question. Please ask about a crop, city, or weather scenario."


def chat_with_bot():
    """Main loop for live chatbot interaction."""
    print("Chatbot: Hello! Ask me about cities, crops, or weather scenarios for recommendations. Type 'exit' to quit.")
    while True:
        user_input = input("You: ").strip().lower()
        if user_input == "exit" or user_input == "Thanks":
            print("Chatbot: Goodbye!")
            break
        nlp, matcher = start()
        crop, weather, city = parse_input(user_input, nlp, matcher)
        if "recommendation" in user_input and context["last_bad_conditions"]:
            # Generate recommendations for the last bad conditions
            response = get_recommendation_for_bad_conditions(context["last_crop"], context["last_bad_conditions"])
        else:
            # Handle normal queries
            response = get_response(crop, weather, city, start_month=None, end_month=None)
        print(f"Chatbot: {response}")


# Run the chatbot
# chat_with_bot()
