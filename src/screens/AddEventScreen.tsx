import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventItem } from '../models/Event';

export default function AddEventScreen({ navigation, route }: any) {
  const existingEvent: EventItem | undefined = route.params?.event;

  const [title, setTitle] = useState(existingEvent ? existingEvent.title : '');
  const [date, setDate] = useState<Date | null>(existingEvent ? new Date(existingEvent.date) : null);
  const [time, setTime] = useState<Date | null>(existingEvent ? new Date(existingEvent.date) : null);
  const [category, setCategory] = useState<EventItem['category']>(existingEvent?.category);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories: EventItem['category'][] = ['Work', 'Personal', 'Birthday', 'Meeting'];

  const handleSave = async () => {
    if (!title || !date || !time || !category) {
      Alert.alert('Error', 'Please enter all fields and select a category');
      return;
    }

    const finalDate = new Date(date);
    finalDate.setHours(time.getHours());
    finalDate.setMinutes(time.getMinutes());

    try {
      const stored = await AsyncStorage.getItem('events');
      let events: EventItem[] = stored ? JSON.parse(stored) : [];

      if (existingEvent) {
        events = events.map((e) =>
          e.id === existingEvent.id
            ? { ...e, title, date: finalDate.toISOString(), category }
            : e
        );
      } else {
        const newEvent: EventItem = {
          id: Date.now().toString(),
          title,
          date: finalDate.toISOString(),
          category,
        };
        events.push(newEvent);
      }

      await AsyncStorage.setItem('events', JSON.stringify(events));
      navigation.navigate('EventList');
    } catch (err) {
      console.error('Error saving event:', err);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{existingEvent ? 'Edit Event' : 'Add New Event'}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Event Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{date ? format(date, 'PPP') : 'Select Date'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Event Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text>{time ? format(time, 'p') : 'Select Time'}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {existingEvent ? 'Update Event' : 'Save Event'}
          </Text>
        </TouchableOpacity>
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
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C6C70',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    backgroundColor: '#FAFAFA',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    color: '#1C1C1E',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
