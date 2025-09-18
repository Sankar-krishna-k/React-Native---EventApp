import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventListScreen from './src/screens/EventListScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import { EventItem } from './src/models/Event';
import EventDetailsScreen from './src/screens/EventDetailsScreen';

export type RootStackParamList = {
  EventList: undefined;
  AddEvent: { event?: EventItem } | undefined; // optional for editing
  EventDetails: { event: EventItem };         // required event object
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Events' }} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
