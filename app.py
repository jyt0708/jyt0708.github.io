from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/process-sliders', methods=['POST'])
def process_sliders():
    data = request.json
    dewpoint = data['dewpoint']
    temperature = data['temperature']
    soil_temp = data['soilTemp']

    return jsonify({"result": result})

@app.route('/fetch-data', methods=['GET'])
def fetch_data():
    # Retrieve slider values from query parameters
    dewpoint = request.args.get('dewpoint')
    temperature = request.args.get('temperature')
    soil_temp = request.args.get('soilTemp')
    snow = request.args.get('snow')
    soil_evap = request.args.get('soilEvap')
    radiation = request.args.get('radiation')
    runoff = request.args.get('runoff')
    total_evap = request.args.get('totalEvap')
    precip = request.args.get('precip')
    district = request.args.get('district')

    # Example: Query the database using these values (mocked here)
    # Replace this with your actual database logic
    data = {
        "dewpoint": dewpoint,
        "temperature": temperature,
        "soil_temp": soil_temp,
        "snow": snow,
        "soil_evap": soil_evap,
        "radiation": radiation,
        "runoff": runoff,
        "total_evap": total_evap,
        "precip": precip,
        "district": district,
    }

    print(data);

    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
