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
  const [orderDetails, setOrderDetails] = useState<{
    username: string;
    location: string;
  } | null>(null);
  const [price, setPrice] = useState("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Function to open location in maps
  const openInMaps = (locationString: string) => {
    if (!locationString) {
      Alert.alert("Error", "Location not available");
      return;
    }

    try {
      // Split the location string into latitude and longitude
      const [latitude, longitude] = locationString.split(",").map(parseFloat);

      // Check if coordinates are valid
      if (isNaN(latitude) || isNaN(longitude)) {
        Alert.alert("Error", "Invalid location coordinates");
        return;
      }

      // Construct map URL (supporting both iOS and Android)
      const mapUrl = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      });

      // Open the map
      Linking.openURL(mapUrl || "");
    } catch (error) {
      console.error("Error opening maps:", error);
      Alert.alert("Error", "Could not open maps");
    }
  };

  // Request and store user's current location
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

  // Update worker status
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

  // Check order status periodically
  const checkOrderStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_ordered, temp_id, price")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching order status:", error);
        return;
      }

      // Only show modal if order is not yet processed (no price set)
      if (data?.is_ordered && data?.temp_id && !data.price) {
        // Fetch worker details using temp_id with more explicit selection
        const { data: workerDetails, error: workerError } = await supabase
          .from("profiles")
          .select("username, location")
          .eq("id", data.temp_id)
          .single();

        if (workerError) {
          console.error("Error fetching worker details:", workerError);
          return;
        }

        // Ensure username is not undefined
        if (workerDetails?.username) {
          setOrderDetails({
            username: workerDetails.username,
            location: workerDetails.location || "Location not available",
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

  // Handle order response (accept/reject)
  const handleOrderResponse = async (accepted: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // If accepted, validate price
    if (accepted) {
      // Check if price is a valid number
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        Alert.alert("Error", "Please enter a valid price");
        return;
      }

      // Update the order status in the database with price
      const { error } = await supabase
        .from("profiles")
        .update({
          price: priceValue,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating order status:", error);
        Alert.alert("Error", "Failed to update order status.");
        return;
      }
    } else {
      // If rejected, reset order details
      const { error } = await supabase
        .from("profiles")
        .update({
          is_ordered: false,
          temp_id: null,
          price: null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating order status:", error);
        Alert.alert("Error", "Failed to update order status.");
        return;
      }
    }

    // Close the modal and reset state
    setIsOrdered(false);
    setOrderDetails(null);
    setPrice("");
  };

  // Set up interval for checking order status
  useEffect(() => {
    requestAndStoreLocation();
    const interval = setInterval(checkOrderStatus, 5000); // Check every 5 seconds
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
            style={styles.button}
            onPress={() => updateStatus("Ready to Take Orders")}
          >
            <Text style={styles.buttonText}>Ready to Take Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => updateStatus("Taking a Break")}
          >
            <Text style={styles.buttonText}>Taking a Break</Text>
          </TouchableOpacity>

          <Text style={styles.statusText}>Current Status: {status}</Text>

          <Modal visible={isOrdered} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>New Order Received</Text>
                {orderDetails && (
                  <View style={styles.orderDetailsContainer}>
                    <Text style={styles.orderDetailsText}>
                      Username: {orderDetails.username || "Unknown User"}
                    </Text>
                    <View style={styles.locationContainer}>
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
                  </View>
                )}

                {/* New Price Input Field */}
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  mapLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapLink: {
    color: "#3498db",
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
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
});
