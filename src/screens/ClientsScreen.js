import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

function ClientRow({ client, onSelect, styles, colors, stats }) {
  const initials = client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity style={styles.clientRow} onPress={onSelect} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: client.color + '22' }]}>
        <Text style={[styles.avatarText, { color: client.color }]}>{initials}</Text>
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName} numberOfLines={1}>{client.name}</Text>
        <Text style={styles.clientMeta} numberOfLines={1}>{client.phone || '—'}</Text>
      </View>
      <View style={styles.clientStats}>
        <Text style={styles.clientTotal}>{stats.total}</Text>
        <Text style={styles.clientInvoices}>{stats.count} doc.</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.text3} />
    </TouchableOpacity>
  );
}

export default function ClientsScreen({ navigation }) {
  const { clients, addClient, getClientDisplayStats, showToast } = useApp();
  const { colors, shared } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!newName.trim()) {
      showToast('⚠️ Le nom est requis', 'red');
      return;
    }
    const client = addClient({
      name: newName.trim(),
      phone: newPhone.trim() || '',
    });
    showToast(`✅ Client ajouté : ${client.name}`, 'green');
    setNewName('');
    setNewPhone('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={shared.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={shared.screenTitle}>Clients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <LinearGradient colors={[colors.accent, colors.accent2]} style={styles.addBtnGradient}>
            <Ionicons name="add" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.text3} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un client…"
          placeholderTextColor={colors.text3}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[shared.sectionLabel, styles.countLabel]}>
        {filtered.length} client{filtered.length !== 1 ? 's' : ''}
      </Text>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        <View style={shared.card}>
          {filtered.map((client, index) => (
            <React.Fragment key={client.id}>
              <ClientRow
                client={client}
                stats={getClientDisplayStats(client.id)}
                onSelect={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                styles={styles}
                colors={colors}
              />
              {index < filtered.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
          {filtered.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={32} color={colors.text3} />
              <Text style={styles.emptyText}>Aucun client trouvé</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau client</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.text2} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrap}>
              <Text style={shared.inputLabel}>Nom complet *</Text>
              <TextInput style={shared.inputField} value={newName} onChangeText={setNewName} placeholder="Nom du client" placeholderTextColor={colors.text3} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={shared.inputLabel}>Téléphone</Text>
              <TextInput style={shared.inputField} value={newPhone} onChangeText={setNewPhone} placeholder="Téléphone" placeholderTextColor={colors.text3} keyboardType="phone-pad" />
            </View>
            <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
              <LinearGradient colors={[colors.accent, colors.accent2]} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Ajouter le client</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  addBtn: { borderRadius: 12, overflow: 'hidden' },
  addBtnGradient: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 11 },
  countLabel: { paddingHorizontal: 16, marginBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
  clientRow: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 13 },
  clientInfo: { flex: 1, minWidth: 0 },
  clientName: { fontSize: 13, fontWeight: '600', color: colors.text },
  clientMeta: { fontSize: 10, color: colors.text3, marginTop: 2 },
  clientStats: { alignItems: 'flex-end', marginRight: 4 },
  clientTotal: { fontSize: 11, fontWeight: '700', color: colors.text },
  clientInvoices: { fontSize: 9, color: colors.text3, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 13, color: colors.text3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  inputWrap: { marginBottom: 14 },
  modalBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  modalBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});
