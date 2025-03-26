import React, { useState } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import { supabase } from "./lib/supabase";
import { Button, Input } from "@rneui/themed";
import Checkbox from "expo-checkbox";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { Picker } from "@react-native-picker/picker";

export default function ProfessionalAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  async function handleAuth() {
    if (!email || !password || (isSignUp && (!profession || !isVerified))) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { profession, is_verified: isVerified },
          },
        });

        if (error) throw error;

        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            profession,
            is_verified: isVerified,
            updated_at: new Date(),
          });
          Alert.alert("Success", "Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      navigation.navigate("WorkersPage");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="email@address.com"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        autoCapitalize="none"
      />
      {isSignUp && (
        <>
          <Text style={styles.pickerLabel}>Profession</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profession}
              onValueChange={(itemValue) => setProfession(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select your profession" value="" />
              <Picker.Item label="Electrician" value="Electrician" />
              <Picker.Item label="Mechanical" value="Mechanical" />
              <Picker.Item label="Plumber" value="Plumber" />
              <Picker.Item label="Carpenter" value="Carpenter" />
              <Picker.Item label="Developer" value="Developer" />
              <Picker.Item label="Designer" value="Designer" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isVerified}
              onValueChange={setIsVerified}
              style={styles.checkbox}
              color={isVerified ? "#4630EB" : undefined}
            />
            <Text style={styles.label}>Verify profession</Text>
          </View>
        </>
      )}

      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        disabled={loading}
        onPress={handleAuth}
        buttonStyle={styles.mainButton}
      />

      <Button
        title={
          isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"
        }
        type="clear"
        onPress={() => setIsSignUp(!isSignUp)}
        titleStyle={styles.toggleButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
  mainButton: {
    marginBottom: 10,
  },
  toggleButton: {
    color: "#4630EB",
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#86939e",
    borderRadius: 4,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#86939e",
    marginBottom: 5,
    marginLeft: 10,
  },
});
