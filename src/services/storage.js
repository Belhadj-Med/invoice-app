import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_COMPANY } from '../constants/document';

const KEYS = {
  CLIENTS: '@invoice_creator_clients',
  DOCUMENTS: '@invoice_creator_documents',
  COMPANY: '@invoice_creator_company',
  COUNTERS: '@invoice_creator_counters',
  ONBOARDING: '@invoice_creator_onboarded',
};

async function read(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`⚠️ Failed to read ${key} from storage:`, error);
    return fallback;
  }
}

async function write(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ Failed to write ${key} to storage:`, error);
    throw error;
  }
}

export async function loadAppData() {
  try {
    const [clients, documents, company, counters] = await Promise.all([
      read(KEYS.CLIENTS, []),
      read(KEYS.DOCUMENTS, []),
      read(KEYS.COMPANY, DEFAULT_COMPANY),
      read(KEYS.COUNTERS, {}),
    ]);
    
    // Log warning if critical data is missing
    if (!clients || clients.length === 0) {
      console.warn('⚠️ No clients found in storage');
    }
    if (!documents || documents.length === 0) {
      console.warn('⚠️ No documents found in storage');
    }
    
    return { 
      clients: clients || [], 
      documents: documents || [], 
      company: company || DEFAULT_COMPANY, 
      counters: counters || {} 
    };
  } catch (error) {
    console.error('❌ Critical error loading app data:', error);
    throw new Error('Failed to load app data. Please restart the app.');
  }
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

export async function isOnboardingComplete() {
  const value = await read(KEYS.ONBOARDING, false);
  return value === true;
}

export async function saveOnboardingComplete() {
  await write(KEYS.ONBOARDING, true);
}
