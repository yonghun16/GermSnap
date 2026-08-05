import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { DummyGerm } from './src/components/DummyGerm';

export default function App() {
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <DummyGerm x={100} y={100} size={40} opacity={0.6} />
      </Canvas>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvas: {
    flex: 1,
  },
});
