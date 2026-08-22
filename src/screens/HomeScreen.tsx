import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface HomeScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

// 언어권별 손 씻기 안내 영상 — 인앱 전체화면으로 재생한다 (유일하게 인터넷이
// 필요한 기능, 100% 오프라인 원칙의 예외).
const HANDWASH_VIDEO_IDS: Record<string, string> = {
  ko: 'JvfyAtvZRvk',
  en: 'L89nN03pBzI',
  ja: '0BjE3_Xl8t0',
  zh: 'AR0kNEb0aq0',
};

/** 앱을 처음 열었을 때 보여주는 메인(시작) 화면. 앱 소개와 시작 버튼을 보여준다. */
export const HomeScreen = ({ onStart, onOpenSettings, onOpenHelp }: HomeScreenProps) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoId = HANDWASH_VIDEO_IDS[i18n.language] ?? HANDWASH_VIDEO_IDS.ko;

  return (
    <View style={styles.container}>
      {/* 배경 그림 위에 반투명 흰색 막을 씌워 텍스트 가독성을 확보한다 */}
      <Image source={require('../../assets/pic.png')} style={styles.backgroundImage} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, styles.backgroundOverlay]} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>{t('home.eyebrow')}</Text>
          </View>

          <Image source={require('../../assets/icon.png')} style={styles.icon} resizeMode="cover" />

          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.actions}>
          {/* 진짜 세균 검출이 아니라 교육용 합성 이미지임을, 도움말까지 찾아
              들어가지 않아도 시작 전에 누구나 보게끔 인트로에 바로 안내한다. */}
          <View style={styles.disclaimerRow}>
            <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
            <Text style={styles.disclaimerText}>{t('home.disclaimer')}</Text>
          </View>

          <Pressable onPress={onStart}>
            <LinearGradient
              colors={['#4FACF7', '#1565C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>{t('home.start')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
          <View style={styles.secondaryButtonRow}>
            <Pressable style={styles.secondaryButton} onPress={onOpenSettings}>
              <Text style={styles.secondaryButtonEmoji}>⚙️</Text>
              <Text style={styles.secondaryButtonText}>{t('home.settings')}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onOpenHelp}>
              <Text style={styles.secondaryButtonEmoji}>❓</Text>
              <Text style={styles.secondaryButtonText}>{t('home.help')}</Text>
            </Pressable>
          </View>
          <Pressable style={styles.videoButton} onPress={() => setIsVideoVisible(true)}>
            <Ionicons name="logo-youtube" size={18} color="#FF0000" />
            <Text style={styles.videoButtonText}>{t('home.handwashVideo')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 손 씻기 영상 모달 — 플레이어는 visible일 때만 마운트해 닫으면 재생도 멈춘다 */}
      <Modal
        visible={isVideoVisible}
        animationType="fade"
        onRequestClose={() => setIsVideoVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.videoModalContainer}>
          {isVideoVisible && (
            <YoutubePlayer
              key={videoId}
              height={(windowWidth * 9) / 16}
              width={windowWidth}
              videoId={videoId}
              play
              forceAndroidAutoplay
              initialPlayerParams={{ rel: false }}
            />
          )}
          <Pressable
            style={[
              styles.videoCloseButton,
              { top: insets.top + 24, right: insets.right + 20 },
            ]}
            onPress={() => setIsVideoVisible(false)}
            hitSlop={10}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 40,
    gap: 32,
  },
  heroSection: {
    alignItems: 'center',
    gap: 14,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E88E5',
  },
  eyebrowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E88E5',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  icon: {
    width: 132,
    height: 132,
    borderRadius: 30,
    marginBottom: 4,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0B1F3A',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    aspectRatio: 1,
  },
  backgroundOverlay: {
    backgroundColor: 'rgba(250,252,255,0.86)',
  },
  actions: {
    gap: 12,
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 17,
    borderRadius: 18,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonEmoji: {
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#FFF1F0',
  },
  videoButtonText: {
    color: '#C0362C',
    fontSize: 14,
    fontWeight: '600',
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  videoCloseButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
