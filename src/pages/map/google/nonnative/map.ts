import {Component, NgZone} from '@angular/core';
import {ModalController, NavController, ToastController, AlertController} from 'ionic-angular';
import {Storage} from '@ionic/storage';

import {
  FormsService, 
  TempFusionData,
  BarcodeService
} from '../../../../providers/index';

import {FormViewer} from '../../../../pages/formviewer/form-viewer';
import {MapSettingsPage} from '../../../modals/map/map-settings';
import {ModalsFormDetailsPage} from '../../../modals/formviewer/formdetails/form-details';

import {Pitch} from './pitch';

let storage = new Storage();

declare var google;

var MarkerWithLabel = require('markerwithlabel')(google.maps);

@Component({
  templateUrl: 'map.html'
})
export class MapPage {
  public latLng;
  public map;
  public mapTypeId;
  public travelMode;
  public mapTitle;
  public showMarkets;
  public showLitter;
  public doDirections;
  public mapObjects;
  public pitchSelected;
  public showOverlay;
  public showOptions;
  public showReport;
  public originalPolygonsStyle;
  public polygons:any = [];
  public showProximityAlert;
  public proximityData;
  public closestMarketName;
  public closestMarket:any;
  public oldClosestMarket:any;
  public markerSelected;
  public pushlat: number = null;
  public pushlng: number = null;
  public prevlat: number = null;
  public prevlng: number = null;
  public prevMarker: any;
  public mapOptions: any;
  public directionsService: any;
  public directionsDisplay: any;
  public iconInside:string = 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';
  public iconOutside:string = 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png';
  public prevPolygonMarkers:any = [];

  constructor(
    private nav: NavController, 
    private zone: NgZone, 
    public formsService: FormsService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,    
    public tempFusionData: TempFusionData,
    public barcodeService: BarcodeService) {

    this.originalPolygonsStyle = [];
    this.pitchSelected = {};
    this.showOverlay = false;
    this.showOptions = false;
    this.showReport = false;
    this.showProximityAlert = false;

    this.showMarkets = true;
    this.showLitter = true;
    this.doDirections = true;

    this.travelMode = google.maps.TravelMode.DRIVING;
    this.markerSelected = [];

    this.getMarketsFromJson(); 
    this.initializePushLatLng();     
  }

  ionViewDidLoad() {
    this.setupMap();
    this.autoUpdateMap();
  }

  refreshMap() {
    this.setupMap();
  }

  getMarketsFromJson() {
    this.tempFusionData.getMapObjects().then(markets => {
      this.mapObjects = markets;
    });
  }

  initializePushLatLng() {
    storage.get("lat").then((latitude) => {
      if (latitude != null){
        storage.get("lng").then((longitude) => {
          if (longitude != null){
            this.pushlat = latitude;
            this.pushlng = longitude;
          }
        });   
      }
    });
  }

  autoUpdateMap() {
    navigator.geolocation.watchPosition((position) => {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;

      var d = this.getDistance(this.prevlat, this.prevlng, lat, lng);
      // Update map when the distance is longer than 1m
      if (d > 1) {

        if (this.prevMarker) {
          this.prevMarker.setMap(null);
        }

        this.latLng = new google.maps.LatLng(lat, lng);
        this.findClosestMarker(lat, lng);

        if (this.oldClosestMarket.name != this.closestMarket.name) {
          console.log('closest market changed. new one is ', this.closestMarketName);
          this.drawAssets();
        }
        
        this.updateMarker();        

        this.prevlat = lat;
        this.prevlng = lng;
      }
    }, (error) => {
      switch(error.code) {
          case error.PERMISSION_DENIED:
              alert("Permission for Geolocation has not been granted. Please do so and refresh map.");
              break;
          case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
          case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
          default:
              alert("An unknown error occurred: " + error.message);
              break;
      }
    });
  }

  reversePrevSelectedPolygon() {
    if (this.pitchSelected.name) {
      var prevIndex = this.closestMarket.pitches.findIndex((pitch) => {
        return this.pitchSelected.name == pitch.name;
      });
      this.polygons[prevIndex].setOptions({strokeWeight: 2, fillColor: '#16a085'});
    }
  }

  updateMarker() {
    var isContain:boolean = false;

    for (var i = 0; i < this.closestMarket.pitches.length; i++) {
      if (google.maps.geometry.poly.containsLocation(this.latLng, this.polygons[i])) {
        isContain = true;
        if (this.pitchSelected.name != this.closestMarket.pitches[i].name) {
          this.reversePrevSelectedPolygon();
          this.polygons[i].setOptions({strokeWeight: 4, fillColor: 'red'});
          this.zone.run(() => {
            this.pitchSelected = {
              name: this.closestMarket.pitches[i].name,
              description: this.closestMarket.pitches[i].description
            };
            this.showReport = false;
            if ((this.showOptions == false) && (this.showOverlay == false)) {
              this.showOptions = true;  
            }
          });
        }
        break;
      }
    }

    if (!isContain) {
      this.reversePrevSelectedPolygon();
      this.zone.run(() => {
        this.pitchSelected = {};
        this.showOverlay = false;
        this.showOptions = false;
        this.showReport = false;
      });
    }

    this.prevMarker = new google.maps.Marker({
      position: this.latLng,
      icon: isContain? this.iconInside : this.iconOutside,
      zIndex: 999999
    });
    
    this.prevMarker.setMap(this.map);
    this.map.setCenter(this.latLng);
    console.log('marker updated!');
  }

  // Get form data from service which contain location context
  getFormData() {
    if (this.showLitter == true) {
      var mapData = this.formsService.getLocationForms();

      mapData.forEach(markerData => {
        let infoWindow = new google.maps.InfoWindow({
            content: `<h5>${markerData.name}</h5><p>${markerData.description}</p>`
        });

        var myLatLng = new google.maps.LatLng(markerData.location.lat, markerData.location.lng);

        let marker = new google.maps.Marker({
            position: myLatLng,
            map: this.map,
            title: markerData.name
        });

        marker.addListener('click', () => {
          if (this.doDirections == true) {
            this.directionsDisplay.setMap(this.map);

            var route;

            this.directionsService.route({
              origin: this.latLng,
              destination: marker.getPosition(),
              optimizeWaypoints: true,
              travelMode: this.travelMode
            }, function(response, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                this.directionsDisplay.setDirections(response);
                route = response.routes[0];
                infoWindow.setContent(`<h5>${markerData.name}</h5><p>${markerData.description}</p><p>Distance: ${route.legs[0].distance.text}</p>`);
              } else {
                window.alert(`Directions request failed due to ${status}`);
              }
            });
          } else {
            infoWindow.setContent(`<h5>${markerData.name}</h5><p>${markerData.description}</p>`);
          }

          infoWindow.open(this.map, marker);

          if (markerData.type == 'form') {
            markerData.type = 'form-template';
          }

          this.markerSelected = {
            id: markerData._id,
            formtype: markerData.type
          } 

          this.zone.run(() => {
            // Update the fields of the form, and Angular will update the view for you.
            this.showReport = true;
            this.showOptions = false;
            this.showOverlay = false;    
          });                      
        });
      });
    }
  }

  // Draw markets & pitches from JSON / Remote KML Data
  drawAssets() {
    if (this.showMarkets == true) {
      // Draw pitches from JSON data
      this.createPolygonObjects();

      // Import market data from KML
      var ctaLayer = new google.maps.KmlLayer({
        url: 'https://vpn.psi-fusion.com/test.kml',
        map: this.map
      });

      // This is required due to zoom issues post KML import
      google.maps.event.addListener(ctaLayer, 'status_changed', () => {
        google.maps.event.addListenerOnce(this.map, 'zoom_changed', () => {
          this.map.setZoom(20);
          this.map.setCenter(this.latLng);
        });
      });
    }
  }

  setupMap() {
    let options = {timeout: 10000, enableHighAccuracy: true};
    
    this.mapTitle = "Asset Locations";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON
            //var lat = position.coords.latitude;
            //var lng = position.coords.longitude;
            
            //var lat = "51.523712";
            //var lng = "-0.071348";
            var lat = position.coords.latitude;
            var lng  = position.coords.longitude;  

            if(this.pushlng != null && this.pushlat != null){
              lat = this.pushlat;
              lng = this.pushlng;
            }                    

            this.findClosestMarker(lat, lng);
            // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON           

            this.latLng = new google.maps.LatLng(lat, lng);

            this.mapOptions = {
                center: this.latLng,
                zoom: 18,
                mapTypeId: this.mapTypeId
            }

            this.directionsService = new google.maps.DirectionsService;
            this.directionsDisplay = new google.maps.DirectionsRenderer;

            let mapEle = document.getElementById('map');

            this.map = new google.maps.Map(mapEle, this.mapOptions);

            this.getFormData();

            this.drawAssets();

            this.updateMarker();

            google.maps.event.addListenerOnce(this.map, 'idle', () => {
              mapEle.classList.add('show-map');
            });                        
        },
  
        (error) => {
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  alert("Permission for Geolocation has not been granted. Please do so and refresh map.");
                  break;
              case error.POSITION_UNAVAILABLE:
                  alert("Location information is unavailable.");
                  break;
              case error.TIMEOUT:
                  alert("The request to get user location timed out.");
                  break;
              default:
                  alert(`An unknown error occurred: ${error.message}`);
                  break;
          }
        }, options
    );
  }

  findMyLocation() {
    let options = {timeout: 10000, enableHighAccuracy: true};

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON
            //this.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  
            //var lat = "51.52858";
            //var lng  = "-0.04779";
            // THIS IS TEMPORARY FOR TH DEMO - MOCK LOCATION LONDON                 

            let mapOptions = {
                center: this.latLng,
                mapTypeId: this.mapTypeId
            }

            this.map.setOptions(mapOptions);            
        },
  
        (error) => {
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  alert("Permission for Geolocation has not been granted. Please do so and refresh map.");
                  break;
              case error.POSITION_UNAVAILABLE:
                  alert("Location information is unavailable.");
                  break;
              case error.TIMEOUT:
                  alert("The request to get user location timed out.");
                  break;
              default:
                  alert(`An unknown error occurred: ${error.message}`);
                  break;
          }
        }, options
    );
  }

  activatePolygon(selectedPol:any, pitch:any) {
    this.polygons.forEach((polygon) => {
      polygon.setOptions({strokeWeight: 2, fillColor: '#16a085'});
    });
    selectedPol.setOptions({strokeWeight: 4.0, fillColor: 'red'});
    this.zone.run(() => {
      this.pitchSelected = {
        name: pitch.name,
        description: pitch.description
      };
      this.showReport = false;
      if ((this.showOptions == false) && (this.showOverlay == false)) {
        this.showOptions = true;  
      }
    });
  }

  createPolygonObjects() {
    for (var i = 0; i < this.polygons.length; i++) {
      this.polygons[i].setMap(null);
      this.prevPolygonMarkers[i].setMap(null);
    }

    this.polygons = [];
    this.prevPolygonMarkers = [];
    this.originalPolygonsStyle = [];
    var polygonColor;
    var bounds = new google.maps.LatLngBounds();

    for (var j = 0; j < this.closestMarket.pitches.length; j++) {
      let pitch:Pitch = this.getFormattedPitch(this.closestMarket.pitches[j]);

      polygonColor = this.getPolygonColor(this.closestMarket.pitches[j].status);

      this.polygons.push(new google.maps.Polygon({
        paths: pitch.path,
        strokeColor: polygonColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: polygonColor,
        fillOpacity: 0.65
      }));

      // Activate a pitch where the user stands if any
      if (google.maps.geometry.poly.containsLocation(this.latLng, this.polygons[this.polygons.length - 1])) {
        this.activatePolygon(this.polygons[this.polygons.length - 1], this.closestMarket.pitches[j]);
      }

      this.polygons[this.polygons.length - 1].setMap(this.map);   

      this.originalPolygonsStyle.push({
        name: this.closestMarket.pitches[j].name,
        strokeColor: polygonColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: polygonColor,
        fillOpacity: 0.65            
      });

      this.addMarkerWithLabel(pitch.center, this.closestMarket.pitches[j].name);           
    }

    this.polygons.forEach((polygon:any, index:number) => {
      polygon.addListener('click', () => {
        this.selectPitch(index);
      });
    });

    this.map.fitBounds(bounds);
    
    this.oldClosestMarket = this.closestMarket;  
  }

  getPolygonColor(status) {
    switch (status) {
        case "available":
            return "#16a085";
        case "permanent":
            return "#2980b9";            
        case "temporary":
            return "#d35400";
        default:
            return "#16a085";
    }    
  }

  addMarkerWithLabel(latlng, name) {
    var marker = new MarkerWithLabel({
      position: latlng,
      map: this.map,
      labelContent: name,
      labelAnchor: new google.maps.Point(25, 20),
      labelClass: "textual-label",
      icon: ' ',
      zIndex: 1
    });

    this.prevPolygonMarkers.push(marker);
  }

  selectPitch(index) {
    this.reversePrevSelectedPolygon();
    this.polygons[index].setOptions({strokeWeight: 4, fillColor: 'red'});

    this.zone.run(() => {
      this.pitchSelected = {
        name: this.closestMarket.pitches[index].name,
        description: this.closestMarket.pitches[index].description
      };
      this.showReport = false;
      if ((this.showOptions == false) && (this.showOverlay == false)) {
        this.showOptions = true;  
      }
    });
  }

  verifyMarket() {
    this.getPitchesInRangeOfSelected(); 
  }

  bookPitch() {          
  }

  startForm() {
    if ((this.markerSelected != null) && (this.markerSelected.id != null)) {
      var cancontinue = true;

      if (this.markerSelected.formtype != "form-completed") {
        var form = this.formsService.getFormById(this.markerSelected.id);

        if (form != null) {
          if (form.lifecycle != null)
          {
              if ((form.lifecycle.activationdate != null) && (this.formsService.isActivated(form.lifecycle.activationdate) == false)) {
                  this.presentToast("You cannot edit an inactive form", 2000);
                  cancontinue = false;
              }

              if ((cancontinue == true) && (form.lifecycle.expirydate != null) && (this.formsService.hasExpired(form.lifecycle.expirydate) == true)) {
                  this.presentToast("You cannot edit an expired form", 2000);
                  cancontinue = false;
              }            
          }
        }    
      } else {
        this.presentToast("You cannot edit a completed form", 2000);
        cancontinue = false;
      }

      if (cancontinue == true) {
        this.formsService.setFormDetails(this.markerSelected.formtype, form);
        let modal = this.modalCtrl.create(ModalsFormDetailsPage);
        modal.present();

        modal.onDidDismiss((data: any[]) => {
          if (data) {
              this.nav.push(FormViewer, {
                  form: this.formsService.getActiveForm()
              });
          }
        });  
      }
    }
    else {
        this.presentToast("No marker selected", 2000);
    }
  }  

  getPitchesInRangeOfSelected() {
    var polygonSelected;
    var arr = [];

    if (this.pitchSelected.name) {
      var selectedIndex = this.closestMarket.pitches.findIndex((pitch) => {
        return this.pitchSelected.name == pitch.name;
      });
      polygonSelected = this.polygons[selectedIndex];

      for (var i = 0; i < this.mapObjects.markets.length; i++) {
        for (var j = 0; j < this.mapObjects.markets[i].pitches.length; j++) {
          if (this.pitchSelected.name != this.mapObjects.markets[i].pitches[j].name) {
            for (var k = 0; k < this.mapObjects.markets[i].pitches[j].coords.length; k++) {
              var comparelatLng = new google.maps.LatLng(
                this.mapObjects.markets[i].pitches[j].coords[k].lat, 
                this.mapObjects.markets[i].pitches[j].coords[k].lng);

              var isLocationOnEdge = google.maps.geometry.poly.isLocationOnEdge;

              if (isLocationOnEdge(comparelatLng, polygonSelected)) {
                arr.push(this.mapObjects.markets[i].pitches[j].name);
                break;
              }
            }
          }
        }
      }

      this.proximityData = "";

      for (var m = 0; m < arr.length; m++) {
        if (m != arr.length - 1) {
          this.proximityData += (arr[m] + ", ");
        } else {
          this.proximityData += (arr[m]);
        }
      }

      this.showProximityAlert = true;
    }

    return arr;    
  }

  findClosestMarker(compareLat, compareLng) {
    var compareCoord = new google.maps.LatLng(parseFloat(compareLat), parseFloat(compareLng));
    var distance;
    var currentClosestDistance = -999;
    var closestMarket;

    for (var i = 0; i < this.mapObjects.markets.length; i++) {
      if (this.mapObjects.markets[i].pitches.length > 0) {
        if (this.mapObjects.markets[i].pitches[0].coords.length > 0) {
          var marketLatLng = new google.maps.LatLng(
            this.mapObjects.markets[i].pitches[0].coords[0].lat, 
            this.mapObjects.markets[i].pitches[0].coords[0].lng);

          distance = google.maps.geometry.spherical.computeDistanceBetween(compareCoord, marketLatLng);

          if (currentClosestDistance != -999) {
            if (distance < currentClosestDistance) {
              currentClosestDistance = distance;
              closestMarket = this.mapObjects.markets[i];
            }
          } else {
            currentClosestDistance = distance;
            closestMarket = this.mapObjects.markets[i];
          }
        }
      }
    }

    this.closestMarket = closestMarket;
    this.closestMarketName = closestMarket.name;
  }

  openSettings() {
    let modal = this.modalCtrl.create(MapSettingsPage);
    modal.present();

    modal.onDidDismiss((data: any[]) => {
      if (data) {       
        var parsedData = JSON.parse(data.toString());

        this.showMarkets = (parsedData.showmarkets == "true");
        this.showLitter = (parsedData.showlitter == "true");
        this.doDirections = (parsedData.dodirections == "true");

        switch (parsedData.mapstyle) {
            case "ROADMAP" :
                this.mapTypeId = google.maps.MapTypeId.ROADMAP;
                break;
            case "SATELLITE" :
                this.mapTypeId = google.maps.MapTypeId.SATELLITE; 
                break;                  
            case "HYBRID" :
                this.mapTypeId = google.maps.MapTypeId.HYBRID;
                break;
            case "TERRAIN" :
                this.mapTypeId = google.maps.MapTypeId.TERRAIN;  
                break;            
            default:
                this.mapTypeId = google.maps.MapTypeId.ROADMAP; 
                break;                 
        }

        switch (parsedData.travelmode) {
            case "DRIVING" :
                this.travelMode = google.maps.TravelMode.DRIVING;
                break;
            case "TRANSIT" :
                this.travelMode = google.maps.TravelMode.TRANSIT; 
                break;                  
            case "BICYCLING" :
                this.travelMode = google.maps.TravelMode.BICYCLING;
                break;
            case "WALKING" :
                this.travelMode = google.maps.TravelMode.WALKING;  
                break;            
            default:
                this.travelMode = google.maps.TravelMode.DRIVING; 
                break;                 
        }        

        this.setupMap();
      }
    });    
  }  

  presentToast(toastText, toastDuration) {
    let toast = this.toastCtrl.create({
        message: toastText,
        duration: toastDuration
    }); 
    
    toast.present();
  }

  doAlert(titleText, subTitleText) {
    let alert = this.alertCtrl.create({
        title: titleText,
        subTitle: subTitleText,
        buttons: ['Ok']
    });

    alert.present();
  }  

  toggleOverlay() {
    if (this.showOverlay == true) {
        this.showOptions = true;
        this.showOverlay = false; 
    } else {
        this.showOptions = false;
        this.showOverlay = true;
    }
  }

  getDistance(lat1, lng1, lat2, lng2) {    	
    let R = 6371e3;

    var deg1 = this.getRadians(lat1);
    var deg2 = this.getRadians(lat2);

    var diff1 = this.getRadians(lat2 - lat1);
    var diff2 = this.getRadians(lng2 - lng1);

    var a = Math.sin(diff1/2) * Math.sin(diff1/2) + Math.cos(deg1) * Math.cos(deg2) * Math.sin(diff2/2) * Math.sin(diff2/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return d;
  }

  getRadians(degree) { 
    return degree * Math.PI / 180; 
  }

  getFormattedPitch(pitch:any):Pitch {
    var bounds = new google.maps.LatLngBounds();
    var arr = new Array();

    for (var k = 0; k < pitch.coords.length; k++) {
      arr.push(new google.maps.LatLng(
        parseFloat(pitch.coords[k].lat),
        parseFloat(pitch.coords[k].lng)
      ));

      bounds.extend(arr[arr.length - 1]);
    }

    var center = bounds.getCenter();
    var formattedPitch = new Pitch(center, arr);

    return formattedPitch;
  }

  scanBarcode() {
    this.barcodeService.scan().then((response:any) => {
      if (!response.cancelled) {
        var matchedList = [];
        for (var i = 0; i < this.mapObjects.markets.length; i++) {
          var market = this.mapObjects.markets[i];
          for (var j = 0; j < market.pitches.length; j++) {
            var pitch = market.pitches[j];
            if (pitch.qrcode == response.text) {
              matchedList.push({ 
                market: market.name,
                pitch: pitch
              });
            }
          }
        }

        // get nearest market from the matched list
        var distList = matchedList.map((obj:any) => {
          var centerPos = this.getFormattedPitch(obj.pitch).center;
          var distance = this.getDistance(this.latLng.lat(), this.latLng.lng(), centerPos.lat(), centerPos.lng());
          return distance;
        });

        var nearestDist = Math.min(...distList);
        var nearestIndex = distList.indexOf(nearestDist);

        if (nearestIndex > -1) {
          var nearestPlace = matchedList[nearestIndex];
          var center = this.getFormattedPitch(nearestPlace.pitch).center;

          var contentString = `
            <div id="content">
              <h2>A nearest matched pitch is found!</h2>
              <ul>
                <li>Market: ${nearestPlace.market}</li>
                <li>Pitch: ${nearestPlace.pitch.name}</li>
                <li>Commodity: ${nearestPlace.pitch.commodity}</li>
                <li>QRCode: ${nearestPlace.pitch.qrcode}</li>
                <li>Distance: ${Math.floor(nearestDist)}m</li>
              </ul>
            </div>
          `;

          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          var marker = new google.maps.Marker({
            position: center,
            map: this.map
          });
          marker.addListener('click', () => {
            if (!infowindow.getMap()) {
              infowindow.open(this.map, marker);
            }
          });

          infowindow.open(this.map, marker);

          this.map.setCenter(center);
        } else {
          console.log('There is no matched QRCode.');
        }
      }
    }, (error:any) => {
      console.log(error);
    });
  }
}
