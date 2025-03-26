import React, { useState, useEffect } from "react";
import { Image, Alert, View, TouchableOpacity, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { supabase } from "./lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { Talabaty } from "./Talabaty";
import ButtonBehavior from "./ButtonBehavior";
import HomeScreen from "./HomeScreen";
import WorkerDetailsScreen from "./WorkerDetailsScreen";
export default function MainOptionsBar() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isTalabatyVisible, setIsTalabatyVisible] = useState(false);
  const [isHomeScreenVisible, setIsHomeScreenVisible] = useState(true);

  useEffect(() => {
    requestAndStoreLocation();
  }, []);

  const requestAndStoreLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            location: `${latitude},${longitude}`,
            updated_at: new Date(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error storing location:", error);
          Alert.alert("Error", "Failed to store your location.");
        }
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "An error occurred while getting your location.");
    }
  };

  return (
    <View style={styles.container}>
     
      {isHomeScreenVisible && (
        <View style={styles.homeScreenContainer}>
          
          <HomeScreen />
        </View>
      )}

      <View style={styles.MainOptionsBarBackGround}>
        <TouchableOpacity
          style={styles.optionbar}
          onPress={() => {
            setIsTalabatyVisible(false);
            setIsMenuVisible(false);
            setIsHomeScreenVisible(true);
          }}
        >
          <Image
            source={require("./images/HomeIcon.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionbar}
          onPress={() => {
            setIsTalabatyVisible(true);
            setIsMenuVisible(false);
            setIsHomeScreenVisible(false);
          }}
        >
          <Image
            source={require("./images/WorkerIcon.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionbar}
          onPress={() => {
            setIsTalabatyVisible(false);
            setIsMenuVisible(false);
            setIsHomeScreenVisible(false);
          }}
        >
          <Image
            source={require("./images/NotficationIcon.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionbar}
          onPress={() => {
            setIsTalabatyVisible(false);
            setIsMenuVisible(true);
            setIsHomeScreenVisible(false);
          }}
        >
          <Image
            source={require("./images/SettingIcon.png")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      </View>

      {isTalabatyVisible && <Talabaty />}
      {isMenuVisible && <ButtonBehavior />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  homeScreenContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
  },
  MainOptionsBarBackGround: {
    flexDirection: "row-reverse",
    flex: 0.3,
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    justifyContent: "space-around",
  },
  optionbar: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  menuIcon: {
    height: 50,
    width: 50,
  },
});
