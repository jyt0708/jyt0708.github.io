from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from .data_access import *
import os
from .chat_bot import *
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/geojson/<path:filename>')
def serve_geojson(filename):
    current_file = os.path.abspath(__file__)
    current_directory = os.path.dirname(current_file)
    return send_from_directory(current_directory, filename)


# Function to parse month name into a number
def parse_month(month):
    months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ]
    month = month.lower()
    return months.index(month) + 1 if month in months else None

# Function to extract months from the message
def extract_months(message):
    words = message.split()
    start_month, end_month = None, None
    for word in words:
        month_num = parse_month(word)
        if month_num:
            if not start_month:
                start_month = month_num
            elif not end_month:
                end_month = month_num
    return start_month, end_month

# API endpoint to handle chat requests
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    message = data.get("message", "").lower()
    start_month, end_month = extract_months(message)
    nlp, matcher = start()
    crop, weather, city = parse_input(message, nlp, matcher)
    # response = get_response(crop, weather, city, start_month, end_month)

    # Check if the user is asking for recommendations
    if "recommendation" in message or "recommendations" in message:
        # Generate recommendations for the last bad conditions
        response = get_recommendation_for_bad_conditions()
    else:
        # Handle normal queries
        response = get_response(crop, weather, city, start_month, end_month)

    return jsonify({"response": response});

if __name__ == "__main__":
    app.run(debug=True)
