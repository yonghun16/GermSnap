import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface HomeScreenProps {
  onStart: () => void;
}

/**
 * 앱을 처음 열었을 때 보여주는 메인(시작) 화면.
 * 바로 카메라가 켜지지 않고, 앱 소개와 [시작하기] 버튼을 먼저 보여준다.
 */
export const HomeScreen = ({ onStart }: HomeScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.icon}
          resizeMode="cover"
        />
        <Text style={styles.title}>손 세균 스캐너</Text>
        <Text style={styles.subtitle}>
          카메라로 손을 비추면{'\n'}눈에 보이지 않는 세균을 찾아볼 수 있어요!
        </Text>
      </View>

      <Pressable style={styles.startButton} onPress={onStart}>
        <Text style={styles.startButtonText}>시작하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 140,
    height: 140,
    borderRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D47A1',
  },
  subtitle: {
    fontSize: 16,
    color: '#37474F',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    position: 'absolute',
    bottom: 64,
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
