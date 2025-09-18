import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../models/Event';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

export default function EventDetailsScreen({ route, navigation }: Props) {
  const { event } = route.params;

  const deleteEvent = async () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const stored = await AsyncStorage.getItem('events');
            let events: EventItem[] = stored ? JSON.parse(stored) : [];
            events = events.filter((e) => e.id !== event.id);
            await AsyncStorage.setItem('events', JSON.stringify(events));
            navigation.goBack();
          } catch (error) {
            console.log('Error deleting event:', error);
          }
        },
      },
    ]);
  };

  const editEvent = () => {
    navigation.navigate('AddEvent', { event });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{format(new Date(event.date), 'EEEE, MMM d, yyyy • h:mm a')}</Text>

        <View style={styles.separator} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={editEvent}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={deleteEvent}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  date: {
    fontSize: 16,
    color: '#6C6C70',
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
