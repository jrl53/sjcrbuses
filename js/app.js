'use strict';
var MapApp = angular.module('MapApp', [
	'ionic', 'leaflet-directive']);

/**
 * Routing table including associated controllers.
 */
MapApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('menu', {url: "/map", abstract: true, templateUrl: "menu.html"})
		.state('menu.home', {url: '/home', views:	 {'menuContent': {templateUrl: 'gpsView.html', controller: 'GpsCtrl'} }  })
		.state('menu.help', {url: '/help', views: {'menuContent': {templateUrl: 'helpView.html', controller: 'HelpCtrl'} }  });

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/map/home');
}]);

/**
* Geolocation service.
*/

MapApp.factory('geoLocationService', function () {
		'use strict';
		var watchId;
		return {
		  start: function (success, error) {
		    watchId = navigator.geolocation.watchPosition(success, error,{
				enableHighAccuracy: true,
				maximumAge: 60000,
				timeout: 15000
			});
		  },
		  stop: function () {
		    if (watchId) {
		       navigator.geolocation.clearWatch(watchId);
		    }
		  }
		};
	});


/**
 * HEADER - handle menu toggle
 */
MapApp.controller('HeaderCtrl', function($scope) {
	// Main app controller, empty for the example
	$scope.leftButtons = [
		{ 
		type: 'button-clear',
		content: '<i class="icon ion-navicon"></i>',
		tap: function(e) {
			$scope.sideMenuController.toggleLeft();
			}
		}
	];
});
/**
 * MAIN CONTROLLER - handle inapp browser
 */
MapApp.controller('MainCtrl', ['$scope', function($scope) {
  // do something
}]);

/**
 * A google map / GPS controller.
 */
MapApp.controller('GpsCtrl', ['$scope','leafletData', 'geoLocationService',
	function($scope, leafletData, geoLocationService) {
	
	$scope.currentPosition = {};
	
	$scope.filters = {};
    $scope.filters.center = {
        lat: 51.505,
        lng: -0.09,
        zoom: 5
    };
    
  
    $scope.moveCenter = function() {
         $scope.filters.center = {
            lat: 51.505,
            lng: -0.09,
            zoom: 5
        };
    }

	$scope.recording = function (on) {
	    if (on) {
	      geoLocationService.start(onChange, onChangeError);
	    } else {
	      geoLocationService.stop();
	    }
	  };
	
	function onChange(newPosition) {
		  $scope.currentPosition = newPosition;
	      var data = newPosition.coords;
	      data.timestamp = newPosition.timestamp;
	      
	    }

	function onChangeError(error) {
	  alert("Error: " + error);
	}
	
	
}]);


/**
 * MAIN CONTROLLER - handle inapp browser
 */
MapApp.controller('HelpCtrl', ['$scope', function($scope) {
  // do something
}]);

// formats a number as a latitude (e.g. 40.46... => "40�27'44"N")
MapApp.filter('lat', function () {
    return function (input, decimals) {
        if (!decimals) decimals = 0;
        input = input * 1;
        var ns = input > 0 ? "N" : "S";
        input = Math.abs(input);
        var deg = Math.floor(input);
        var min = Math.floor((input - deg) * 60);
        var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
        return deg + "�" + min + "'" + sec + '"' + ns;
    }
});

// formats a number as a longitude (e.g. -80.02... => "80�1'24"W")
MapApp.filter('lon', function () {
    return function (input, decimals) {
        if (!decimals) decimals = 0;
        input = input * 1;
        var ew = input > 0 ? "E" : "W";
        input = Math.abs(input);
        var deg = Math.floor(input);
        var min = Math.floor((input - deg) * 60);
        var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
        return deg + "�" + min + "'" + sec + '"' + ew;
    }
});


/**
 * Menu item click directive - intercept, hide menu and go to new location
 */
MapApp.directive('clickMenulink', function() {
    return {
        link: function(scope, element, attrs) {
            element.on('click', function() {
                scope.sideMenuController.toggleLeft();
            });
        }
    }
})
