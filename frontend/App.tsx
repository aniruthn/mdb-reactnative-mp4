import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import firebase from "firebase";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./screens/index";

import Colors from "./constants/Colors";

const firebaseConfig = require("./keys.json");

if (firebase.apps.length == 0) {
  firebase.initializeApp(firebaseConfig);
}

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors[colorScheme].tint,
      accent: '#FFB9D1',
    },
  };

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <PaperProvider theme={theme}>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </PaperProvider>
    );
  }
}
