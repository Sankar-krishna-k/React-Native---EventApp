import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  FAB,
} from 'react-native-paper';
import { EventItem } from '../models/Event';
import { format, isToday, isAfter, isSameDay } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'EventList'>;

export default function EventListScreen({ navigation }: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventItem['category'] | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories: (EventItem['category'] | 'All')[] = [
    'All',
    'Work',
    'Personal',
    'Birthday',
    'Meeting',
  ];

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem('events');
      let loaded: EventItem[] = stored ? JSON.parse(stored) : [];

      const now = new Date();
      loaded = loaded.filter(
        (e) => isAfter(new Date(e.date), now) || isToday(new Date(e.date))
      );

      setEvents(loaded);
      await AsyncStorage.setItem('events', JSON.stringify(loaded));
    } catch (error) {
      console.log('Error loading events:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadEvents);
    return unsubscribe;
  }, [navigation]);

  const renderBadge = (event: EventItem) => {
    const eventDate = new Date(event.date);
    if (isToday(eventDate)) return 'Today';
    return 'Upcoming';
  };

  const filteredEvents = events
    .filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const matchesDate = !dateFilter || isSameDay(new Date(e.date), dateFilter);
      return matchesSearch && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isToday(dateA) && !isToday(dateB)) return -1;
      if (!isToday(dateA) && isToday(dateB)) return 1;
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
        <Text style={styles.headerSubtitle}>{filteredEvents.length} upcoming</Text>
      </View>

      {/* Search bar */}
      <TextInput
        placeholder="Search by title..."
        mode="outlined"
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Filter by date */}
      <Button
        mode="outlined"
        style={styles.dateFilter}
        onPress={() => setShowDatePicker(true)}
      >
        {dateFilter ? format(dateFilter, 'PPP') : 'Filter by date'}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={dateFilter || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setDateFilter(selectedDate);
            } else if (event.type === 'dismissed') {
              setDateFilter(null);
            }
          }}
        />
      )}

      {/* Category filter */}
      <View style={styles.filterContainer}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            selected={categoryFilter === cat}
            onPress={() => setCategoryFilter(cat)}
            style={styles.filterChip}
          >
            {cat}
          </Chip>
        ))}
      </View>

      {/* Clear Filters Button */}
      {(categoryFilter !== 'All' || dateFilter || searchText) && (
        <Button
          mode="contained"
          buttonColor="#FF3B30"
          textColor="#fff"
          style={styles.clearButton}
          onPress={() => {
            setCategoryFilter('All');
            setDateFilter(null);
            setSearchText('');
          }}
        >
          Clear Filters
        </Button>
      )}

      {/* Event list */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const badgeLabel = renderBadge(item);
          return (
            <Card
              style={styles.card}
              mode="elevated"
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            >
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.date}>{format(new Date(item.date), 'PPpp')}</Text>
                </View>
                <Chip
                  style={[
                    styles.statusBadge,
                    badgeLabel === 'Today' ? styles.todayBadge : null,
                  ]}
                >
                  {badgeLabel}
                </Chip>
              </Card.Content>
            </Card>
          );
        }}
      />

      {/* Floating Add button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEvent')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#007AFF' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 4 },

  searchInput: {
    margin: 16,
    backgroundColor: '#fff',
  },
  dateFilter: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  clearButton: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#222' },
  date: { fontSize: 13, color: '#666', marginTop: 4 },

  statusBadge: {
    marginLeft: 12,
  },
  todayBadge: {
    backgroundColor: '#d8fecfff',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
});
