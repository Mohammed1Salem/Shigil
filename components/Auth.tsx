import React, { useState } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import Checkbox from "expo-checkbox";

export default function ProfessionalAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  async function signUpWithEmail() {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { profession, is_verified: isVerified }
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
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function signInWithEmail() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
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
          <Input
            label="Profession"
            value={profession}
            onChangeText={setProfession}
            placeholder="e.g., Developer, Designer"
          />
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isVerified}
              onValueChange={setIsVerified}
              style={styles.checkbox}
              color={isVerified ? '#4630EB' : undefined}
            />
            <Text style={styles.label}>Verify profession</Text>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title={isSignUp ? "Sign Up" : "Sign In"}
          disabled={loading || (isSignUp && (!profession || !isVerified))}
          onPress={isSignUp ? signUpWithEmail : signInWithEmail}
          buttonStyle={styles.mainButton}
        />
        
        <Button
          title={isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          type="clear"
          onPress={() => setIsSignUp(!isSignUp)}
          titleStyle={styles.toggleButton}
        />
      </View>
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
  buttonContainer: {
    marginTop: 20,
  },
  mainButton: {
    marginBottom: 10,
  },
  toggleButton: {
    color: "#4630EB",
    fontSize: 14,
  },
});