import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface HomeScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

// 올바른 손 씻기 방법 안내 영상 — 언어권에 맞는 영상을 앱 안에서 전체화면으로
// 자동 재생한다. 유일하게 인터넷 연결이 필요한 기능(YouTube 재생)이라, 100%
// 오프라인 원칙의 예외임을 00_Overview.md에 명시해뒀다. 유튜브 앱으로 나가는
// 대신 인앱 임베드로 재생하면, 추천 영상/댓글로 아이들이 다른 영상으로 새는
// 것을 막을 수 있다 (교실에서 쓰는 앱이라 중요한 지점). 4개 영상 모두
// YouTube oEmbed로 임베드 가능 여부를 미리 확인했다.
const HANDWASH_VIDEO_IDS: Record<string, string> = {
  ko: 'JvfyAtvZRvk',
  en: 'L89nN03pBzI',
  ja: '0BjE3_Xl8t0',
  zh: 'AR0kNEb0aq0',
};

/**
 * 앱을 처음 열었을 때 보여주는 메인(시작) 화면.
 * 바로 카메라가 켜지지 않고, 앱 소개와 [시작하기] 버튼을 먼저 보여준다.
 *
 * 절대 위치로 중앙에 콘텐츠를 "띄우고" 배경을 요란하게 꾸미는 대신, 실제
 * flex 레이아웃(상단 여백 - 중앙 콘텐츠 - 하단 액션)과 절제된 색/장식으로
 * 더 정돈되어 보이도록 구성했다.
 *
 * 폴더블 기기를 펼친 상태처럼 가로 대비 세로 공간이 좁은 화면에서는 콘텐츠가
 * 화면 높이를 넘칠 수 있다. ScrollView로 감싸서, 넘치면 잘리는 대신
 * 스크롤되도록 안전장치를 둔다 (평소 화면에서는 내용이 다 들어가므로 스크롤할
 * 필요가 없어 보이지 않는다).
 */
export const HomeScreen = ({ onStart, onOpenSettings, onOpenHelp }: HomeScreenProps) => {
  const { t, i18n } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoId = HANDWASH_VIDEO_IDS[i18n.language] ?? HANDWASH_VIDEO_IDS.ko;

  return (
    <View style={styles.container}>
      {/* 화면 상단에 꽉 차게 깔아둔 배경 그림. 그대로 두면 글자가 잘 안 보여서
          위에 반투명 흰색 막(overlay)을 씌워 은은하게 비치는 배경처럼
          가라앉히고, 그 위에 기존 콘텐츠를 그대로 얹는다. */}
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

      {/* 손 씻기 영상 모달: 유튜브 앱으로 나가지 않고 화면 전체를 차지하는
          모달 안에서 자동 재생한다. 플레이어를 visible일 때만 마운트해서,
          닫으면 확실하게 재생이 멈추도록 한다 (숨기기만 하면 백그라운드에서
          소리가 계속 날 수 있음). 직접 만든 WebView+iframe 방식은 유튜브의
          임베드 검증(origin 등)을 계속 통과하지 못해 오류 153이 났었는데,
          이 문제를 전문적으로 다루는 react-native-youtube-iframe으로 교체해
          해결했다 — 자세한 내용은 docs/content/notes/Handwash_Video.md 참고. */}
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
          <Pressable style={styles.videoCloseButton} onPress={() => setIsVideoVisible(false)} hitSlop={10}>
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
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
