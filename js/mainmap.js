		var fusionTableRoutesid = "13wU5Lloq1J7gKBPiZXy46FKMjcEG_7X__Rp7cstb";
        var keyFusionTable = "AIzaSyAEitMgsdc2KvXsvuNQl6cTk7L0ILDgMkE";
        var cliendId = "199438855769-nb669c4euv2co1m35tjffgv4icb4ps1c.apps.googleusercontent.com";
        var refreshToken = "1/ZHDmNkA7jiX0IVe3Tojuo3jOck9a8tFn82Cvno8R_6s";
        var clientSecret = "qiB8QziiVg-lXQhNkBMTI0Sw";
        
		var fb = new Firebase("https://boiling-inferno-6943.firebaseio.com");
        
        var map;
		var path = new Array();
        var stops = new Array();
        var pathDisplay = new Array;
        
                
    $(document).ready(function(){
      
      
      map = new GMaps({
        el: '#map',
        lat: 9.965466,
        lng: -84.058571,
        click: function(e){
          console.log(e);
        }
      });
      
      
	
	$('#startButton').click(function(){
            startTracking();
            $('#startButton').attr('disabled','disabled');
            $('#submitButton').attr('disabled','disabled');
	});
        
        $('#stopButton').click(function(){
            stopTrip();
            $('#startButton').removeAttr('disabled');
            $('#submitButton').removeAttr('disabled');
        });
        
        $('#resetButton').click(function(){
            if (!confirm('Esta acción borrará el viaje completo sin enviar al servidor. Desea continuar?')){
                return false;
            }
            resetTrip();
            stopTrip();
            $('startButton').removeAttr('disabled');
            
        });
        
        $('#addButton').click(function(){
            addStop();
        });
        
        $('#submitButton').click(function(){
           // sendPathtoFT(path);
			sendPathtoFBase(path);
        });
        
    });
	var ta = document.querySelector('textarea');
	var ts = document.querySelector('#stopstext');
	var lt = 0;
	var ls = false;
	var track = false;
	var watchID;
        
        
	
        function resetTrip() {
            localStorage.setItem('trip', '');
            ta.value = '';
            ts.value = '';
            map.removeMarkers();
            map.removePolylines();
            path = new Array();
            pathDisplay = new Array();
            stops = new Array();
            return true;
        }
	
	function stopTrip() {
		navigator.geolocation.clearWatch(watchID);
		return true;
	}
	
	function startTracking() {
		track = true;
		watchID = navigator.geolocation.watchPosition(
			function(position) {
				var now = new Date().getTime();
				if (ls != 1 || now - lt > 1000) {
					ta.value += position.coords.longitude + ',' + position.coords.latitude + '\n';
					localStorage.setItem('trip', ta.value);
					path.push([now,position.coords.latitude, position.coords.longitude]);
					pathDisplay.push([position.coords.latitude, position.coords.longitude]);
					drawlines();
					updatePosition(position.coords.latitude, position.coords.longitude);
					lt = now;
					ls = 1;
				}
			},
			function() {
				var now = new Date().getTime();
				if (ls != 0 || now - lt > 1000) {
					ta.value += now + ' // fail\n';
					localStorage.setItem('trip', ta.value);
					lt = now;
					ls = 0;
				}
			},
			{
				enableHighAccuracy: true,
				maximumAge: 60000,
				timeout: 15000
			}
		);
	}
	
	function drawlines() {
		map.removePolylines();
		map.drawPolyline({
        strokeColor: '#131540',
        path: pathDisplay,
        strokeOpacity: 0.6,
        strokeWeight: 6
      });
	}
	
	function updatePosition(lat,lng){
		map.setCenter(lat, lng);
	}
	
	function addStop() {
		navigator.geolocation.getCurrentPosition(
			function(position){
				var now = new Date().getTime();
                                var stopName = prompt("Nombre de la parada");
                                ts.value += 'STOP' + position.coords.longitude + ',' + position.coords.latitude + '\n';
				stops.push([now,stopName, position.coords.latitude, position.coords.longitude]); 
				map.addMarker({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					title: 'Stop',
                                        infoWindow: {
                                            content: '<p>'+stopName+'</p>'
                                           }
				});
			},
                        function(){
                            alert('WWWAAAAHHHH');
                        }      
		);
	}
	
		function sendPathtoFBase(path){
			var route_id = $('#Ruta_ID').val();
            var route_name = $('#Ruta_Name').val();
            var status = 'New';
            var sentido = $('#Sentido').val();
            var company = $('#Compania').val();
            var nombre_col = $('#Nombre_colaborador').val();
            var email_col = $('#Email_colaborador').val();
            var geometry = polyToKML(path);
			
			fb.push({Route_id : route_id,
				Route_name : route_name,
				Status : status,
				Sentido : sentido,
				Compania : company,
				Nombre_colaborador : nombre_col,
				Email_colaborador : email_col,
				Geometry : geometry,				
				},				
				function(error){
						if (error) {
							alert("Error" + error);
						} else {
							alert("Data submitted successfully");
						}
				}
			);
		
		}
        
        function sendPathtoFT(path){
            var route_id = $('#Ruta_ID').val();
            var route_name = $('#Ruta_Name').val();
            var status = 'New';
            var sentido = $('#Sentido').val();
            var company = $('#Compania').val();
            var nombre_col = $('#Nombre_colaborador').val();
            var email_col = $('#Email_colaborador').val();
            var geometry = polyToKML(path);
            var myqry = 'INSERT INTO ' + fusionTableRoutesid + ' (Ruta_ID, Status, Ruta_Name, Sentido, Compania, Nombre_colaborador, Email_colaborador, geometry) VALUES ('+ route_id + ',\'' + status + '\',\'' + route_name + '\',\'' + sentido + '\',\'' + company + '\',\'' + nombre_col +  '\',\'' + email_col + '\',\'' + geometry + '\')';
                    
            var posting = $.post('http://utility-glider-589.appspot.com/newRoute', 
				{Route_id : route_id,
				Route_name : route_name,
				Status : status,
				Sentido : sentido,
				Compania : company,
				Nombre_colaborador : nombre_col,
				Email_colaborador : email_col,
				Geometry : geometry,				
				}
			);
			
			posting.done(function(data) {
				alert ('YEY!');
				}
			);
        }
        
        function polyToKML(path){
            var result;
            result = '<LineString> <coordinates> ';
            _.each(path, function(element){
                result += element[2] + ',' + element[1] + ' ';
            });
            result += '</coordinates> </LineString>';
            return result;
        }
        
        function stopToKML(stop){
            var result;
            result = '<Point> <coordinates> ' + stop[3] + ',' + stop[2] + ' </coordinates> </Point>';
        }
        