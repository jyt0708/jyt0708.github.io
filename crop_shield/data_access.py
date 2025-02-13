import json, math, csv
from collections import defaultdict

def create_city_mapping():
    city_mapping = {}
    with open('crop_shield/List_of _the_cities.csv', mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            city_code = row["district_no"]
            city_name = row["district"]
            city_name = row["district"].split(',')[0].strip()
            city_mapping[city_name.lower()] = city_code
    return city_mapping

def get_cities():
    cities = []
    with open('crop_shield/List_of _the_cities.csv', mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            city_name = row["district"].split(',')[0].strip()
            if city_name.lower() not in cities:  # Check if it's already in the list
                cities.append(city_name.lower())
    return cities

def remove_nan_values(data):
    if isinstance(data, dict):
        # If data is a dictionary, iterate over the items
        return {key: remove_nan_values(value) for key, value in data.items() if value is not None and not (isinstance(value, (float, int)) and math.isnan(value))}
    elif isinstance(data, list):
        # If data is a list, iterate over the elements
        return [remove_nan_values(item) for item in data if item is not None and not (isinstance(item, (float, int)) and math.isnan(item))]
    else:
        return data


def calculate_city_averages(month_range, city_code):
    """
    Calculate the average of specified parameters for each city code over a given range of months.

    Parameters:
    - data: dict, the JSON data containing weather and crop information.
    - month_range: tuple(int, int), the start and end months (inclusive).

    Returns:
    - dict: City-wise averages of weather parameters over the specified range of months.
    """
    print("We are at caculate city averages.")
    # Open the JSON file and load the data
    jason_data = None
    with open('crop_shield/merged_result.json','r') as file:
        json_data = file.read()  # Read the file content as a string

    # Now use json.loads() to convert the string into a Python dictionary
    data = json.loads(json_data)
    data = remove_nan_values(data)

    years = [ "1979", "1980", "1981",
        "1982", "1983", "1984",
        "1985", "1986", "1987",
        "1988", "1989", "1990",
        "1991", "1992", "1993",
        "1994", "1995", "1996",
        "1997", "1998", "1999",
        "2000", "2001", "2002",
        "2003", "2004", "2005",
        "2006", "2007", "2008",
        "2009", "2010", "2011",
        "2012", "2013", "2014",
        "2015", "2016", "2017",
        "2018", "2019", "2020",
        "2021"]

    start_month, end_month = month_range
    start_month = 1 if start_month is None else start_month
    end_month = 12 if end_month is None else end_month
    sum_temperature = 0
    sum_dewpoint = 0
    sum_soil_temperature = 0
    sum_snow_cover = 0
    sum_evaporation = 0
    sum_evaporation_soil = 0
    sum_solar_radiation = 0
    sum_preciptation = 0
    sum_runoff = 0
    city_code = city_code.lstrip('0')

    # Handle case where start month is greater than end month (wrap around)
    if start_month <= end_month:
        months_to_process = range(start_month, end_month + 1)
    else:
        months_to_process = list(range(start_month, 13)) + list(range(1, end_month + 1))

    # city_codes = list(data_keys())
    city_averages = {}
    month_count = 0

    for year in years:
        # city_data = data[city_code][year]['climate_data']
        for month in months_to_process:
            month_str = f"month_{month:02d}"
            month_data = data[str(city_code)][str(year)]["climate_data"].get(month_str)
            if month_data:
                # Add the values to the sums
                sum_temperature += month_data.get("2 metre temperature", 0)
                sum_soil_temperature += month_data.get("Soil temperature level 2", 0)
                sum_evaporation += month_data.get("Evaporation", 0)
                sum_solar_radiation += month_data.get("Surface net short-wave (solar) radiation", 0)
                sum_dewpoint = month_data.get("2 metre dewpoint temperature", 0)
                sum_snow_cover = month_data.get("Snow cover", 0)
                sum_evaporation_soil = month_data.get("Evaporation", 0)
                sum_preciptation = month_data.get("Total preciptation", 0)
                sum_runoff = month_data.get("Runoff", 0)

                # Increment month count
                month_count += 1
    if month_count == 0:
        return {
            "avg_temperature": None,
            "avg_soil_temperature": None,
            "avg_evaporation": None,
            "avg_solar_radiation": None,
            "avg_dewpoint": None,
            "avg_snow_cover": None,
            "avg_evaporation_soil": None,
            "avg_preciptation": None,
            "avg_runoff": None
        }

    # Calculate the averages and round to 2 decimal places
    avg_temperature = round(sum_temperature / month_count, 2)
    avg_soil_temperature = round(sum_soil_temperature / month_count, 2)
    avg_evaporation = round(sum_evaporation / month_count, 5)
    avg_solar_radiation = round(sum_solar_radiation / month_count, 2)
    avg_dewpoint = round(sum_dewpoint / month_count, 3)
    avg_snow_cover = round(sum_snow_cover / month_count, 5)
    avg_evaporation_soil = round(sum_evaporation_soil / month_count, 5)
    avg_preciptation = round(sum_preciptation / month_count, 5)
    avg_runoff = round(sum_runoff / month_count, 5)

    return {
        "avg_temperature": avg_temperature,
        "avg_soil_temperature": avg_soil_temperature,
        "avg_evaporation": avg_evaporation,
        "avg_solar_radiation": avg_solar_radiation,
        "avg_dewpoint": avg_dewpoint,
        "avg_snow_cover": avg_snow_cover,
        "avg_evaporation_soil": avg_evaporation_soil,
        "avg_preciptation": avg_preciptation,
        "avg_runoff": avg_runoff
    }


def convert_json_to_dict(json_file):
    """
    Convert the JSON file containing approximate ranges for each crop and climate variable
    into a dictionary.

    :param json_file: Path to the JSON file
    :return: A dictionary containing the crop climate ranges
    """
    with open(json_file, 'r') as file:
        data = json.load(file)

    # Convert the data into a list of dictionaries for easier processing
    crop_ranges = []

    for crop, parameters in data['crops'].items():
        for param, value_range in parameters.items():
            crop_ranges.append({
                "crop": crop,
                "parameter": param,
                "min": value_range['min'],
                "max": value_range['max']
            })

    return crop_ranges


def parse_crop_requirements(requirements_list):
    """
    Parse the list of crop requirements into a structured dictionary.

    Parameters:
    requirements_list (list): List of dictionaries containing crop requirements

    Returns:
    dict: Nested dictionary of crop requirements organized by crop and parameter
    """
    crop_requirements = {}

    for req in requirements_list:
        crop = req['crop']
        parameter = req['parameter']

        if crop not in crop_requirements:
            crop_requirements[crop] = {}

        # Store min and max values for each parameter
        crop_requirements[crop][parameter] = {
            'min': req['min'],
            'max': req['max']
        }

    return crop_requirements


def calculate_crop_suitability(city_climate_data, crop_requirements_list, crop_name):
    """
    Calculate the suitability of a specific crop for a given city based on climate data
    and crop requirements.

    Parameters:
    city_climate_data (dict): Average climate data for the city during specific months.
    crop_requirements_list (dict): Dictionary containing crop requirements.
    crop_name (str): Name of the crop to analyze.

    Returns:
    dict: Dictionary containing suitability analysis for the specified crop.
    """
    # Ensure crop_name exists in the requirements list
    if crop_name not in crop_requirements_list:
        raise ValueError(f"No requirements found for crop: {crop_name}")

    # Extract the requirements for the specified crop
    crop_requirements = crop_requirements_list[crop_name]

    # Map climate data keys to requirement parameter names
    climate_param_mapping = {
        'avg_dewpoint': '2m_dewpoint_temperature',
        'avg_temperature': '2m_temperature',
        'avg_soil_temperature': 'soil_temperature_level_2',
        'avg_snow_cover': 'snow_cover',
        'avg_evaporation_soil': 'evaporation_from_bare_soil',
        'avg_solar_radiation': 'surface_net_solar_radiation',
        'avg_runoff': 'runoff',
        'avg_evaporation': 'total_evaporation',
        'avg_precipitation': 'total_precipitation'
    }

    # Convert climate data keys to match requirement parameters
    standardized_climate_data = {
        climate_param_mapping.get(k, k): v
        for k, v in city_climate_data.items()
    }

    # Initialize suitability metrics
    conditions_met = []
    conditions_failed = []

    # Check each required condition
    for parameter, limits in crop_requirements.items():
        if parameter in standardized_climate_data:
            value = abs(standardized_climate_data[parameter])
            min_val = limits['min']
            max_val = limits['max']

            if min_val <= value <= max_val:
                conditions_met.append(parameter)
            else:
                conditions_failed.append({
                    'parameter': parameter,
                    'actual_value': value,
                    'required_range': (min_val, max_val)
                })

    # Calculate suitability score
    total_conditions = len(crop_requirements)
    met_conditions = len(conditions_met)
    suitability_score = (met_conditions / total_conditions) * 100

    if suitability_score >= 40:
        suitability_score += 10
    suitability_score = min(suitability_score, 100)

    # Determine overall suitability status
    if suitability_score == 100:
        status = "Highly Suitable"
    elif suitability_score >= 75:
        status = "Moderately Suitable"
    elif suitability_score >= 50:
        status = "Marginally Suitable"
    else:
        status = "Not Suitable"

    # Return results for the crop
    return {
        'crop': crop_name,
        'status': status,
        'suitability_score': round(suitability_score, 2),
        'conditions_met': conditions_met,
        'conditions_failed': conditions_failed
    }






# if __name__ == '__main__':
   # Now use json.loads() to convert the string into a Python dictionary
   # jason_data = None
   # with open('merged_result.json', 'r') as file:
   #     json_data = file.read()  # Read the file content as a string
   #
   # # Now use json.loads() to convert the string into a Python dictionary
   # data = json.loads(json_data)
   # data = remove_nan_values(data)
   # month_str = f"month_{1:02d}"
   # city_code = 1002
   # print(data[str(city_code)]["1979"]['climate_data'].get(month_str))
   # year_1002 = data["1002"]["1979"]
    # month = 3
    # month_str = f"month_{month:02d}"
    # # print(month_str)
    # # print(year_1002["climate_data"].get(month_str))
    #
    # city_climate_data = calculate_city_averages('merged_result.json', (4,10), "09184")
    # crop_ranges_list = convert_json_to_dict('crop_condition.json')
    # crop_requirement_list = parse_crop_requirements(crop_ranges_list)
    # result = calculate_crop_suitability(city_climate_data, crop_requirement_list, 'potatoes')
    # print(result)


