from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__, template_folder='templates')
CORS(app, origins=['http://127.0.0.1:5000'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/endpoint', methods=['POST'])
def endpoint():
    selected_item = request.form['item']
    if selected_item == 'Insert trajectory':
        return insert_trajectory()
    elif selected_item == 'Query':
        return query_data()
    else:
        return "Unknown item"

# @app.route('/insert', methods=['POST'])
# def insert_trajectory():
#     data = request.get_json()
    
#     x = requests.post("http://localhost:8080/insert", json = data)

#     return jsonify(data), 200


def insert_trajectory():
    # Here you can handle the insertion of trajectory
    return jsonify({"message": "Insert trajectory functionality to be implemented"})

def query_data():
    # Here you can handle the querying of data
    return jsonify({"message": "Query functionality to be implemented"})

if __name__ == '__main__':
    app.run(debug=True)
