from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
# import joblib  # If you're using a pre-trained model (e.g., from scikit-learn or similar)

app = Flask(__name__)
CORS(app)

#TODO: Load your trained machine learning model
# model = joblib.load('path_to_your_model.pkl')

@app.route('/predict-yield', methods=['GET'])
def predict_yield():
    slider_values = request.args.to_dict()
    
    # for test
    print(f"slider_values: {slider_values}")

    # Convert slider values to the appropriate data types (e.g., float, int)
    try:
        slider_values = {key: float(value) for key, value in slider_values.items()}
    except ValueError as e:
        return jsonify({"error": "Invalid input data", "message": str(e)}), 400

    #TODO: replace this with your model
    # prediction = model.prediction(slider_values.values())
    prediction = sum(slider_values.values()) 

    # for test
    print(f"prediction: {prediction}")

    return jsonify({"prediction": prediction})

if __name__ == '__main__':
    app.run(debug=True)
