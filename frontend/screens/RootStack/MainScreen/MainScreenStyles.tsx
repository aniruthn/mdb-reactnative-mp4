import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

export const MainStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    top: 20,
    position: "absolute"
  },
  button: {
    position: "absolute",
    bottom: 20
  },
  map: {
    position: "absolute",
    width: Dimensions.get('window').width,
    height: "100%",
  },
});
