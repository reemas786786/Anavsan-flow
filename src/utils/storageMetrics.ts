
import { databaseTablesData, unusedTablesData } from '../data/dummyData';

export const calculateStorageMetrics = () => {
  const tables = databaseTablesData;
  const unusedTables = unusedTablesData;

  const databases = new Set(tables.map(t => t.databaseName));
  const schemas = new Set(tables.map(t => `${t.databaseName}.${t.schemaName}`));

  const totalSizeGB = tables.reduce((sum, t) => sum + t.totalSizeGB, 0);
  const activeSizeGB = tables.reduce((sum, t) => sum + t.activeSizeGB, 0);
  const timeTravelSizeGB = tables.reduce((sum, t) => sum + t.timeTravelSizeGB, 0);
  const failSafeSizeGB = tables.reduce((sum, t) => sum + t.failSafeSizeGB, 0);
  const unusedSizeGB = unusedTables.reduce((sum, t) => sum + t.sizeGB, 0);

  return {
    databaseCount: databases.size,
    schemaCount: schemas.size,
    tableCount: tables.length,
    unusedTableCount: unusedTables.length,
    totalSizeGB,
    activeSizeGB,
    timeTravelSizeGB,
    failSafeSizeGB,
    unusedSizeGB,
  };
};

export const formatStorageSize = (sizeGB: number): string => {
  if (sizeGB >= 1024) {
    return `${(sizeGB / 1024).toFixed(2)} TB`;
  }
  return `${sizeGB.toFixed(2)} GB`;
};
