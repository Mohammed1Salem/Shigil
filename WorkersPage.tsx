import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";

export default function WorkersPage() {
  const [status, setStatus] = useState("Taking a Break");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", "Failed to update status.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => updateStatus("Ready to Take Orders")}>
        <Text style={styles.buttonText}>Ready to Take Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => updateStatus("Taking a Break")}>
        <Text style={styles.buttonText}>Taking a Break</Text>
      </TouchableOpacity>

      <Text style={styles.statusText}>Current Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
});
