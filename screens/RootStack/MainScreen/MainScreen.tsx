import React, { useEffect, useRef, useState } from "react";
import { Button, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { MainStyles } from "./MainScreenStyles";
import { Text, View } from "../../../components/Themed";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
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
          // needs to be replaced with a call to the backend to add the locations and create a request to find another user with the same
          // upon that request being made, then a notification to both users + resolved of the requests to be made
          let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
          let messages = {} as ExpoPushMessage[];
          // replace [] with the tokens read by the backend from firestore
          for (let pushToken of []) {
            if (!Expo.isExpoPushToken(pushToken)) {
              console.error(`Push token ${pushToken} is not a valid Expo push token`);
              continue;
            }
            messages.push({
              to: pushToken,
              sound: 'default',
              body: 'This is a test notification',
              data: { withSome: 'data' },
            })
          }

          let chunks = expo.chunkPushNotifications(messages);
          let tickets = [];
          (async () => {
            // Send the chunks to the Expo push notification service. There are
            // different strategies you could use. A simple one is to send one chunk at a
            // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
              try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              } catch (error) {
                console.error(error);
              }
          }
          })();
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'monkey' },
    },
    trigger: { seconds: 2 },
  });
}

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