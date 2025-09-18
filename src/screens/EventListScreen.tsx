import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
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

  const categories: (EventItem['category'] | 'All')[] = ['All', 'Work', 'Personal', 'Birthday', 'Meeting'];

  // Load events
  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem('events');
      let loaded: EventItem[] = stored ? JSON.parse(stored) : [];

      const now = new Date();
      loaded = loaded.filter((e) => isAfter(new Date(e.date), now) || isToday(new Date(e.date)));

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

  // Filtered and sorted events
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
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Filter by date */}
      <TouchableOpacity style={styles.dateFilter} onPress={() => setShowDatePicker(true)}>
        <Text>{dateFilter ? format(dateFilter, 'PPP') : 'Filter by date'}</Text>
      </TouchableOpacity>
{showDatePicker && (
  <DateTimePicker
    value={dateFilter || new Date()}
    mode="date"
    display="default"
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setDateFilter(selectedDate); // user selected a date
      } else if (event.type === 'dismissed') {
        setDateFilter(null); // user cancelled, remove date filter
      }
    }}
  />
)}


      {/* Category filter */}
      <View style={styles.filterContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterButton, categoryFilter === cat && styles.filterButtonSelected]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Clear Filters Button */}
      {(categoryFilter !== 'All' || dateFilter || searchText) && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setCategoryFilter('All');
            setDateFilter(null);
            setSearchText('');
          }}
        >
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}

      {/* Event list */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const badgeLabel = renderBadge(item);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('EventDetails', { event: item })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{format(new Date(item.date), 'PPpp')}</Text>
              </View>
              <View
                style={[styles.statusBadge, badgeLabel === 'Today' ? styles.todayBadge : null]}
              >
                <Text style={styles.statusText}>{badgeLabel}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Add button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddEvent')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateFilter: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  filterButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: { color: '#1C1C1E', fontWeight: '600' },
  filterTextSelected: { color: '#fff' },

  clearButton: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#222' },
  date: { fontSize: 13, color: '#666', marginTop: 4 },

  statusBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  todayBadge: { backgroundColor: '#d8fecfff' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    height: 64,
    width: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { fontSize: 34, color: '#fff', lineHeight: 36 },
});
