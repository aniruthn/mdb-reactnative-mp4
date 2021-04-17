import * as geofirestore from "geofirestore";

const firebase = require("firebase/app");
require("firebase/firestore");

//used to be locations instead of start locations
//start locations used because it should only be tracking where a user is starting

export async function setUserLocation(
    coordinates: firebase.firestore.GeoPoint
  ) {
    const firestore = firebase.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore);
    const geocollection = GeoFirestore.collection("startLocations");
    const userId = firebase.auth().currentUser?.uid;
    geocollection.doc(userId).set(
      {
        coordinates: coordinates,
        lastUpdated: Date.now(),
        requested: false,
      }, 
      { merge: true }
    );
  }
  
  export async function clearUserLocation() {
    const firestore = firebase.firestore();
    const userId = firebase.auth().currentUser?.uid;
    firestore.collection("startLocations").doc(userId).delete();
  }