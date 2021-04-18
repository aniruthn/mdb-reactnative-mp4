import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "../../../components/EditScreenInfo";
import { Button } from "react-native-paper";
import firebase from "firebase";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, View } from "../../../components/Themed";

export default function AccountScreen() {
  const userID = firebase.auth().currentUser?.uid;
  const [userName, setUserName] = useState("Name");
  const [userEmail, setUserEmail] = useState("Email");
  useEffect(() => {
    firebase.firestore().collection("users")
    .doc(userID)
    .get()
    .then((currentUserInfo) => {
      const data = currentUserInfo.data();
      setUserName(data?.name);
      setUserEmail(data?.email);
    });
  }, [userID])
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi {userName}</Text>
      <Text>Email: {userEmail}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text>ID: {firebase.auth().currentUser?.uid}</Text>
      <TouchableOpacity onPress={() => firebase.auth().signOut()}>
        <Button onPress={() => firebase.auth().signOut()}>Sign Out</Button>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
