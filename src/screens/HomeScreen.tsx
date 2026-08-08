import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

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
            <Text style={styles.eyebrowText}>초등학교 보건교육</Text>
          </View>

          <Image source={require('../../assets/icon.png')} style={styles.icon} resizeMode="cover" />

          <Text style={styles.title}>손 세균 스캐너</Text>
          <Text style={styles.subtitle}>
            카메라로 손을 비추면{'\n'}눈에 보이지 않는 세균을 찾아볼 수 있어요!
          </Text>
        </View>

        <View style={styles.actions}>
          {/* 진짜 세균 검출이 아니라 교육용 합성 이미지임을, 도움말까지 찾아
              들어가지 않아도 시작 전에 누구나 보게끔 인트로에 바로 안내한다. */}
          <View style={styles.disclaimerRow}>
            <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
            <Text style={styles.disclaimerText}>실제 세균이 아닌, 교육용으로 합성한 이미지예요</Text>
          </View>

          <Pressable onPress={onStart}>
            <LinearGradient
              colors={['#4FACF7', '#1565C0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>시작하기</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
          <View style={styles.secondaryButtonRow}>
            <Pressable style={styles.secondaryButton} onPress={onOpenSettings}>
              <Ionicons name="settings-outline" size={16} color="#334155" />
              <Text style={styles.secondaryButtonText}>설정</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onOpenHelp}>
              <Ionicons name="help-circle-outline" size={16} color="#334155" />
              <Text style={styles.secondaryButtonText}>도움말</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  secondaryButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});
