import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { supabase } from "./lib/supabase";

type OrderType = {
  id: string;
  username: string;
  profession: string;
  price: number;
  is_done: boolean;
  updated_at: string;
};

export const Talabaty = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

    // Get the current logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      Alert.alert("خطأ", "تعذر جلب بيانات المستخدم");
      return;
    }

    // Fetch orders based on `temp_id = user.id` (all orders for this customer)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, profession, price, is_done, updated_at")
      .eq("temp_id", user.id) // Filter orders for the current customer
      .not("price", "is", null); // Ensure there's a valid price for each order

    if (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("خطأ", "فشل في تحميل الطلبات");
    } else {
      setOrders(data);
    }

    setLoading(false);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }: { item: OrderType }) => (
    <View style={styles.orderCard}>
      <Text style={styles.priceTag}>💵 {item.price} ريال</Text>
      <Text style={styles.orderText}>العامل: {item.username}</Text>
      <Text style={styles.orderText}>المهنة: {item.profession}</Text>
      <Text style={styles.orderText}>تاريخ الطلب: {formatDate(item.updated_at)}</Text>
      <Text
        style={[
          styles.orderText,
          item.is_done ? styles.completed : styles.inProgress,
        ]}
      >
        الحالة: {item.is_done ? "تمت" : "قيد التنفيذ"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { marginTop: "40%" }]}>
      <Text style={styles.text}>طــلــباتـــي</Text>
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>جاري التحميل...</Text>
      ) : orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>لا توجد طلبات</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    bottom: 125,
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
