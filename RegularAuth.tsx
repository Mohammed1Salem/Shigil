import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { supabase } from "./lib/supabase";
import { Button, Input } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";

export default function RegularAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert("Success", "Account created successfully!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      navigation.navigate("Main");
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
  mainButton: {
    marginBottom: 10,
  },
  toggleButton: {
    color: "#4630EB",
    fontSize: 14,
  },
});
