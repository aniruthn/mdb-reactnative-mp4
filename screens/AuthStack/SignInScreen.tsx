
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, ScrollView, Text } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { AuthStackParamList } from "./AuthStackScreen";
import firebase from "firebase";

interface Props {
  navigation: StackNavigationProp<AuthStackParamList, "SignInScreen">;
}

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const onDismissSnackBar = () => setVisible(false);
  const showError = (error: string) => {
    setMessage(error);
    setVisible(true);
  };

  const trySignIn = () => {
    try {
      firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    } catch (error) {
      showError(error.toString());
    }
    
  }

  const resetPassword = () => {
    try {
      firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {showError("Email sent.")})
    } catch (error) {
      showError(error.toString());
    }    
  }
  
  return (
    <>
      <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Sign In" />
      </Appbar.Header>
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
          onPress={trySignIn}
          style={{ marginTop: 20 }}
        >
          Sign In
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate("SignUpScreen")} style={{ marginTop: 20 }}>
          Create An Account
        </Button>
        <Button mode="outlined" onPress={resetPassword} style={{ marginTop: 20 }}>
          Reset Password
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