import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpScreenProps {
  onBack: () => void;
}

interface HelpItem {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const HELP_ITEMS: HelpItem[] = [
  {
    icon: 'camera-outline',
    iconBg: '#E1F5FE',
    iconColor: '#0288D1',
    title: '손 사진 찍기',
    description: '"시작하기"를 누르고, 손바닥이 화면 안에 크게 오도록 맞춘 뒤 아래쪽 동그란 촬영 버튼을 눌러요.',
  },
  {
    icon: 'sparkles-outline',
    iconBg: '#FCE4EC',
    iconColor: '#D81B60',
    title: '손 씻기 전 / 후 바꾸기',
    description: '카메라 화면 오른쪽 아래 작은 동그란 버튼을 누르면 손 씻기 전(분홍 🧼)과 손 씻은 후(하양 ✨)를 바꿀 수 있어요.',
  },
  {
    icon: 'search-outline',
    iconBg: '#E8F5E9',
    iconColor: '#43A047',
    title: '확대해서 자세히 보기',
    description: '결과 화면에서 손가락 두 개로 화면을 벌리면(핀치 줌), 눈에 잘 안 보이던 세균이 크고 또렷하게 보여요.',
  },
  {
    icon: 'refresh-outline',
    iconBg: '#FFF3E0',
    iconColor: '#F57C00',
    title: '다시 찍기',
    description: '결과 화면 왼쪽 위 "다시 찍기" 버튼을 누르면 처음부터 다시 촬영할 수 있어요.',
  },
  {
    icon: 'settings-outline',
    iconBg: '#EDE7F6',
    iconColor: '#7B1FA2',
    title: '균 표시 방식 바꾸기',
    description: '메인 화면의 "설정"에서 진짜 사진처럼 보여주는 현미경 모드와, 귀여운 캐릭터로 보여주는 캐릭터 모드 중 골라 쓸 수 있어요.',
  },
];

/**
 * 앱 사용법을 간단히 안내하는 도움말 화면. HomeScreen의 [도움말] 버튼에서 진입한다.
 * 보건교사용 히든 버튼처럼 의도적으로 숨겨둔 기능은 여기서 안내하지 않는다.
 */
export const HelpScreen = ({ onBack }: HelpScreenProps) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color="#263238" />
        <Text style={styles.backButtonText}>뒤로가기</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>도움말</Text>
        <Text style={styles.subtitle}>손 세균 스캐너는 이렇게 써요</Text>

        <View style={styles.itemList}>
          {HELP_ITEMS.map((item) => (
            <View key={item.title} style={styles.itemCard}>
              <View style={[styles.itemIconCircle, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 56,
    marginLeft: 16,
    paddingVertical: 8,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
    marginLeft: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#78909C',
    marginBottom: 20,
  },
  itemList: {
    gap: 14,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextWrap: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  itemDescription: {
    fontSize: 13,
    color: '#607D8B',
    lineHeight: 19,
  },
});
