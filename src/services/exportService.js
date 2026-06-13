import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import T from '../i18n/translations';

export async function exportAllData(clients, documents, company) {
  const data = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    clients,
    documents,
    company,
  };

  const json = JSON.stringify(data, null, 2);
  const fileName = `invoice-creator-backup-${Date.now()}.json`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { success: false, message: T['export.unavailable'].fr };
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: T['export.title'].fr,
  });

  return { success: true, fileName };
}
