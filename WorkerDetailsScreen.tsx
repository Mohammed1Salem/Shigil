import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Modal,
  TextInput,
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
  scenario?: string;
  temp_id?: string;
}

const WorkerDetailsScreen = () => {
  const route = useRoute<WorkerDetailsRouteProp>();
  const { profession } = route.params;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [scenarioText, setScenarioText] = useState("");

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

  const handleOrderService = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setModalVisible(true);
  };

  const confirmOrderService = async () => {
    try {
      // Get the current user's ID from Supabase Auth
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData || !userData.user) {
        console.error("Authentication Error:", authError?.message);
        return;
      }

      const userId = userData.user.id;

      if (!selectedWorkerId) return;

      // Update the worker's temp_id with the user's ID, set is_ordered to true, and add scenario
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          temp_id: userId, // Set the worker's temp_id to the current user's ID
          is_ordered: true, // Mark the worker as ordered
          scenario: scenarioText, // Add the scenario text
        })
        .eq("id", selectedWorkerId)
        .select();

      if (updateError) {
        console.error("Update Error:", updateError.message);
        return;
      }

      // Reset modal and state
      setModalVisible(false);
      setSelectedWorkerId(null);
      setScenarioText("");

      // Refresh workers list
      fetchWorkers();
    } catch (error) {
      console.error("Unexpected Error in handleOrderService:", error);
    }
  };

  const cancelOrderService = () => {
    setModalVisible(false);
    setSelectedWorkerId(null);
    setScenarioText("");
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

  return (
    <View style={styles.container}>
      <ScrollView>
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

              {index !== workers.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Scenario Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={cancelOrderService}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>وصف السيناريو</Text>
            <TextInput
              style={styles.scenarioInput}
              multiline
              numberOfLines={4}
              placeholder="اكتب تفاصيل الخدمة المطلوبة..."
              value={scenarioText}
              onChangeText={setScenarioText}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelOrderService}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmOrderService}
                disabled={scenarioText.trim() === ""}
              >
                <Text style={styles.modalButtonText}>تأكيد</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  scenarioInput: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#1abc9c",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
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
