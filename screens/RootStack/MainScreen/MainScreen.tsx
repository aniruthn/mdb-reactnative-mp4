import React from "react";
import Notifications from "expo-notifications";
import Constants from "expo-constants";
import { MainStyles } from "./MainScreenStyles";
import { Text, View } from "../../../components/Themed";

export default function MainScreen() {
  Notifications.addNotificationResponseReceivedListener((notification) => {
    console.log(notification);
    console.log("push verify");
    console.log("Notification recieved");
    const chatId = notification.notification.request.content.data.name as String;
    console.log(chatId);
  });
  return (
    <View style={MainStyles.container}>
      <Text style={MainStyles.title}>Main Screen</Text>
      <View
        style={MainStyles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}
