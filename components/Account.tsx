import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text } from "react-native";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import Checkbox from "expo-checkbox";

interface AccountProps {
  session: Session;
  onProfileUpdated: () => void;
}

export default function Account({ session, onProfileUpdated }: AccountProps) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [profession, setProfession] = useState("");
  const [is_verified, setIsVerified] = useState(false);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error } = await supabase
        .from("profiles")
        .select(`username, profession, is_verified`)
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username);
        setProfession(data.profession);
        setIsVerified(data.is_verified);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    profession,
  }: {
    username: string;
    profession: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session.user.id,
        username,
        profession,
        is_verified: is_verified,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) throw error;

      onProfileUpdated();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Profession"
          value={profession || ""}
          onChangeText={(text) => setProfession(text)}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={is_verified}
            onValueChange={setIsVerified}
            style={styles.checkbox}
          />
          <Text style={styles.label}>I verify that this is my profession</Text>
        </View>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Loading ..." : "Update"}
          onPress={() => updateProfile({ username, profession })}
          disabled={loading}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    margin: 8,
  },
});
