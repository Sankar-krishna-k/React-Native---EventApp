import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../models/Event';
import { Card, Text, Button } from 'react-native-paper';

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
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.date}>
            {format(new Date(event.date), 'EEEE, MMM d, yyyy • h:mm a')}
          </Text>

          <View style={styles.separator} />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              buttonColor="#007AFF"
              textColor="#fff"
              style={styles.button}
              onPress={editEvent}
            >
              Edit
            </Button>

            <Button
              mode="contained"
              buttonColor="#FF3B30"
              textColor="#fff"
              style={styles.button}
              onPress={deleteEvent}
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
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
    borderRadius: 12,
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
  button: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 5,
    paddingVertical: 6,
  },
});
