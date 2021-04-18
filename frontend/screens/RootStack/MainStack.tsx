import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import * as Notifications from "expo-notifications";
import Colors from "../../constants/Colors";
import useColorScheme from "../../hooks/useColorScheme";
import MainScreen from "./MainScreen/MainScreen";
import AccountScreen from "./AccountScreen/AccountScreen";
import { BottomTabParamList, HomeParamList, AccountParamList } from "../../types";
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function MainStackNavigator() {
  const colorScheme = useColorScheme();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}
    >
      <BottomTab.Screen
        name="Home"
        component={MainNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home-outline" color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Account"
        component={AccountNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person-outline" color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigationstack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const MainStack = createStackNavigator<HomeParamList>();

function MainNavigator() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="HomeScreen"
        component={MainScreen}
        options={{ headerTitle: "Home" }}
      />
    </MainStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<AccountParamList>();

function AccountNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{ headerTitle: "Account" }}
      />
    </TabTwoStack.Navigator>
  );
}

