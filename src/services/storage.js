import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COMPANY } from '../constants/document';

const KEYS = {
  CLIENTS: '@ala_clients',
  DOCUMENTS: '@ala_documents',
  COMPANY: '@ala_company',
  COUNTERS: '@ala_counters',
};

async function read(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function write(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadAppData() {
  const [clients, documents, company, counters] = await Promise.all([
    read(KEYS.CLIENTS, []),
    read(KEYS.DOCUMENTS, []),
    read(KEYS.COMPANY, DEFAULT_COMPANY),
    read(KEYS.COUNTERS, {}),
  ]);
  return { clients, documents, company, counters };
}

export async function saveClients(clients) {
  await write(KEYS.CLIENTS, clients);
}

export async function saveDocuments(documents) {
  await write(KEYS.DOCUMENTS, documents);
}

export async function saveCompany(company) {
  await write(KEYS.COMPANY, company);
}

export async function saveCounters(counters) {
  await write(KEYS.COUNTERS, counters);
}
