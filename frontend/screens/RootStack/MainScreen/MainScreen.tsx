import React, { useEffect, useRef, useState } from "react";
import { Button, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as geofirestore from 'geofirestore';
import Constants from "expo-constants";
import { MainStyles } from "./MainScreenStyles";
import { Text, View } from "../../../components/Themed";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import firebase from "firebase";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function MainScreen() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  //both of these are unused now that the return section is commented out but still seems to work?
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token as string));

    Notifications.addNotificationReceivedListener(notification => setNotification(notification as unknown as boolean));
    Notifications.addNotificationResponseReceivedListener(response => {
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
  return (
    <View style={MainStyles.container}>
      <Text style={MainStyles.title}>Main Screen</Text>
      <View
        style={MainStyles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          // the first part is the personal ip address, gets replaced by whatever
          // the index.js prints ot as the local ip address instead
          const ip: string = '10.0.0.188';

          // when adding parameters just use a slash to denote separations between each parameter
          fetch('http://' + ip + ':8080/sendPush/' + firebase.auth().currentUser?.uid + '/0/1')
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
          .then(response => response.json())
          .then(json => console.log(json))
          .then(() => console.log('no network error'))
          .catch((error) => console.error(error));
          console.log('next part');
        }}
      />
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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    //maybe add the token here to firestore for the user instead of in the sign up screen?
    console.log("registered async push token: " + token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}