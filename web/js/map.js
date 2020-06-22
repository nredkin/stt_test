let myMap;

let carsData = [];
let marks = [];

ymaps.ready(init);

function init () {
    myMap = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

        getTrackingData();
        displayMenu();
        createMarkers();

}

window.setInterval(function(){
    getTrackingData();
    //это можно раскомментировать вместо getTrackingData чтобы увидеть перемещение маркеров (т.к. в БД новые координаты не появляются)
    //testChangeCoordinates();
    updateMarkers();


}, 3000);

function getTrackingData() {
    $.ajax({
        url: '/web/index.php?r=site%2Ftrack',
        type: 'GET',
        async: false,
        success: function(res){
            let result = JSON.parse(res);

            result.forEach( function(car ) {

                carsData[car.id] = [];

                carsData[car.id]['IMEI'] = car.IMEI;
                carsData[car.id]['latitude'] = (car.latitude/3600000).toFixed(2);
                carsData[car.id]['longitude'] = (car.longitude/3600000).toFixed(2);

            });
        },
        error: function(){
            console.log('Error fetching tracking data');
        }
    });
}

function testChangeCoordinates() {
    carsData.forEach( function(car ) {
        car.latitude = car.latitude*1.0001;
        car.longitude = car.longitude*1.0001;
    });
}

function displayMenu() {
    let cars = document.getElementById("cars");
    let first_iteration = true;

    carsData.forEach( function(car ) {
        if (first_iteration) {
            myMap.setCenter([car.latitude, car.longitude]);
            first_iteration = false;
        }

        cars.innerHTML += "<input type='checkbox' class='carSelect' id='"+ car.IMEI +"'>&nbsp;" +
            "<label for='"+ car.IMEI +"'>" + car.IMEI+" </label><br>";

        assignCheckboxListeners();
    });
}

function createMarkers() {
    carsData.forEach( function(car ) {
        myMap.geoObjects
                .add(marks[car.IMEI] = new ymaps.Placemark([car.latitude, car.longitude], {
                    iconCaption: car.IMEI
                }, {
                    preset: 'islands#blueCircleDotIconWithCaption',
                }));
        marks[car.IMEI].options.set('visible', false);

    });
}

function updateMarkers() {
    carsData.forEach( function(car ) {
        marks[car.IMEI].geometry.setCoordinates([car.latitude,car.longitude]);
        if(document.getElementById(car.IMEI).checked){
            if (marks[car.IMEI].options.get('visible') === false) {
                marks[car.IMEI].options.set('visible', true);
            }
        }
        else{
            if (marks[car.IMEI].options.get('visible') === true) {
                marks[car.IMEI].options.set('visible', false);
            }
        }
    });
}

function assignCheckboxListeners() {
    let checkboxes = document.getElementsByClassName('carSelect');
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('click', function () {
            updateMarkers();
        });
    }
}