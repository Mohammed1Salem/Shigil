import React from "react";
import { Linking, BackHandler, Alert } from "react-native";
import { supabase } from "./lib/supabase";
import { View, Modal, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";

export default function ButtonBehavior({ onClose = () => {} }) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleContactUs = () => {
    Linking.openURL("mailto:mkm33361@gmail.com");
  };

  const handleQuit = () => {
    BackHandler.exitApp();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        Alert.alert("Error signing out", error.message);
      } else {
        onClose();
        navigation.reset({
          index: 0,
          routes: [{ name: "RoleSelection" }],
        });
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      Alert.alert("Error signing out", "An unexpected error occurred");
    }
  };

  return (
    <View style={[styles.container, { marginTop: "15%" }]}>
      <TouchableOpacity onPress={handleQuit} style={styles.button}>
        <Text style={styles.buttonText}>Quit</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleContactUs} style={styles.button}>
        <Text style={styles.buttonText}>Contact Us</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    backgroundColor: "#DDDDDD",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
