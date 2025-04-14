import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

export default function RoleSelectionScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>هل أنت شغيل ؟</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfessionalAuth')}
        >
        <Text style={styles.buttonText}>نعم ، أنا شغيل </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RegularAuth")}
      >
        <Text style={styles.buttonText}>لا ، أنا عميل </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
});
