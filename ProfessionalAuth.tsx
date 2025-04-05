import React, { useState } from "react";
import { 
  Alert, 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
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
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [workerDescription, setWorkerDescription] = useState("");
  const [profession, setProfession] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  async function handleAuth() {
    if (!email || !password || (isSignUp && (
      !profession || 
      !isVerified || 
      !username || 
      !phoneNumber || 
      !workerDescription
    ))) {
      Alert.alert("خطأ", "لطفا أكمل جميع الخانات");
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
            data: { 
              profession, 
              is_verified: isVerified,
              username,
              number: phoneNumber,
              worker_description: workerDescription
            },
          },
        });

        if (error) throw error;

        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            profession,
            is_verified: isVerified,
            username,
            number: phoneNumber,
            worker_description: workerDescription,
            status: "Ready to Take Orders",
            updated_at: new Date(),
          });
          Alert.alert("تم", "تم إنشاء الحساب بنجاح");
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Input
            label="Email/إيميل"
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
            placeholder="كلمة المرور"
            autoCapitalize="none"
          />
          {isSignUp && (
            <>
              <Input
                label="Username/اسم المستخدم"
                value={username}
                onChangeText={setUsername}
                placeholder="أدخل اسم المستخدم"
              />
              <Input
                label="Phone Number/رقم الجوال"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="أدخل رقم جوالك"
                keyboardType="phone-pad"
              />
              <Input
                label="Worker Description/وصف عملك"
                value={workerDescription}
                onChangeText={setWorkerDescription}
                placeholder="صف خبرتك العملية ومهاراتك"
                multiline
                numberOfLines={4}
                inputStyle={styles.descriptionInput}
              />
              <Text style={styles.pickerLabel}>المهنة</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profession}
                  onValueChange={(itemValue) => setProfession(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="اختر مهنتك" value="" />
                  <Picker.Item label="كهربائي" value="Electrician" />
                  <Picker.Item label="ميكانيكي" value="Mechanical" />
                  <Picker.Item label="سباك" value="Plumber" />
                  <Picker.Item label="نجار" value="Carpenter" />
                  <Picker.Item label="مطور" value="Developer" />
                  <Picker.Item label="مصمم" value="Designer" />
                  <Picker.Item label="أخرى" value="Other" />
                </Picker>
              </View>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  value={isVerified}
                  onValueChange={setIsVerified}
                  style={styles.checkbox}
                  color={isVerified ? "#4630EB" : undefined}
                />
                <Text style={styles.label}>Verify /التحقق من المهنة</Text>
              </View>
            </>
          )}

          <Button
            title={isSignUp ? "سجل حسابك" : "Sign In"}
            disabled={loading}
            onPress={handleAuth}
            buttonStyle={styles.mainButton}
          />

          <Button
            title={
              isSignUp
                ? "هل لديك حساب بالفعل؟ سجل دخولك"
                : "هل تحتاج إلى حساب؟ سجل الآن"
            }
            type="clear"
            onPress={() => setIsSignUp(!isSignUp)}
            titleStyle={styles.toggleButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  }
});