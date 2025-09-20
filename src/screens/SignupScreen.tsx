import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<any>(null);

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality: 0.7,
      });
      setPhoto(image);
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Please fill all fields');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    if (photo) {
      const uriParts = photo.path.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('profilePhoto', {
        uri: photo.path,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const response = await fetch('http://192.168.1.53:5000/api/auth/signup', { // use your computer IP
        method: 'POST',
        body: formData, // do NOT set Content-Type manually
      });

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert(data.message || 'Signup failed');
      }

      // Store token and user info
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      navigation.replace('EventList');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error connecting to server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>

      <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} />
      <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.input} />

      <Button mode="outlined" onPress={pickImage} style={styles.button}>
        {photo ? 'Change Photo' : 'Pick Profile Photo'}
      </Button>
      {photo && <Image source={{ uri: photo.path }} style={{ width: 80, height: 80, borderRadius: 40, marginVertical: 10 }} />}

      <Button mode="contained" onPress={handleSignup} style={styles.button}>
        Sign Up
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F5F7FA' },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  button: { marginTop: 12, paddingVertical: 6 },
  link: { marginTop: 16, textAlign: 'center', color: '#007AFF', fontWeight: '600' },
});
