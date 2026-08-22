import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { GermDisplayMode } from '../types';

interface SettingsScreenProps {
  germDisplayMode: GermDisplayMode;
  onChangeGermDisplayMode: (mode: GermDisplayMode) => void;
  onBack: () => void;
}

interface ModeOption {
  mode: GermDisplayMode;
  titleKey: string;
  descriptionKey: string;
  iconBg: string;
  iconColor: string;
  renderIcon: (color: string) => React.ReactNode;
}

// 사실적인 세균 사진을 무서워하는 아이들을 위해 캐릭터(벡터 도형) 모드를 따로 둔다
const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'MICROSCOPE',
    titleKey: 'settings.microscopeTitle',
    descriptionKey: 'settings.microscopeDescription',
    iconBg: '#E1F5FE',
    iconColor: '#0288D1',
    renderIcon: (color) => <MaterialCommunityIcons name="microscope" size={28} color={color} />,
  },
  {
    mode: 'CHARACTER',
    titleKey: 'settings.characterTitle',
    descriptionKey: 'settings.characterDescription',
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.backButton, { marginTop: insets.top + 24, marginLeft: insets.left + 16 }]}
        onPress={onBack}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color="#263238" />
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.sectionLabel}>{t('settings.sectionLabel')}</Text>

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
                  <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
                  <Text style={styles.optionDescription}>{t(option.descriptionKey)}</Text>
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
