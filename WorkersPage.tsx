import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Modal,
  Linking,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import { supabase } from "./lib/supabase";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { Ionicons } from "@expo/vector-icons";

export default function WorkersPage() {
  const [status, setStatus] = useState("Taking a Break");
  const [isOrdered, setIsOrdered] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [workingDetails, setWorkingDetails] = useState<{
    username: string;
    location: string;
    scenario?: string;
    price?: number;
  } | null>(null);
  const [orderDetails, setOrderDetails] = useState<{
    username: string;
    location: string;
    scenario?: string;
    temp_id: Int16Array;
  } | null>(null);
  const [price, setPrice] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const openInMaps = (locationString: string) => {
    if (!locationString) {
      Alert.alert("Error", "Location not available");
      return;
    }

    try {
      const [latitude, longitude] = locationString.split(",").map(parseFloat);
      if (isNaN(latitude) || isNaN(longitude)) {
        Alert.alert("Error", "Invalid location coordinates");
        return;
      }

      const mapUrl = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      });

      Linking.openURL(mapUrl || "");
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert("Error", "Could not open maps");
    }
  };

  const requestAndStoreLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            location: `${latitude},${longitude}`,
            updated_at: new Date(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Error storing location:", error);
          Alert.alert("Error", "Failed to store your location.");
        }
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "An error occurred while getting your location.");
    }
  };

  const updateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

  const checkOrderStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_ordered, temp_id, price, scenario, is_working, is_done")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching order status:", error);
        return;
      }

      setIsWorking(data.is_working || false);

      if (data.is_working) {
        const { data: workerDetails, error: workerError } = await supabase
          .from("profiles")
          .select("username, location")
          .eq("id", data.temp_id)
          .single();

        if (!workerError && workerDetails) {
          setWorkingDetails({
            username: workerDetails.username,
            location: workerDetails.location || "Location not available",
            scenario: data.scenario || "No scenario provided",
            price: data.price,
          });
          setStatus(`Is working now for ${workerDetails.username || "Client"}`);
        }
      }

      if (
        data &&
        data.is_ordered === true &&
        data.is_working === false &&
        data.temp_id
      ) {
        const { data: workerDetails, error: workerError } = await supabase
          .from("profiles")
          .select("username, location")
          .eq("id", data.temp_id)
          .single();

        if (workerError) {
          console.error("Error fetching worker details:", workerError);
          return;
        }

        if (workerDetails?.username) {
          setOrderDetails({
            username: workerDetails.username,
            location: workerDetails.location || "Location not available",
            scenario: data.scenario || "No scenario provided",
            temp_id: data.temp_id,
          });
          setIsOrdered(true);
        }
      } else {
        setIsOrdered(false);
        setOrderDetails(null);
      }
    } catch (err) {
      console.error("Unexpected error in checkOrderStatus:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleOrderResponse = async (accepted: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (accepted) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        Alert.alert("Error", "Please enter a valid price");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          price: priceValue,
          is_working: true,
          is_done: false,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating order status:", error);
        Alert.alert("Error", "Failed to update order status.");
        return;
      }
    } else {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_ordered: false,
          temp_id: null,
          price: null,
          scenario: null,
          is_working: false,
          is_done: false,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating order status:", error);
        Alert.alert("Error", "Failed to update order status.");
        return;
      }

      setIsWorking(false);
      setWorkingDetails(null);
      setStatus("Taking a Break");
    }

    setIsOrdered(false);
    setOrderDetails(null);
    setPrice("");
  };

  const handleCancelOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_working: false,
        is_ordered: false,
        temp_id: null,
        price: null,
        scenario: null,
        is_done: false,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Error", "Failed to cancel order");
      return;
    }

    setIsWorking(false);
    setWorkingDetails(null);
    await updateStatus("Ready to Take Orders"); // Update status here
  };

  const handleCompleteOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_done: true,
        is_working: false,
        is_ordered: false,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error completing order:", error);
      Alert.alert("Error", "Failed to complete order");
      return;
    }

    setIsWorking(false);
    setWorkingDetails(null);
    await updateStatus("Ready to Take Orders"); // Update status here
    Alert.alert("Success", "Order marked as completed!");
  };

  useEffect(() => {
    requestAndStoreLocation();
    const interval = setInterval(checkOrderStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={[styles.button, isWorking && styles.disabledButton]}
            onPress={() => updateStatus("Ready / جاهز ")}
            disabled={isWorking}
          >
            <Text
              style={[
                styles.buttonText,
                isWorking && styles.disabledButtonText,
              ]}
            >
              Ready / جاهز لاستلام الطلبات  
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isWorking && styles.disabledButton]}
            onPress={() => updateStatus("Break / استراحة")}
            disabled={isWorking}
          >
            <Text
              style={[
                styles.buttonText,
                isWorking && styles.disabledButtonText,
              ]}
            >
              أخذ استراحة / Break
            </Text>
          </TouchableOpacity>

          {isWorking && workingDetails ? (
            <View style={styles.workingDetailsContainer}>
              <Text style={styles.scenarioTitle}>Scenario:</Text>
              <Text style={styles.scenarioText}>{workingDetails.scenario}</Text>
              <Text style={styles.statusText}>{status}</Text>

              {workingDetails.location && (
                <TouchableOpacity
                  onPress={() => openInMaps(workingDetails.location)}
                  style={styles.mapLinkContainer}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#3498db"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.mapLink}>Open Location in Maps</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.workingDetailsText}>
                Price: {workingDetails.price?.toFixed(2)} SAR
              </Text>

              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelOrder}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCompleteOrder}
                >
                  <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.statusText}>state - الحالة</Text>
             <Text style={{ color: 'blue' ,fontWeight: 'bold',fontSize: 16,}}>{status}</Text>
            </View>
          )}

          <Modal visible={isOrdered} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>New Order Received</Text>
                {orderDetails && (
                  <View style={styles.orderDetailsContainer}>
                    <Text style={styles.orderDetailsText}>
                      Username: {orderDetails.username || "Unknown User"}
                    </Text>
                    {orderDetails.location && (
                      <TouchableOpacity
                        onPress={() => openInMaps(orderDetails.location)}
                        style={styles.mapLinkContainer}
                      >
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="#3498db"
                          style={{ marginRight: 5 }}
                        />
                        <Text style={styles.mapLink}>Open in Maps</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {orderDetails?.scenario && (
                  <View style={styles.scenarioContainer}>
                    <Text style={styles.scenarioTitle}>Scenario:</Text>
                    <Text style={styles.scenarioText}>
                      {orderDetails.scenario}
                    </Text>
                  </View>
                )}

                <TextInput
                  style={styles.priceInput}
                  placeholder="Enter your price"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleOrderResponse(true)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleOrderResponse(false)}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a9a9a9",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#666666",
  },
  statusText: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderDetailsContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  orderDetailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  scenarioContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "flex-start",
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scenarioText: {
    fontSize: 14,
    color: "#333",
  },
  priceInput: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "80%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: "80%",
    alignItems: "center",
  },
  workingDetailsContainer: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "flex-start",
  },
  workingDetailsText: {
    fontSize: 16,
    marginTop: 5,
    color: "#333",
  },
  mapLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  mapLink: {
    color: "#3498db",
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  doneButton: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
});
