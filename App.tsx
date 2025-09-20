import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import EventListScreen from './src/screens/EventListScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import { EventItem } from './src/models/Event';

export type RootStackParamList = {
  EventList: undefined;
  AddEvent: { event?: EventItem } | undefined;
  EventDetails: { event: EventItem };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#6200ee' }, // Material Purple
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="EventList"
            component={EventListScreen}
            options={{ title: 'Events' }}
          />
          <Stack.Screen
            name="AddEvent"
            component={AddEventScreen}
            options={{ title: 'Add Event' }}
          />
          <Stack.Screen
            name="EventDetails"
            component={EventDetailsScreen}
            options={{ title: 'Event Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
