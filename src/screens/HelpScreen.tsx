import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface HelpScreenProps {
  onBack: () => void;
}

interface HelpItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const HELP_ITEMS: HelpItem[] = [
  { key: 'capture', icon: 'camera-outline', iconBg: '#E1F5FE', iconColor: '#0288D1' },
  { key: 'washMode', icon: 'sparkles-outline', iconBg: '#FCE4EC', iconColor: '#D81B60' },
  { key: 'zoom', icon: 'search-outline', iconBg: '#E8F5E9', iconColor: '#43A047' },
  { key: 'retake', icon: 'refresh-outline', iconBg: '#FFF3E0', iconColor: '#F57C00' },
  { key: 'germMode', icon: 'settings-outline', iconBg: '#EDE7F6', iconColor: '#7B1FA2' },
];

/**
 * 앱 사용법을 간단히 안내하는 도움말 화면. HomeScreen의 [도움말] 버튼에서 진입한다.
 * 보건교사용 히든 버튼처럼 의도적으로 숨겨둔 기능은 여기서 안내하지 않는다.
 */
export const HelpScreen = ({ onBack }: HelpScreenProps) => {
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

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('help.title')}</Text>
        <Text style={styles.subtitle}>{t('help.subtitle')}</Text>

        <View style={styles.itemList}>
          {HELP_ITEMS.map((item) => (
            <View key={item.key} style={styles.itemCard}>
              <View style={[styles.itemIconCircle, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{t(`help.items.${item.key}.title`)}</Text>
                <Text style={styles.itemDescription}>{t(`help.items.${item.key}.description`)}</Text>
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
