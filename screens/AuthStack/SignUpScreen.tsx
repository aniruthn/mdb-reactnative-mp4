import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import * as Notifications from "expo-notifications";
import { AuthStackParamList } from "./AuthStackScreen";
import firebase from "firebase";

interface Props {
  navigation: StackNavigationProp<AuthStackParamList, "SignUpScreen">;
}

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const onDismissSnackBar = () => setVisible(false);
  const showError = (error: string) => {
    setMessage(error);
    setVisible(true);
  };

  const createAccount = async () => {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    //token needs to be generated in main stack after asking for permissions
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    let userObject = {
      name: name,
      email: email,
      notificationToken: token,
      settings: {
        locationTrackingOn: true,
        pushNotificationsOn: true,
      }
    };
    return await firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser?.uid)
      .set(userObject).catch((error) => showError(error));
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Sign Up" />
      </Appbar.Header>
      <TextInput
          label="Name"
          value={name}
          onChangeText={(name: any) => setName(name)}
          style={{ marginBottom: 10 }}
        />
      <TextInput
          label="Email"
          value={email}
          onChangeText={(email: any) => setEmail(email)}
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={(password: any) => setPassword(password)}
          style={{ marginBottom: 10 }}
          secureTextEntry={true}
        />
        <Button
          mode="contained"
          onPress={createAccount}
          style={{ marginTop: 20 }}
        >
          Create An Account
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate("SignInScreen")} style={{ marginTop: 20 }}>
          Or, Sign In Instead
        </Button>
        <Snackbar
          duration={3000}
          visible={visible}
          onDismiss={onDismissSnackBar}
        >
          {message}
        </Snackbar>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },
});