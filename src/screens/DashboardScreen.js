import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { STATUS } from '../constants/document';
import { fmtDateFR } from '../utils/documentUtils';
import StatPill from '../components/StatPill';

function MiniBarChart({ data, colors, styles }) {
  return (
    <View style={styles.barChart}>
      {data.map((bar) => (
        <View key={bar.month} style={styles.barCol}>
          <LinearGradient
            colors={bar.highlight
              ? ['#6effd0', colors.accent3]
              : [colors.accent2, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.barFill, { height: bar.height, opacity: bar.highlight ? 0.9 : 0.65 }]}
          />
          <Text style={[styles.barLabel, bar.highlight && { color: colors.accent3 }]}>
            {bar.month}
          </Text>
        </View>
      ))}
    </View>
  );
}

function InvoiceRow({ item, onPress, onDelete, colors, styles, calcTotals, fmtCurrency }) {
  const cfg = STATUS[item.status] || STATUS.pending;
  const iconColor = cfg.pill === 'green' ? colors.accent3 : cfg.pill === 'yellow' ? colors.warm : colors.accent2;
  const { ttc } = calcTotals(item.lineItems, item.docType);
  return (
    <TouchableOpacity style={styles.invoiceItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.invIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={cfg.icon} size={16} color={iconColor} />
      </View>
      <View style={styles.invDetails}>
        <Text style={styles.invName} numberOfLines={1}>{item.clientName}</Text>
        <Text style={styles.invMeta}>{item.docNumber} · {fmtDateFR(item.createdAt)}</Text>
      </View>
      <View style={styles.invRight}>
        <Text style={styles.invAmount}>{fmtCurrency(ttc)}</Text>
        <StatPill type={cfg.pill} label={cfg.label} />
        <TouchableOpacity onPress={() => onDelete(item)} style={{ marginTop: 6 }}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { dashboardStats, openDocumentPreview, company, startNewDocument, deleteDocument, calcTotals, fmtCurrency } = useApp();
  const { colors, shared } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const monthLabel = new Date().toLocaleDateString('fr-TN', { month: 'long', year: 'numeric' });

  const openDoc = (doc) => {
    openDocumentPreview(doc.id);
    navigation.navigate('Preview', { origin: { tab: 'Dashboard' } });
  };

  const handleDelete = (doc) => {
    Alert.alert(t('common.delete'), t('dashboard.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteDocument(doc.id) },
    ]);
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
          <Image source={company.logo ? { uri: company.logo } : require('../assets/logo.png')} style={styles.brandAvatar} />
          <View>
            <Text style={styles.greeting}>{t('dashboard.greeting')}</Text>
            <Text style={styles.brandName}>{company.name}</Text>
          </View>
        </View>
        </View>

        <LinearGradient colors={colors.heroGradient} style={styles.heroCard}>
          <Text style={styles.heroLabel}>{t('dashboard.revenue')} — {monthLabel}</Text>
          <Text style={styles.heroRevenue}>{fmtCurrency(dashboardStats.revenue)}</Text>
          <Text style={styles.heroSub}>{t('dashboard.paidThisMonth')}</Text>
          <MiniBarChart data={dashboardStats.monthlyRevenue} colors={colors} styles={styles} />
        </LinearGradient>

        <View style={styles.statsRow}>
          {[
            { value: String(dashboardStats.invoiceCount), label: t('dashboard.statDocuments'), color: colors.text },
            { value: String(dashboardStats.pendingCount), label: t('dashboard.statPending'), color: colors.warm },
            { value: String(dashboardStats.clientCount), label: t('dashboard.statClients'), color: colors.accent3 },
          ].map(({ value, label, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={[styles.statNum, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={shared.sectionLabel}>{t('dashboard.quickActions')}</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => { startNewDocument(); navigation.getParent()?.navigate('CreateModal'); }}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[colors.accent, colors.accent2]} style={styles.btnPrimary}>
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.btnPrimaryText}>{t('dashboard.newInvoice')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={[shared.btnGhost, { flex: 1 }]}
            onPress={() => navigation.navigate('Clients')}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={16} color={colors.text2} />
            <Text style={shared.btnGhostText}>{t('dashboard.clients')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={shared.sectionLabel}>{t('dashboard.recentDocs')}</Text>
        </View>
        <View style={shared.card}>
          {dashboardStats.recentDocuments.length === 0 ? (
            <Text style={[styles.emptyText, { padding: 20 }]}>{t('dashboard.empty')}</Text>
          ) : (
            dashboardStats.recentDocuments.map((item, index) => (
              <React.Fragment key={item.id}>
                <InvoiceRow
                  item={item}
                  onPress={() => openDoc(item)}
                  onDelete={() => handleDelete(item)}
                  colors={colors}
                  styles={styles}
                  calcTotals={calcTotals}
                  fmtCurrency={fmtCurrency}
                />
                {index < dashboardStats.recentDocuments.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandAvatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  brandAvatarText: { color: 'white', fontWeight: '800', fontSize: 14 },
  greeting: { fontSize: 11, color: colors.text3 },
  brandName: { fontWeight: '700', fontSize: 15, color: colors.text },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.heroBorder,
  },
  heroLabel: {
    fontSize: 10,
    color: colors.accent2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroRevenue: {
    fontWeight: '800',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSub: { fontSize: 11, color: colors.text3, marginBottom: 18 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barFill: { width: '100%', borderRadius: 5 },
  barLabel: { fontSize: 8, color: colors.text3, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statNum: { fontWeight: '800', fontSize: 18 },
  statLabel: { fontSize: 9, color: colors.text3, marginTop: 3, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 13, gap: 6 },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 12 },
  invoiceItem: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  invIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  invDetails: { flex: 1, minWidth: 0 },
  invName: { fontSize: 13, fontWeight: '600', color: colors.text },
  invMeta: { fontSize: 10, color: colors.text3, marginTop: 2 },
  invRight: { alignItems: 'flex-end', gap: 4 },
  invAmount: { fontSize: 12, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  emptyText: { color: colors.text3, textAlign: 'center', fontSize: 13 },
});
