import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const workers = [
  {
    name: 'أحمد الخالدي',
    specialty: 'كهربائي',
    rating: 4.5,
    phone: '966500000001',
    description: 'خبير في التركيبات الكهربائية بأعلى جودة وسرعة.',
  },
  {
    name: 'سلمان العتيبي',
    specialty: 'سباك',
    rating: 4.2,
    phone: '966500000002',
    description: 'سباك محترف في صيانة شبكات المياه.',
  },
  {
    name: 'محمد السبيعي',
    specialty: 'ميكانيكي',
    rating: 4.8,
    phone: '966500000003',
    description: 'متخصص في إصلاح السيارات والميكانيكا العامة.',
  },
];

const WorkerDetailsScreen = () => {
  const openWhatsApp = (phone: string) => {
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      {workers.map((worker, index) => (
        <View key={index} style={styles.workerCard}>
          <View style={styles.imageContainer}>
            <Ionicons name="person-circle-outline" size={90} color="#1abc9c" />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{worker.name}</Text>
            <Text style={styles.specialty}>{worker.specialty}</Text>

            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={20}
                  color={i < Math.round(worker.rating) ? '#f1c40f' : '#ccc'}
                />
              ))}
              <Text style={styles.ratingText}>{worker.rating}</Text>
            </View>

            <Text style={styles.description}>{worker.description}</Text>

            {/* زر واتساب */}
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => openWhatsApp(worker.phone)}
            >
              <FontAwesome name="whatsapp" size={20} color="#fff" />
              <Text style={styles.buttonText}>تواصل عبر واتساب</Text>
            </TouchableOpacity>

            {/* زر طلب الخدمة */}
            <TouchableOpacity style={styles.orderButton}>
              <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
              <Text style={styles.buttonText}>طلب الخدمة</Text>
            </TouchableOpacity>
          </View>

          {/* خط فاصل */}
          {index !== workers.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
  },
  workerCard: {
    paddingVertical: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  infoContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  specialty: {
    fontSize: 16,
    color: '#777',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#444',
    marginRight: 6,
  },
  description: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginVertical: 15,
    lineHeight: 22,
  },
  whatsappButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    elevation: 2,
  },
  orderButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1abc9c',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    marginRight: 8,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 30,
    marginTop: 30,
  },
});

export default WorkerDetailsScreen;
