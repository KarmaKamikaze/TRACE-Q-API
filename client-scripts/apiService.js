function insertTrajectory(requestBody) {
    $.ajax({
        url: 'http://localhost:8080/insert',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successfully inserted:', response);
        },
        error: function(error) {
            console.error('Error inserting data:', error);
        }
    });
}

function fetchDatesFromId(requestBody) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'http://localhost:8080/get_dates_from_id',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
            success: function(response) {
                console.log('Successfully got:', response);
                resolve(response.dates);
            },
            error: function(error) {
                console.error('Error getting dates from id:', error);
                reject([]);
            }
        });
    });
}

function loadTrajectoriesFromID(requestBody, icon, line_color) {
    $.ajax({
        url: 'http://localhost:8080/load_from_id',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successfully got:', response);
            var original_locations = response.response_trajectory.locations;
            original_locations.forEach((location, index) => {
                var marker = L.marker([location.latitude, location.longitude], {icon: icon}).addTo(map);
                var timestamp = new Date(0);
                timestamp.setUTCSeconds(Number(location.timestamp));
                marker.bindPopup(`<b>${timestamp}</b><br>Long: ${location.longitude} Lat: ${location.latitude}.`).openPopup();

                if (index < original_locations.length - 1) {
                    var nextLocation = original_locations[index + 1];
                    var latlngs = [
                        [location.latitude, location.longitude],
                        [nextLocation.latitude, nextLocation.longitude]
                    ];
                    L.polyline(latlngs, {color: line_color}).addTo(map);
                }
            });
        },
        error: function(error) {
            console.error('Error getting trajectory data:', error);
            hideSpinner();
        }
    });
}

function loadTrajectoriesFromIDAndDate(requestBody) {
    $.ajax({
        url: 'http://localhost:8080/load_from_id_date',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successfully got from ID and date:', response);
            
            var original_locations = response.original_trajectory.locations;
            var simplified_locations = response.simplified_trajectory.locations;

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            original_locations.forEach((location, index) => {
                var marker = L.marker([location.latitude, location.longitude], {icon: originalIcon}).addTo(map);
                var timestamp = new Date(0);
                timestamp.setUTCSeconds(Number(location.timestamp));
                marker.bindPopup(`<b>Original: ${timestamp}</b><br>Long: ${location.longitude} Lat: ${location.latitude}.`).openPopup();
                
                if (index < original_locations.length - 1) {
                    var nextLocation = original_locations[index + 1];
                    var latlngs = [
                        [location.latitude, location.longitude],
                        [nextLocation.latitude, nextLocation.longitude]
                    ];
  
                    L.polyline(latlngs, {color: 'blue'}).addTo(map);
                }
            });

            simplified_locations.forEach((location, index) => {
                var marker = L.marker([location.latitude, location.longitude], {icon: simplifiedIcon}).addTo(map);
                var timestamp = new Date(0);
                timestamp.setUTCSeconds(Number(location.timestamp));
                marker.bindPopup(`<b>Simplified: ${timestamp}</b><br>Long: ${location.longitude} Lat: ${location.latitude}.`).openPopup();
                
                if (index < simplified_locations.length - 1) {
                    var nextLocation = simplified_locations[index + 1];
                    var latlngs = [
                        [location.latitude, location.longitude],
                        [nextLocation.latitude, nextLocation.longitude]
                    ];
                    console.log(location.latitude)
                    console.log(location.longitude)
                    L.polyline(latlngs, {color: 'orange'}).addTo(map);
                }
            });
            hideSpinner();
        },
        error: function(error) {
            console.error('Error getting data from ID and date:', error);
            hideSpinner();
        }
    });
}

function resetDatabase() {
    $.ajax({
        url: 'http://localhost:8080/reset',
        type: 'POST',
        contentType: 'application/json',
        success: function(response) {
            console.log('Successful reset the db:', response);
        },
        error: function(error) {
            console.error('Error resetting the DB:', error);
        }
    });
}

function performDBRangeQuery(requestBody, db_table) {
    $.ajax({
        url: 'http://localhost:8080/db_range_query',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successfully range queried:', response);

            var data = {
                db_table: db_table,
                id: response.trajectory_ids[1]
            }

            $.ajax({
                url: 'http://localhost:8080/load_from_id',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(response) {
                    console.log('Successfully got:', response.response_trajectory);
                },
                error: function(error) {
                    console.error('Error getting trajectory data:', error);
                }
            });
        },
        error: function(error) {
            console.error('Error making range query:', error);
        }
    });
}

function performKNNQuery(requestBody) {
    $.ajax({
        url: 'http://localhost:8080/knn_query',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successful KNN query:', response);
        },
        error: function(error) {
            console.error('Error making KNN query:', error);
        }
    });
}

function runSimplify(requestBody, simplifyButton) {
    $.ajax({
        url: 'http://localhost:8080/run',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        success: function(response) {
            console.log('Successful simplification:', response);
            if (response === 'Simplification process completed successfully') {
                simplifyButton.css('background-color', 'green');
            } else {
                simplifyButton.css('background-color', 'red');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error making the simplification:', error);
        }
    });
}

function runDBStatus(dbStatusButton) {
    $.ajax({
        url: 'http://localhost:8080/status',
        type: 'POST',
        data: { },
        success: function(response) {
            if (response === 'true') {
                dbStatusButton.css('background-color', 'green');
                console.log(response);
            } else {
                dbStatusButton.css('background-color', 'red');
                console.log(response);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            dbStatusButton.css('background-color', 'gray');
        }
    });
}