import { LocationObject } from "expo-location";

export function checkIfInside(
  spotCoordinates: LocationObject,
  center: firebase.firestore.GeoPoint,
  radius: number
) {
  let newRadius = distanceInKmBetweenEarthCoordinates(
    spotCoordinates.coords.latitude,
    spotCoordinates.coords.longitude,
    center.latitude,
    center.longitude
  );

  if (newRadius <= radius) {
    return true;
  } else if (newRadius > radius) {
    return false;
  }
}

function distanceInKmBetweenEarthCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2 - lat1);
  var dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}