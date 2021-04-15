import React from "react";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { UserModel } from "../utils/models";
import firebase from "firebase/app";
import { checkIfInside } from "../utils/utils";
import { clearUserLocation, setUserLocation } from "../api/auth";

export const LocationManager = (props: any) => {
  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined
  );

  const userId = firebase.auth().currentUser?.uid;

  useEffect(() => {
    console.log("LocationManager: Observing the User Object.");
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .onSnapshot((snapshot) => {
        if (snapshot.exists) {
          setUser(snapshot.data() as UserModel);
        } else {
          console.log("ERROR: User model doesn't exist.");
        }
      });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    let removeFn: any;
    console.log("LocationManager: Requesting User Location.");
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("ERROR: Location permission not granted.");
        clearUserLocation();
        return;
      }
      console.log("LocationManager: Location permission granted.");
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 60000,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      ).then((r) => {
        removeFn = r.remove;
      });
    })();
    return () => {
      console.log("LocationManager: Removing listener.");
      removeFn && removeFn();
    };
  }, [user]);

  useEffect(() => {
    if (user && location) {
      const protectedRegions = user.protectedRegions || [];
      for (let i = 0; i < protectedRegions.length; i++) {
        const { radius, coordinates, name } = protectedRegions[0];
        if (checkIfInside(location, coordinates, radius)) {
          console.log("Found a Matching Protected Region:", name);
          clearUserLocation();
          return;
        }
      }
      // This location is not inside any protected regions.
      // Write it to our database.
      const { latitude, longitude } = location.coords;
      if (!user.settings.locationTrackingOn) {
        clearUserLocation();
        return;
      } else {
        setUserLocation(new firebase.firestore.GeoPoint(latitude, longitude));
      }
    }
  }, [user, location]);

  return <>{props.children}</>;
};