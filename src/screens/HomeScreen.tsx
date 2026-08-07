import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

/**
 * 앱을 처음 열었을 때 보여주는 메인(시작) 화면.
 * 바로 카메라가 켜지지 않고, 앱 소개와 [시작하기] 버튼을 먼저 보여준다.
 */
export const HomeScreen = ({ onStart, onOpenSettings }: HomeScreenProps) => {
  return (
    <View style={styles.container}>
      {/* 배경 장식용 은은한 파스텔 블롭 — 밋밋한 배경에 화면을 좀 더 꾸며준다 */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.decorBlob, styles.decorBlobTopLeft]} />
        <View style={[styles.decorBlob, styles.decorBlobTopRight]} />
        <View style={[styles.decorBlob, styles.decorBlobBottom]} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconShadowWrap}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.icon}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>손 세균 스캐너</Text>
        <Text style={styles.subtitle}>
          카메라로 손을 비추면{'\n'}눈에 보이지 않는 세균을 찾아볼 수 있어요!
        </Text>
      </View>

      <View style={styles.bottomActions}>
        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </Pressable>
        <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
          <Ionicons name="settings-outline" size={16} color="#0D47A1" />
          <Text style={styles.settingsButtonText}>설정</Text>
        </Pressable>
      </View>
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
    overflow: 'hidden',
  },
  decorBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  decorBlobTopLeft: {
    width: 180,
    height: 180,
    backgroundColor: '#BBDEFB',
    top: -60,
    left: -60,
  },
  decorBlobTopRight: {
    width: 140,
    height: 140,
    backgroundColor: '#F8BBD0',
    top: 40,
    right: -50,
  },
  decorBlobBottom: {
    width: 220,
    height: 220,
    backgroundColor: '#C8E6C9',
    bottom: -80,
    left: -40,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconShadowWrap: {
    borderRadius: 32,
    shadowColor: '#0D47A1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
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
  bottomActions: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    gap: 14,
  },
  startButton: {
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
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(13,71,161,0.25)',
  },
  settingsButtonText: {
    color: '#0D47A1',
    fontSize: 14,
    fontWeight: '600',
  },
});
