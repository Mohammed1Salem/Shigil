import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import { supabase } from "./lib/supabase";

type WorkerDetailsRouteProp = RouteProp<RootStackParamList, "WorkerDetails">;

interface Worker {
  id: string;
  username: string;
  profession: string;
  is_verified: boolean;
  location: string;
  number: string;
  status: string;
  is_ordered: boolean;
  worker_description: string;
}

const WorkerDetailsScreen = () => {
  const route = useRoute<WorkerDetailsRouteProp>();
  const { profession } = route.params;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("profession", profession)
      .eq("is_verified", true)
      .eq("status", "Ready to Take Orders")
      .eq("is_ordered", false);

    if (error) {
      console.error("حدث خطأ:", error.message);
    } else {
      setWorkers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, [profession]);

  const openWhatsApp = (phone: string) => {
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url);
  };

  const openInMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#1abc9c"
      />
    );
  }

  const handleOrderService = async (workerId: string) => {
    try {
      // Get the current user's ID from Supabase Auth
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData || !userData.user) {
        console.error("Authentication Error:", authError?.message);
        return;
      }

      const userId = userData.user.id;

      console.log("Attempting to order worker:", {
        workerId,
        userId,
      });

      // Update the worker's temp_id with the user's ID and set is_ordered to true
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          temp_id: userId, // Set the worker's temp_id to the current user's ID
          is_ordered: true, // Mark the worker as ordered
        })
        .eq("id", workerId)
        .select();

      if (updateError) {
        console.error("Update Error:", updateError.message);
        return;
      }

      console.log("Worker Updated:", data);

      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from("profiles")
        .select("id, temp_id, is_ordered")
        .eq("id", workerId)
        .single();

      console.log("Verification After Update:", {
        id: verifyData?.id,
        temp_id: verifyData?.temp_id,
        is_ordered: verifyData?.is_ordered,
      });
    } catch (error) {
      console.error("Unexpected Error in handleOrderService:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {workers.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          لا يوجد شغيلين حالياً.
        </Text>
      ) : (
        workers.map((worker, index) => (
          <View key={worker.id} style={styles.workerCard}>
            <View style={styles.imageContainer}>
              <Ionicons
                name="person-circle-outline"
                size={90}
                color="#1abc9c"
              />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.name}>{worker.username}</Text>
              <Text style={styles.specialty}>{worker.profession}</Text>

              <TouchableOpacity
                onPress={() => openInMaps(worker.location)}
                style={styles.mapLinkContainer}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#3498db"
                  style={{ marginLeft: 6 }}
                />
                <Text style={styles.mapLink}>عرض الموقع على الخريطة</Text>
              </TouchableOpacity>

              <Text style={styles.description}>
                {worker.worker_description}
              </Text>

              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => openWhatsApp(worker.number)}
              >
                <FontAwesome name="whatsapp" size={20} color="#fff" />
                <Text style={styles.buttonText}>تواصل عبر واتساب</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => handleOrderService(worker.id)}
              >
                <MaterialIcons
                  name="add-shopping-cart"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.buttonText}>طلب الخدمة</Text>
              </TouchableOpacity>
            </View>

            {index !== workers.length - 1 && <View style={styles.separator} />}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  workerCard: {
    paddingVertical: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  infoContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  specialty: {
    fontSize: 16,
    color: "#777",
    marginTop: 4,
  },
  description: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginVertical: 10,
    lineHeight: 22,
  },
  mapLinkContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 10,
  },
  mapLink: {
    color: "#3498db",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  whatsappButton: {
    flexDirection: "row-reverse",
    backgroundColor: "#25D366",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    elevation: 2,
  },
  orderButton: {
    flexDirection: "row-reverse",
    backgroundColor: "#1abc9c",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    marginRight: 8,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 30,
    marginTop: 30,
  },
});

export default WorkerDetailsScreen;
