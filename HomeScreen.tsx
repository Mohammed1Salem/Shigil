import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../TFOS/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleNavigate = (profession: string) => {
    navigation.navigate('WorkerDetails', { profession });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>أهلًا [اسم المستخدم]</Text>
        <Text style={styles.location}>
          المدينة - الرمز <Ionicons name="location-outline" size={16} color="gray" />
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="ابحث عن شغيل"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Ionicons name="search" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.offersSection}>
        <Text style={styles.offersText}>عروض خاصة</Text>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Electrician')}>
          <Ionicons name="flash" size={28} color="#fff" />
          <Text style={styles.cardText}>كهربائي</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Plumber')}>
          <FontAwesome5 name="tools" size={28} color="#fff" />
          <Text style={styles.cardText}>سباك</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Mechanical')}>
          <MaterialCommunityIcons name="robot-industrial" size={28} color="#fff" />
          <Text style={styles.cardText}>ميكانيكي</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Other')}>
          <MaterialCommunityIcons name="account-cog" size={28} color="#fff" />
          <Text style={styles.cardText}>شغيل آخر</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  welcome: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 13,
    textAlign: 'right',
    color: '#555',
    marginVertical: 4,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    textAlign: 'right',
  },
  searchIcon: {
    paddingLeft: 8,
  },
  offersSection: {
    backgroundColor: '#dcdcdc',
    padding: 12,
    alignItems: 'center',
  },
  offersText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    padding: 16,
  },
  card: {
    backgroundColor: '#1abc9c',
    width: '40%',
    paddingVertical: 20,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default HomeScreen;
