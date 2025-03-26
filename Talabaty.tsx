import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type OrderType = {
  id: string;
  work: string;
  name: string;
  date: string;
  status: string;
  price: string;
};

const orders: OrderType[] = [
  {
    id: "1",
    work: "كهربائي",
    name: "أحمد",
    date: "2025-03-20",
    status: "تمت",
    price: "100 ريال",
  },
  {
    id: "2",
    work: "سباك",
    name: "محمد",
    date: "2025-03-19",
    status: "قيد التنفيذ",
    price: "150 ريال",
  },
];

export const Talabaty = () => {
  const renderOrder = ({ item }: { item: OrderType }) => (
    <View style={styles.orderCard}>
      <Text style={styles.priceTag}>💵 {item.price}</Text>
      <Text style={styles.orderText}> المهنة : {item.work}</Text>
      <Text style={styles.orderText}>الاسم: {item.name}</Text>
      <Text style={styles.orderText}>الوقت والتاريخ: {item.date}</Text>
      <Text
        style={[
          styles.orderText,
          item.status === "تمت" ? styles.completed : styles.inProgress,
        ]}
      >
        الحالة: {item.status}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { marginTop: "40%" }]} >
      <Text style={styles.text}>طــلــباتـــي</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
      />
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
     backgroundColor: "#f9f9f9",
     bottom: 125
    },

  text: {
    textAlign: "center",
    color: "white",
    backgroundColor: "green",
    margin: 40,
    padding: 5,
    fontSize: 20,
    borderRadius: 10,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "green",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  orderCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: "90%",
    alignSelf: "center",
  },

  orderText: { fontSize: 16, marginVertical: 5, textAlign: "right" },

  priceTag: { fontSize: 18, color: "green", marginBottom: 5 },

  completed: { color: "green" },
  inProgress: { color: "blue" },
});
