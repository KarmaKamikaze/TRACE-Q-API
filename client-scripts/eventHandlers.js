function bindEventHandlers() {
    $('#visualize_btn').click(handleVisualize);
    $('#reset_db').click(handleResetDB);
    $(".nav-link").click(handleEndpointClick);
    $('.dropdown-item').click(handleDropdownChange);
    $('#insert_endpoint').click(handleInsertEndpoint);
    $('#simplify_endpoint').click(handleSimplifyEndpoint);
    $('#range_query_endpoint').click(handleRangeQueryEndpoint);
    $('#knn_endpoint').click(handleKNNEndpoint);
    $('#visualize').click(handleVisualize);

    $('#content').on('click', '#addInput', addInputField);
    $('#content').on('click', '#uploadButton', handleUploadClick);
    $('#content').on('click', '#run_KNN', handleRunKNN);
    $('#content').on('change', '#trajectory_id', handleTrajectoryChange);
    $('#content').on('click', '.deleteInput', deleteInputField);
    $('#content').on('click', '#runInsert', handleRunInsert);
    $('#content').on('click', '#runRangeQuery', handleRunRangeQuery);
    $('#content').on('click', '#runSimplify', handleRunSimplify);
    $('#content').on('click', '#runDBstatus', handleRunDBStatus);
    $('#content').on('click', '#visualize_all_days_for_id_btn', handleVisualizeAllDaysByID);
    $('#content').on('click', '#run_reset_db_btn', handleRunResetDB);
}

function handleEndpointClick() {
    var selectedDropdownItemID = $(this).attr('id');
    var selectedDropdownItem = $(this).text();

    if(["insert_endpoint", "simplify_endpoint", "range_query_endpoint", "knn_endpoint", "visualize", "reset_db"].includes(selectedDropdownItemID)) {
        $("#endpointDropdownButton").text(selectedDropdownItem);
        $('#map').css("display", "none");

        if(["insert_endpoint", "range_query_endpoint", "knn_endpoint"].includes(selectedDropdownItemID)) {
            $('#tableDropdownButton').css("display", "block");
        }
        else {
            $('#tableDropdownButton').css("display", "none");
        }
    }
    else if(["original_table", "simplified_table"].includes(selectedDropdownItemID)) {
        $("#tableDropdownButton").text(selectedDropdownItem);
    }
}

function handleDropdownChange() {
    var selectedDropdownItemName = $(this).text();
    $("#tableDropdownButton").text(selectedDropdownItemName)
}

function handleOriginalTableClick() {
    chosenTable = "original";
    var selectedDropdownItem = $(this).text();
    $("tableDropdownButton").text(selectedDropdownItem);
}

function handleSimplifiedTableClick() {
    chosenTable = "simplified";
    var selectedDropdownItem = $(this).text();
    $("tableDropdownButton").text(selectedDropdownItem);
}

function handleInsertEndpoint() {
    $('#content').load("markups/insertEndpoint.html");
}

function handleSimplifyEndpoint() {
    $('#content').load("markups/simplifyEndpoint.html");
}

function handleRangeQueryEndpoint() {
    $('#content').load("markups/rangeQueryEndpoint.html");
}

function handleKNNEndpoint() {
    $('#content').load("markups/knnEndpoint.html");
}


function handleVisualize() {
    $('#map').css("display", "block");
    $('#content').load("markups/visualize.html");
}

function handleResetDB() {
    $('#content').load("markups/resetEndpoint.html");
}

function addInputField() {
    $('#inputContainer').append("markups/inputField.html");
}

function handleUploadClick() {
    var file = $('#fileInput')[0].files[0];
    var db_table = $("#tableDropdownButton").text().toLowerCase();

    if(db_table == "select a table") {
        alert("Please select a table");
        return;
    }

    if (file && db_table) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var text = e.target.result;
            var lines = text.split('\n');
            var chunkSize = 450;
            var numChunks = Math.ceil(lines.length / chunkSize);

            function processChunk(chunkIndex) {
                var start = chunkIndex * chunkSize;
                var end = Math.min(start + chunkSize, lines.length);
                var chunkLines = lines.slice(start, end);
                var locations = [];
                var idpart =lines[0].trim().split(',');
                var id = idpart[0];

                chunkLines.forEach(function(line) {
                    var parts = line.trim().split(',');

                    if (parts.length === 4) {
                        var timestamp = parts[1];
                        var longitude = parseFloat(parts[2]);
                        var latitude = parseFloat(parts[3]);

                        if (!isNaN(longitude) && !isNaN(latitude)) {
                            var location = {
                                "timestamp": timestamp,
                                "longitude": longitude,
                                "latitude": latitude
                            };

                            locations.push(location);
                        } else {
                            console.log('Invalid longitude or latitude:', line);
                        }

                    } else {
                        console.log('Invalid line format:', line);
                    }

                });

                if (locations.length > 0) {
                    var requestBody = {
                        "db_table": db_table,
                        "id": id,
                        "locations": locations
                    };

                    insertTrajectory(requestBody);
                } else {
                    console.log('No valid data to send for chunk ' + chunkIndex);
                }
            }

            for (var i = 0; i < numChunks; i++) {
                processChunk(i);
            }
        };

        reader.readAsText(file);
    } else {
        alert('Please select a file and table name.');
    }
}

function deleteInputField() {
    $(this).closest('.input-group').remove();
}

function handleRunKNN() {
    var db_table = $('#tableDropdownButton').text().toLowerCase();

    if(db_table == "select a table") {
        alert("Please select a table");
        return;
    }

    var requestBody = {
        query_origin: {
            x: parseFloat($('#knn_x').val()),  
            y: parseFloat($('#knn_y').val())
        },
        db_table: db_table,
        k: parseInt($('#knn_k').val(), 10)
    };

    var timestamp_low = $('#timestamp_low').val();
    var timestamp_high = $('#timestamp_high').val();

    if(timestamp_low != '' && timestamp_high != '') {
        data["query_origin"]["t_low"] = timestamp_low;
        data["query_origin"]["t_high"] = timestamp_high;
    }
    
    performKNNQuery(requestBody)
}

async function handleTrajectoryChange() {
    trajectory_id = Number($('#trajectory_id').val());
    var requestBody = {
        id: trajectory_id
    };

    var datesWithData = await fetchDatesFromId(requestBody);

    flatpickr("#date_picker", {
        enable: datesWithData,
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        defaultDate: datesWithData[0],
        onChange: function(selectedDates, dateStr, instance) {
            resetMap();
            showSpinner();
            
            var requestBody = {
                id: trajectory_id,
                date: dateStr
            }  

            loadTrajectoriesFromIDAndDate(requestBody);
        }
    });
}

function handleRunInsert() {
    var requestBody = {};

    $('#inputContainer .input-group').each(function(index) {
        var db_table = $('#tableDropdownButton').text().toLowerCase();

        if(db_table == "select a table") {
            alert("Please select a table");
            return;
        }

        var trajectoryID = $('#trajectoryID').val();
        var longitude = $(this).find('.longitude').val();
        var latitude = $(this).find('.latitude').val();
        var timestamp = $(this).find('.timestamp').val().replace("T", " ");

        if(!requestBody["db_table"])
            requestBody["db_table"] = db_table;

        if(!requestBody["id"])
            requestBody["id"] = trajectoryID

        if(!requestBody["locations"])
            requestBody["locations"] = [];

        requestBody["locations"].push({
            timestamp: timestamp,
            longitude: parseFloat(longitude), 
            latitude: parseFloat(latitude)    
        });
    });

    insertTrajectory(requestBody);
}

function handleRunRangeQuery() {
    var requestBody = {};
    var db_table = $('#tableDropdownButton').text().toLowerCase();

    if(db_table == "select a table") {
        alert("Please select a table");
        return;
    }

    requestBody["db_table"] = db_table;

    requestBody["longitudeMin"] = $('#longitudeMin').val();
    requestBody["longitudeMax"] = $('#longitudeMax').val();

    requestBody["latitudeMin"] = $('#latitudeMin').val();
    requestBody["latitudeMax"] = $('#latitudeMax').val();
    
    requestBody["timestampMin"] = $('#timestampMin').val().replace("T", " ");
    requestBody["timestampMax"] = $('#timestampMax').val().replace("T", " ");

    performDBRangeQuery(requestBody, db_table);
}

function handleRunSimplify() {
    var simplifyButton = $(this);

    simplifyButton.css('background-color', 'blue');

    var requestBody = {
        "resolution_scale": parseFloat($('#resolutionScale').val()),
        "min_range_query_accuracy": parseFloat($('#minRangeQueryAccuracy').val()),
        "min_knn_query_accuracy": parseFloat($('#minKnnQueryAccuracy').val()),
        "max_trajectories_in_batch": parseInt($('#maxTrajectoriesInBatch').val()),
        "max_threads": parseInt($('#maxThreads').val()),
        "range_query_grid_density": parseFloat($('#rangeQueryGridDensity').val()),
        "knn_query_grid_density":  parseFloat($('#knnQueryGridDensity').val()),
        "windows_per_grid_point": parseInt($('#windowsPerGridPoint').val()),
        "window_expansion_rate": parseFloat($('#windowExpansionRate').val()),
        "range_query_time_interval": parseFloat($('#rangeQueryTimeInterval').val()),
        "knn_query_time_interval": parseFloat($('#knnQueryTimeInterval').val()),
        "knn_k": parseInt($('#knnK').val()),
        "use_KNN_for_query_accuracy": Boolean($('#useKNNForRangeQueryAccuracy').prop('checked'))
    };

    runSimplify(requestBody, simplifyButton);
}

function handleRunDBStatus() {
    var dbStatusButton = $(this);

    dbStatusButton.css('background-color', 'blue');

    runDBStatus(dbStatusButton);
}

function handleVisualizeAllDaysByID() {
    var trajectory_id = $('#trajectory_id').val();
    if(!trajectory_id.trim().length) {
        alert("Trajectory ID cannot be an empty value");
        return;
    }

    showSpinner();

    var trajectory_id = Number($('#trajectory_id').val());

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var original_data_request_body = {
        id: trajectory_id,
        db_table: "original"
    }

    var simplified_data_request_body = {
        id: trajectory_id,
        db_table: "simplified"
    }

    loadTrajectoriesFromID(original_data_request_body, originalIcon, 'blue');
    loadTrajectoriesFromID(simplified_data_request_body, simplifiedIcon, 'orange');
}

function handleRunResetDB() {
    resetDatabase();
}