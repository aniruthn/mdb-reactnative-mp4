import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Button , Text} from "react-native-paper";
import * as Notifications from "expo-notifications";
import * as geofirestore from "geofirestore";
import * as Location from 'expo-location';
import Constants from "expo-constants";
import { MainStyles } from "./MainScreenStyles";
import { View } from "../../../components/Themed";
import firebase from "firebase";
import Colors from "../../../constants/Colors";
import useColorScheme from "../../../hooks/useColorScheme";
import MapView, { Marker, MapEvent, LatLng, Region } from "react-native-maps";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function MainScreen() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const [startLocation, setStartLocation] = useState([40.7588, -73.9852]);
  const [targetLocation, setTargetLocation] = useState([40.7589, -73.9851]);
  const [region, setRegion] = useState<Region>({
    latitude: 40.758797200007905,
    latitudeDelta: 0.03,
    longitude: -73.98520002141595,
    longitudeDelta: 0.03,
  });
  // const [startLocation, setStartLocation] = useState([44.7588, -79.9852]);
  // const [targetLocation, setTargetLocation] = useState([45.7589, -78.9851]);
  //both of these are unused now that the return section is commented out but still seems to work?
  const notificationListener = useRef();
  const responseListener = useRef();

  // useEffect(() => {
  //   Location.watchPositionAsync(
  //     {
  //       accuracy: Location.Accuracy.High,
  //       timeInterval: 60000,
  //     },
  //     (newLocation) => {
  //       const point: LatLng = newLocation.coords;
  //       setStartLocation([point.latitude, point.longitude]);
  //       setTargetLocation([point.latitude+0.003, point.longitude]);
  //     }
  // )});

  useEffect(() => {
    //need a different way to get and update to the current location
    firebase.firestore().collection("startLocations").doc(firebase.auth().currentUser?.uid).get().then((doc) => {
      const point: number[] = [Number(doc?.data()?.coordinates.latitude), Number(doc?.data()?.coordinates.longitude)];
      setStartLocation(point);
      setTargetLocation([point[0]+0.003, point[1]])
      setRegion(Object.assign({
        ...region,
        latitude: point[0],
        longitude: point[1],
      }));
    }).catch((err) => {
      console.error(err);
    });
    // (async () => {
    //   let location = await Location.getCurrentPositionAsync({});
    //   console.log("location" + location);
    //   const point: LatLng = location.coords;
    //   setStartLocation([point.latitude, point.longitude]);
    //   setTargetLocation([point.latitude+0.003, point.longitude]);
    //   setRegion({
    //     latitude: point.latitude,
    //     longitude: point.longitude,
    //     latitudeDelta: 2,
    //     longitudeDelta: 2,
    //   });
    // });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token as string)
    );

    Notifications.addNotificationReceivedListener((notification) =>
      setNotification((notification as unknown) as boolean)
    );
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("response information from notif: ");
      console.log(response);
    });

    return () => {
      // Commenting out this section prevents the following error:
      // Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
      // couldn't figure out how to convert from mutable subscription into just subscription objects
      // @ts-ignore
      // Notifications.removeNotificationSubscription(notificationListener);
      // @ts-ignore
      // Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleStartMarkerDrag = (loc: MapEvent<{}>) => {
    const point: LatLng = loc.nativeEvent.coordinate;
    setStartLocation([point.latitude, point.longitude])
  }

  const handleTargetMarkerDrag = (loc: MapEvent<{}>) => {
    const point: LatLng = loc.nativeEvent.coordinate;
    setTargetLocation([point.latitude, point.longitude])
  }

  const handleNotification = async () => {
    // ngrok command: ngrok http -host-header="localhost:8080" 8080
    // for port 8080, has to be continually updated
    const ngrokURL: string = "http://afa035ad2cbb.ngrok.io";

    const firestore = firebase.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore as any);
    const GeoCollectionStartLocations = GeoFirestore.collection(
      "startLocations"
    );
    const GeoCollectionTargetLocations = GeoFirestore.collection(
      "targetLocations"
    );
    const userId = firebase.auth().currentUser?.uid;
    // the name "coordinates" cannot be changed below
    GeoCollectionStartLocations.doc(userId).set(
      {
        coordinates: new firebase.firestore.GeoPoint(
          startLocation[0],
          startLocation[1]
        ),
        lastUpdated: Date.now(),
        requested: true,
      },
      { merge: true }
    );
    GeoCollectionTargetLocations.doc(userId).set(
      {
        coordinates: new firebase.firestore.GeoPoint(
          targetLocation[0],
          targetLocation[1]
        ),
        lastUpdated: Date.now(),
        requested: true,
      },
      { merge: true }
    );
    // when adding parameters just use a slash to denote separations between each parameter
    fetch(
      ngrokURL +
        "/sendPush/" +
        firebase.auth().currentUser?.uid +
        "/" +
        startLocation[0] +
        "/" +
        startLocation[1] +
        "/" +
        targetLocation[0] +
        "/" +
        targetLocation[1]
    )
      // console.log('http://' + ip + ':8080/');
      // fetch('http://' + ip + ':8080/')
      // fetch('https://jsonplaceholder.typicode.com/todos/1')
      // fetch('https://' + ip + ':8080/sendPush', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   body: null
      // })
      .then((response) => response.json())
      .then((json) => {
        //action items, maybe paired with callback functions as needed
        if (json.msg === "No other user wants that route.") {
          console.log(json.msg);
        } else if (json.msg === "Worked!") {
          //retrieve the current and other user's location information to display on the screen
          console.log(json.msg);
        } else if (json.msg === "Didn't work!") {
          console.log(json.msg);
        } else {
          console.error("Unknown response from server.");
        }
        console.log(json);
      })
      .then(() => console.log("no network error"))
      .catch((error) => console.error(error));
    console.log("next part");
  };

  return (
    <View style={MainStyles.container}>
      <MapView
        style={MainStyles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        followsUserLocation
      >
        <Marker
          title="Start"
          coordinate={{ latitude: startLocation[0], longitude: startLocation[1] }}
          draggable
          onDragEnd={(loc) => handleStartMarkerDrag(loc)}
          pinColor={'red'}
        />
        <Marker
          title="Target"
          coordinate={{ latitude: targetLocation[0], longitude: targetLocation[1] }}
          draggable
          onDragEnd={(loc) => handleTargetMarkerDrag(loc)}
          pinColor={'green'}
        />
      </MapView>
      <Text style={MainStyles.title}>Select Path</Text>
      <Button
        onPress={handleNotification}
        color={Colors[colorScheme].tint}
        mode='contained'
        dark
        style={MainStyles.button}
      >
        Press to schedule a notification
      </Button>
    </View>
  );
}

// async function schedulePushNotification() {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: "You've got mail! 📬",
//       body: 'Here is the notification body',
//       data: { data: 'monkey' },
//     },
//     trigger: { seconds: 2 },
//   });
// }

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const {
      status: existingStatus,
    } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    //maybe add the token here to firestore for the user instead of in the sign up screen?
    console.log("registered async push token: " + token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
