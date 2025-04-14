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
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  async function handleAuth() {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert("خطأ", "لطفا أكمل جميع الخانات");
      
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) throw signUpError;

        // If sign up is successful, add username to profiles
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ username: username })
            .eq("id", signUpData.user.id);

          if (profileError) throw profileError;

          Alert.alert("تم", "تم إنشاء الحساب بنجاح");
        }
      } else {
        // Sign In Flow
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
        Alert.alert("خطأ", "حدث خطأ غير معروف");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {isSignUp && (
        <Input
          label="Username/اسم المستخدم"
          value={username}
          onChangeText={setUsername}
          placeholder="ادخل اسم المستخدم"
          autoCapitalize="none"
        />
      )}
      <Input
        label="Email/الإيميل"
        value={email}
        onChangeText={setEmail}
        placeholder="email@address.com"
        autoCapitalize="none"
      />
      <Input
        label="Password/كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="ادخل كلمة المرور"
        autoCapitalize="none"
      />

      <Button
        title={isSignUp ? "سجل حسابك" : "سجل دخولك "}
        disabled={loading}
        onPress={handleAuth}
        buttonStyle={styles.mainButton}
      />

      <Button
        title={
          isSignUp
            ? "هل لديك حساب بالفعل؟ سجل دخولك"
            :  "هل تحتاج إلى حساب؟ سجل الآن"
        }
        type="clear"
        onPress={() => {
          // Reset username when toggling
          setUsername("");
          setIsSignUp(!isSignUp);
        }}
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
    backgroundColor : "green",
    marginBottom: 10,
  },
  toggleButton: {
    color: "#4630EB",
    fontSize: 14,
  },
});
