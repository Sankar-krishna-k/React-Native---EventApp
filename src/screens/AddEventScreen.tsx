import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Text, Chip } from 'react-native-paper';
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
      return Alert.alert('Please enter all fields and select a category');
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
      Alert.alert('Failed to save event');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{existingEvent ? 'Edit Event' : 'Add New Event'}</Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Event Title"
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            {date ? format(date, 'PPP') : 'Select Date'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => setShowTimePicker(true)}
            style={styles.input}
          >
            {time ? format(time, 'p') : 'Select Time'}
          </Button>

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
              <Chip
                key={cat}
                mode="outlined"
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                textStyle={category === cat ? styles.categoryTextSelected : undefined}
              >
                {cat}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            {existingEvent ? 'Update Event' : 'Save Event'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
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
    borderRadius: 12,
    padding: 0,
  },
  input: {
    marginTop: 12,
    backgroundColor: 'white',
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#6C6C70',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  categoryChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 30,
    paddingVertical: 6,
  },
});
