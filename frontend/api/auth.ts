import * as geofirestore from "geofirestore";

const firebase = require("firebase/app");
require("firebase/firestore");

export async function setUserLocation(
    coordinates: firebase.firestore.GeoPoint
  ) {
    const firestore = firebase.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore);
    const geocollection = GeoFirestore.collection("locations");
    const userId = firebase.auth().currentUser.uid;
    geocollection.doc(userId).set({
      coordinates: coordinates,
      lastUpdated: Date.now(),
      userId: userId,
    });
  }
  
  export async function clearUserLocation() {
    const firestore = firebase.firestore();
    const userId = firebase.auth().currentUser.uid;
    firestore.collection("locations").doc(userId).delete();
  }