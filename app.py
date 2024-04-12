from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder='templates')

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

def insert_trajectory():
    # Here you can handle the insertion of trajectory
    return jsonify({"message": "Insert trajectory functionality to be implemented"})

def query_data():
    # Here you can handle the querying of data
    return jsonify({"message": "Query functionality to be implemented"})

if __name__ == '__main__':
    app.run(debug=True)
