import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { GermDisplayMode } from '../types';

interface SettingsScreenProps {
  germDisplayMode: GermDisplayMode;
  onChangeGermDisplayMode: (mode: GermDisplayMode) => void;
  onBack: () => void;
}

interface ModeOption {
  mode: GermDisplayMode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  renderIcon: (color: string) => React.ReactNode;
}

// 03_Germ_and_Clean_Rendering.md의 세균 컴포넌트 이원화 구조(실제 사진 vs
// 벡터 도형)를 그대로 두 "모드"로 승격한 것 — 사실적인 세균 사진을 무서워하는
// 아이들을 위해 귀여운 캐릭터 도형만 보여주는 모드를 따로 두라는 피드백에 따름.
const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'MICROSCOPE',
    title: '현미경 모드',
    description: '실제 세균 사진으로 사실적으로 보여줘요. 최대 10배까지 확대할 수 있어요.',
    iconBg: '#E1F5FE',
    iconColor: '#0288D1',
    renderIcon: (color) => <MaterialCommunityIcons name="microscope" size={28} color={color} />,
  },
  {
    mode: 'CHARACTER',
    title: '캐릭터 모드',
    description: '귀여운 캐릭터 세균으로 보여줘요. 최대 4배까지 확대할 수 있어요.',
    iconBg: '#E8F5E9',
    iconColor: '#43A047',
    renderIcon: (color) => <Ionicons name="happy-outline" size={28} color={color} />,
  },
];

export const SettingsScreen = ({
  germDisplayMode,
  onChangeGermDisplayMode,
  onBack,
}: SettingsScreenProps) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color="#263238" />
        <Text style={styles.backButtonText}>뒤로가기</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.sectionLabel}>균 표시 방식</Text>

        <View style={styles.optionList}>
          {MODE_OPTIONS.map((option) => {
            const isSelected = germDisplayMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => onChangeGermDisplayMode(option.mode)}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: option.iconBg }]}>
                  {option.renderIcon(option.iconColor)}
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#4FC3F7" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
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
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78909C',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  optionList: {
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#4FC3F7',
  },
  optionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  optionDescription: {
    fontSize: 13,
    color: '#607D8B',
    lineHeight: 18,
  },
});
