import { 
    Account, DashboardItem, SQLFile, TopQuery, OptimizationOpportunity, Warehouse, User, Widget, 
    SimilarQuery, QueryListItem, QueryStatus, QueryType, QuerySeverity, StorageBreakdownItem, 
    TopStorageConsumer, StorageGrowthPoint, UnusedTable, StorageActivityLogItem, StorageByTeamItem, 
    DuplicateDataPattern, StorageOptimizationOpportunity, DataAgeDistributionItem, StorageTierItem, 
    TieringOpportunityItem, TierForecastPoint, AnomalyAlertItem, SavingsProjection, Database, 
    DatabaseTable, StorageByTypeItem, AssignedQuery, PullRequest, Notification, ActivityLog, 
    SQLVersion, Recommendation, CollaborationEntry, Application, CortexModel,
    ResourceType, SeverityImpact, RecommendationStatus
} from '../types';

export const connectionsData: Account[] = [
    { id: 'acc-1', name: 'Finance Prod', identifier: 'acme.us-east-1', role: 'ACCOUNTADMIN', status: 'Connected', lastSynced: '2 mins ago', cost: 12500, tokens: 98000, warehousesCount: 12, usersCount: 8, storageGB: 45000, queriesCount: '12K', tablesCount: 120 },
    { id: 'acc-2', name: 'Account B', identifier: 'acme.us-east-2', role: 'SYSADMIN', status: 'Connected', lastSynced: '5 mins ago', cost: 8200, tokens: 85000, warehousesCount: 6, usersCount: 12, storageGB: 12400, queriesCount: '8K', tablesCount: 85 },
    { id: 'acc-3', name: 'Account C', identifier: 'acme.eu-west-1', role: 'SYSADMIN', status: 'Connected', lastSynced: '10 mins ago', cost: 7100, tokens: 68000, warehousesCount: 4, usersCount: 5, storageGB: 8200, queriesCount: '6K', tablesCount: 45 },
];

export const usersData: User[] = [
    { id: 'u-1', name: 'FinOps Admin', email: 'finops@mail.com', role: 'FinOps', status: 'Active', dateAdded: '2023-01-01', cost: 1200, tokens: 5000, organization: 'Anavsan Global' },
    { id: 'u-2', name: 'Alex Johnson', email: 'dataengineer@mail.com', role: 'DataEngineer', status: 'Active', dateAdded: '2024-01-15', cost: 850, tokens: 4200, organization: 'Anavsan Global' }
];

export const demoUsers: Record<string, User> = {
    'finops@mail.com': usersData[0],
    'dataengineer@mail.com': usersData[1]
};

export const notificationsData: Notification[] = [
    {
        id: 'n-fin-1',
        insightTypeId: 'COST_SPIKE',
        insightTopic: 'COST_SPIKE',
        message: 'Critical credit spike detected in Finance Prod account. Usage up by 150% in 2 hours.',
        suggestions: 'Immediate review of COMPUTE_WH large query executions required.',
        timestamp: new Date().toISOString(),
        warehouseName: 'COMPUTE_WH',
        isRead: false,
        severity: 'Critical'
    },
    {
        id: 'n-fin-2',
        insightTypeId: 'BUDGET_WARNING',
        insightTopic: 'performance',
        message: 'Account B has reached 92% of its allocated monthly budget.',
        suggestions: 'Consider scaling down dev warehouses or increasing budget threshold.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        warehouseName: 'SYSTEM',
        isRead: false,
        severity: 'Warning'
    },
    {
        id: 'n-eng-1',
        insightTypeId: 'QUERY_FAILURE',
        insightTopic: 'query',
        message: 'Failed Production ETL Task: UPSERT into FACT_SALES_DAILY.',
        suggestions: 'SQL error detected: Numeric value out of range for column "AMOUNT".',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        warehouseName: 'ETL_WH',
        queryId: 'q-9482104',
        isRead: false,
        severity: 'Critical'
    },
    {
        id: 'n-eng-2',
        insightTypeId: 'SLOW_QUERY',
        insightTopic: 'performance',
        message: 'New slow query pattern detected on CUSTOMER_DIM table joins.',
        suggestions: 'Analyze partition pruning performance for the last 48 hours.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        warehouseName: 'ANALYTICS_WH',
        queryId: 'q-9482112',
        isRead: false,
        severity: 'Warning'
    }
];

export const cortexModelsData: CortexModel[] = [
    { id: 'm-1', name: 'llama3-70b', inputTokens: '450K', outputTokens: '400K', tokens: '850K', credits: 1.2, insightCount: 5 },
    { id: 'm-2', name: 'mistral-large', inputTokens: '720K', outputTokens: '480K', tokens: '1.2M', credits: 1.9, insightCount: 2 },
];

export const workloadsData = [
    { id: 'wl-1', account: 'Finance Prod', workloads: 18, credits: 61400, queryCount: 88200, avgRuntime: '4.6s', idleTime: '17%' },
];

export const servicesData = [
    { id: 'svc-1', type: 'SEARCH_OPTIMIZATION', account: 'Finance Prod', credits: 1230, count: 6, queryCount: 18200, trend: '↑ 12%' },
];

export const queryListData: QueryListItem[] = [
    { id: 'q-9482101', status: 'Success', costUSD: 1.20, costTokens: 0.5, costCredits: 0.5, duration: '00:00:15', warehouse: 'COMPUTE_WH', estSavingsUSD: 0.10, estSavingsPercent: 8, queryText: 'SELECT count(*) FROM raw_events;', timestamp: '2023-11-20T09:00:00Z', type: ['SELECT'], user: 'jane_doe', bytesScanned: 1500000, bytesWritten: 0, severity: 'Low' },
    { id: 'q-9482102', status: 'Success', costUSD: 1.20, costTokens: 0.5, costCredits: 0.5, duration: '00:00:14', warehouse: 'COMPUTE_WH', estSavingsUSD: 0.10, estSavingsPercent: 8, queryText: 'SELECT count(*) FROM raw_events;', timestamp: '2023-11-20T10:05:00Z', type: ['SELECT'], user: 'mike_de', bytesScanned: 1500000, bytesWritten: 0, severity: 'Low' },
    { id: 'q-9482103', status: 'Success', costUSD: 12.50, costTokens: 4.5, costCredits: 4.5, duration: '00:02:30', warehouse: 'COMPUTE_WH', estSavingsUSD: 3.50, estSavingsPercent: 28, queryText: 'SELECT * FROM FACT_SALES WHERE EVENT_DATE >= "2023-01-01";', timestamp: '2023-11-20T10:00:00Z', type: ['SELECT'], user: 'jane_doe', bytesScanned: 450000000, bytesWritten: 0, severity: 'High' },
    { id: 'q-9482104', status: 'Failed', costUSD: 0.10, costTokens: 0.05, costCredits: 0.05, duration: '00:00:02', warehouse: 'ETL_WH', estSavingsUSD: 0, estSavingsPercent: 0, queryText: 'INSERT INTO FACT_SALES_DAILY (ID, AMOUNT) VALUES (99, "ERR");', timestamp: '2023-11-20T10:15:00Z', type: ['INSERT'], user: 'system_etl', bytesScanned: 0, bytesWritten: 0, severity: 'Critical' },
    { id: 'q-9482105', status: 'Success', costUSD: 12.50, costTokens: 4.5, costCredits: 4.5, duration: '00:02:25', warehouse: 'COMPUTE_WH', estSavingsUSD: 3.50, estSavingsPercent: 28, queryText: 'SELECT * FROM FACT_SALES WHERE EVENT_DATE >= "2023-01-01";', timestamp: '2023-11-20T11:00:00Z', type: ['SELECT'], user: 'mike_de', bytesScanned: 450000000, bytesWritten: 0, severity: 'High' },
    { id: 'q-9482106', status: 'Success', costUSD: 8.20, costTokens: 3.1, costCredits: 3.1, duration: '00:01:45', warehouse: 'ANALYTICS_WH', estSavingsUSD: 1.20, estSavingsPercent: 15, queryText: 'SELECT customer_id, sum(total) FROM orders GROUP BY 1 ORDER BY 2 DESC LIMIT 100;', timestamp: '2023-11-20T12:00:00Z', type: ['SELECT', 'Aggregation'], user: 'analyst_pro', bytesScanned: 85000000, bytesWritten: 0, severity: 'Medium' },
    { id: 'q-9482107', status: 'Success', costUSD: 8.20, costTokens: 3.1, costCredits: 3.1, duration: '00:01:40', warehouse: 'ANALYTICS_WH', estSavingsUSD: 1.20, estSavingsPercent: 15, queryText: 'SELECT customer_id, sum(total) FROM orders GROUP BY 1 ORDER BY 2 DESC LIMIT 100;', timestamp: '2023-11-20T13:00:00Z', type: ['SELECT', 'Aggregation'], user: 'analyst_pro', bytesScanned: 85000000, bytesWritten: 0, severity: 'Medium' },
    { id: 'q-9482108', status: 'Success', costUSD: 2.50, costTokens: 1.1, costCredits: 1.1, duration: '00:00:30', warehouse: 'COMPUTE_WH', estSavingsUSD: 0.50, estSavingsPercent: 20, queryText: 'UPDATE users SET last_login = current_timestamp() WHERE id = 12345;', timestamp: '2023-11-20T13:15:00Z', type: ['UPDATE'], user: 'app_service', bytesScanned: 12000, bytesWritten: 12000, severity: 'Low' },
    { id: 'q-9482109', status: 'Success', costUSD: 2.50, costTokens: 1.1, costCredits: 1.1, duration: '00:00:29', warehouse: 'COMPUTE_WH', estSavingsUSD: 0.50, estSavingsPercent: 20, queryText: 'UPDATE users SET last_login = current_timestamp() WHERE id = 12345;', timestamp: '2023-11-20T14:15:00Z', type: ['UPDATE'], user: 'app_service', bytesScanned: 12000, bytesWritten: 12000, severity: 'Low' },
    { id: 'q-9482110', status: 'Success', costUSD: 45.00, costTokens: 18.0, costCredits: 18.0, duration: '00:08:45', warehouse: 'LOAD_WH', estSavingsUSD: 15.00, estSavingsPercent: 33, queryText: 'COPY INTO @my_s3_stage FROM (SELECT * FROM RAW_LOGS) FILE_FORMAT = (TYPE = CSV);', timestamp: '2023-11-20T02:00:00Z', type: ['SELECT'], user: 'system_etl', bytesScanned: 8900000000, bytesWritten: 8900000000, severity: 'High' },
    { id: 'q-9482111', status: 'Success', costUSD: 3.50, costTokens: 1.5, costCredits: 1.5, duration: '00:00:45', warehouse: 'TRANSFORM_WH', estSavingsUSD: 0.40, estSavingsPercent: 12, queryText: 'DELETE FROM temporary_staging_table WHERE created_at < current_date() - 7;', timestamp: '2023-11-20T03:00:00Z', type: ['DELETE'], user: 'system_etl', bytesScanned: 50000000, bytesWritten: 50000000, severity: 'Medium' },
    { id: 'q-9482112', status: 'Success', costUSD: 15.20, costTokens: 5.8, costCredits: 5.8, duration: '00:04:12', warehouse: 'ANALYTICS_WH', estSavingsUSD: 4.50, estSavingsPercent: 30, queryText: 'SELECT t1.name, t2.total FROM customers t1 JOIN orders t2 ON t1.id = t2.customer_id WHERE t1.region = "NORTH_AMERICA";', timestamp: '2023-11-20T04:00:00Z', type: ['SELECT', 'JOIN'], user: 'analyst_pro', bytesScanned: 1200000000, bytesWritten: 0, severity: 'High' },
    { id: 'q-9482113', status: 'Success', costUSD: 15.10, costTokens: 5.7, costCredits: 5.7, duration: '00:04:05', warehouse: 'ANALYTICS_WH', estSavingsUSD: 4.40, estSavingsPercent: 29, queryText: 'SELECT t1.name, t2.total FROM customers t1 JOIN orders t2 ON t1.id = t2.customer_id WHERE t1.region = "SOUTH_AMERICA";', timestamp: '2023-11-20T05:00:00Z', type: ['SELECT', 'JOIN'], user: 'analyst_pro', bytesScanned: 1100000000, bytesWritten: 0, severity: 'High' },
    { id: 'q-9482114', status: 'Success', costUSD: 0.50, costTokens: 0.2, costCredits: 0.2, duration: '00:00:05', warehouse: 'COMPUTE_WH', estSavingsUSD: 0, estSavingsPercent: 0, queryText: 'SHOW WAREHOUSES;', timestamp: '2023-11-20T05:30:00Z', type: ['SELECT'], user: 'admin_user', bytesScanned: 0, bytesWritten: 0, severity: 'Low' },
    { id: 'q-9482115', status: 'Success', costUSD: 0.50, costTokens: 0.2, costCredits: 0.2, duration: '00:00:04', warehouse: 'COMPUTE_WH', estSavingsUSD: 0, estSavingsPercent: 0, queryText: 'SHOW WAREHOUSES;', timestamp: '2023-11-20T06:30:00Z', type: ['SELECT'], user: 'admin_user', bytesScanned: 0, bytesWritten: 0, severity: 'Low' },
    { id: 'q-9482116', status: 'Success', costUSD: 1.10, costTokens: 0.4, costCredits: 0.4, duration: '00:00:10', warehouse: 'COMPUTE_WH', estSavingsUSD: 0, estSavingsPercent: 0, queryText: 'USE ROLE ACCOUNTADMIN;', timestamp: '2023-11-20T07:00:00Z', type: ['SELECT'], user: 'admin_user', bytesScanned: 0, bytesWritten: 0, severity: 'Low' },
    { id: 'q-9482117', status: 'Success', costUSD: 12.00, costTokens: 4.8, costCredits: 4.8, duration: '00:02:50', warehouse: 'ETL_WH', estSavingsUSD: 2.10, estSavingsPercent: 18, queryText: 'INSERT INTO STAGING_TABLE SELECT * FROM RAW_STREAM;', timestamp: '2023-11-20T08:00:00Z', type: ['INSERT', 'SELECT'], user: 'system_etl', bytesScanned: 950000000, bytesWritten: 950000000, severity: 'Medium' },
    { id: 'q-9482118', status: 'Success', costUSD: 11.90, costTokens: 4.7, costCredits: 4.7, duration: '00:02:45', warehouse: 'ETL_WH', estSavingsUSD: 2.05, estSavingsPercent: 17, queryText: 'INSERT INTO STAGING_TABLE SELECT * FROM RAW_STREAM;', timestamp: '2023-11-20T09:00:00Z', type: ['INSERT', 'SELECT'], user: 'system_etl', bytesScanned: 940000000, bytesWritten: 940000000, severity: 'Medium' },
    { id: 'q-9482119', status: 'Success', costUSD: 5.50, costTokens: 2.2, costCredits: 2.2, duration: '00:01:10', warehouse: 'ANALYTICS_WH', estSavingsUSD: 0.80, estSavingsPercent: 15, queryText: 'SELECT region, count(*) FROM customers GROUP BY 1;', timestamp: '2023-11-20T10:00:00Z', type: ['SELECT', 'Aggregation'], user: 'analyst_pro', bytesScanned: 45000000, bytesWritten: 0, severity: 'Medium' },
    { id: 'q-9482120', status: 'Success', costUSD: 5.40, costTokens: 2.1, costCredits: 2.1, duration: '00:01:05', warehouse: 'ANALYTICS_WH', estSavingsUSD: 0.75, estSavingsPercent: 14, queryText: 'SELECT region, count(*) FROM customers GROUP BY 1;', timestamp: '2023-11-20T11:00:00Z', type: ['SELECT', 'Aggregation'], user: 'analyst_pro', bytesScanned: 44000000, bytesWritten: 0, severity: 'Medium' },
];

export const similarQueriesData: SimilarQuery[] = [
    { id: 'sim-1', name: 'SELECT * FROM FACT_SALES WHERE...', similarity: 98, executionTime: 150000, warehouse: 'COMPUTE_WH', cost: 12.50, tokens: 4.5, pattern: 'Scan-heavy' },
    { id: 'sim-2', name: 'SELECT customer_id, sum(total)...', similarity: 95, executionTime: 105000, warehouse: 'ANALYTICS_WH', cost: 8.20, tokens: 3.1, pattern: 'Aggregation-heavy' },
    { id: 'sim-3', name: 'SELECT t1.name, t2.total FROM...', similarity: 92, executionTime: 252000, warehouse: 'ANALYTICS_WH', cost: 15.20, tokens: 5.8, pattern: 'Join-heavy' },
];

export const warehousesData: Warehouse[] = [
    { id: 'wh-1', name: 'COMPUTE_WH', size: 'Medium', avgUtilization: 45, peakUtilization: 85, status: 'Active', cost: 4500, tokens: 1800, credits: 1800, queriesExecuted: 1250, lastActive: '2 mins ago', health: 'Optimized' },
    { id: 'wh-2', name: 'ETL_WH', size: 'Large', avgUtilization: 65, peakUtilization: 95, status: 'Running', cost: 9500, tokens: 3800, credits: 3800, queriesExecuted: 2800, lastActive: 'Just now', health: 'Optimized' },
    { id: 'wh-3', name: 'ANALYTICS_WH', size: 'Small', avgUtilization: 25, peakUtilization: 55, status: 'Idle', cost: 2200, tokens: 850, credits: 850, queriesExecuted: 450, lastActive: '15 mins ago', health: 'Under-utilized' },
    { id: 'wh-4', name: 'LOAD_WH', size: 'X-Small', avgUtilization: 85, peakUtilization: 100, status: 'Active', cost: 1500, tokens: 600, credits: 600, queriesExecuted: 3200, lastActive: '2 mins ago', health: 'Over-provisioned' },
];

export const databasesData: Database[] = [
    { id: 'db-1', name: 'PROD_DB', sizeGB: 12500, cost: 3200, credits: 1250, tableCount: 45, userCount: 12, users: [] },
    { id: 'db-2', name: 'STAGING_DB', sizeGB: 8400, cost: 1800, credits: 700, tableCount: 22, userCount: 5, users: [] },
    { id: 'db-3', name: 'ANALYTICS_DB', sizeGB: 15600, cost: 4100, credits: 1600, tableCount: 120, userCount: 25, users: [] },
];

export const spendTrendsData = (function() {
    const data = [];
    const now = new Date('2023-11-20');
    for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const warehouse = 1100 + Math.random() * 400;
        const storage = 150 + Math.random() * 50;
        const cloud = 50 + Math.random() * 30;
        data.push({
            date: day,
            warehouse: Math.round(warehouse),
            storage: Math.round(warehouse * 0.15),
            cloud: Math.round(warehouse * 0.05),
            total: Math.round(warehouse * 1.2)
        });
    }
    return data;
})();

export const storageGrowthData: StorageGrowthPoint[] = (function() {
    const data = [];
    const now = new Date('2023-11-20');
    for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        data.push({
            date: day,
            'Active Storage (GB)': 42000 + (30 - i) * 100 + Math.random() * 200,
            'Time Travel (GB)': 1200 + Math.random() * 100
        });
    }
    return data;
})();

export const recommendationsData: Recommendation[] = (function() {
    const recs: Recommendation[] = [];
    const resourceTypes: ResourceType[] = ['Query', 'Warehouse', 'Storage', 'Database', 'User', 'Application', 'Account'];
    const accounts = ['Finance Prod', 'Account B', 'Account C'];
    const insightTypes = ['Scan Optimization', 'Rightsizing', 'Cleanup', 'Security'];
    const warehouses = ['COMPUTE_WH', 'ETL_WH', 'ANALYTICS_WH', 'LOAD_WH'];

    // 1. Specific High-Value Recommendations for COMPUTE_WH (fixes empty context state)
    recs.push({
        id: 'REC-SPEC-001',
        resourceType: 'Warehouse',
        affectedResource: 'COMPUTE_WH',
        severity: 'High',
        insightType: 'Rightsizing',
        message: 'COMPUTE_WH is frequently reaching 90%+ peak utilization. Performance is constrained during peak ETL hours.',
        detailedExplanation: 'Historical analysis over the last 14 days indicates that COMPUTE_WH is undersized for the current query volume. This results in significant queuing and degraded end-user experience during morning reporting windows.',
        timestamp: new Date().toISOString(),
        accountName: 'Finance Prod',
        status: 'New',
        warehouseName: 'COMPUTE_WH',
        suggestion: 'Upgrade warehouse size to LARGE during the 09:00 - 11:00 UTC window to eliminate query queuing.',
        metrics: { utilization: 92, creditsBefore: 1800, estimatedSavings: 0 }
    });

    recs.push({
        id: 'REC-SPEC-002',
        resourceType: 'Query',
        affectedResource: 'q-9482103',
        severity: 'High Cost',
        insightType: 'Scan Optimization',
        message: 'Query q-9482103 on COMPUTE_WH is performing full table scans on FACT_SALES.',
        detailedExplanation: 'This query scans 450GB of data per execution. Because FACT_SALES is not clustered by EVENT_DATE, the query engine cannot prune partitions, leading to 10x higher costs than necessary.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        accountName: 'Finance Prod',
        status: 'New',
        warehouseName: 'COMPUTE_WH',
        userName: 'jane_doe',
        suggestion: 'Apply a explicit filter on EVENT_DATE or implement a CLUSTERING KEY on (EVENT_DATE) for FACT_SALES.',
        metrics: { creditsBefore: 4.5, estimatedSavings: 3.6, queryText: 'SELECT * FROM FACT_SALES WHERE EVENT_DATE >= "2023-01-01";' }
    });

    recs.push({
        id: 'REC-SPEC-003',
        resourceType: 'Warehouse',
        affectedResource: 'COMPUTE_WH',
        severity: 'Cost Saving',
        insightType: 'Cleanup',
        message: 'COMPUTE_WH idle time is 22%. Auto-suspend is currently set to 600 seconds.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        accountName: 'Finance Prod',
        status: 'In Progress',
        warehouseName: 'COMPUTE_WH',
        suggestion: 'Reduce AUTO_SUSPEND to 60 seconds. This is projected to save approximately 15% in monthly compute credits.',
        metrics: { creditsBefore: 1800, estimatedSavings: 270, suspensionTime: '600s' }
    });

    // 2. Recommendations for other warehouses to ensure they also have context
    recs.push({
        id: 'REC-SPEC-004',
        resourceType: 'Warehouse',
        affectedResource: 'LOAD_WH',
        severity: 'High',
        insightType: 'Rightsizing',
        message: 'LOAD_WH (X-Small) is consistently at 100% peak utilization.',
        timestamp: new Date().toISOString(),
        accountName: 'Finance Prod',
        status: 'New',
        warehouseName: 'LOAD_WH',
        suggestion: 'Consider scaling to SMALL to reduce ingestion latency for high-frequency streams.',
        metrics: { utilization: 100, creditsBefore: 600 }
    });

    // 3. Generate 46 generic recommendations with improved name matching
    for (let i = 1; i <= 46; i++) {
        const type = resourceTypes[i % resourceTypes.length];
        const warehouse = warehouses[i % warehouses.length];
        const account = accounts[i % accounts.length];
        const severity = i % 5 === 0 ? 'High' : i % 3 === 0 ? 'Cost Saving' : 'Medium';
        
        recs.push({
            id: `REC-${String(i).padStart(3, '0')}`,
            resourceType: type,
            affectedResource: type === 'Warehouse' ? warehouse : type === 'Query' ? `q-9482${100+i}` : `${type}_${i}`,
            severity: severity as SeverityImpact,
            insightType: insightTypes[i % insightTypes.length],
            message: `Identified potential ${insightTypes[i % insightTypes.length].toLowerCase()} for ${type} in ${account}.`,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            accountName: account,
            status: i % 4 === 0 ? 'Resolved' : 'New',
            warehouseName: warehouse,
            userName: i % 2 === 0 ? 'jane_doe' : 'mike_de'
        });
    }
    return recs;
})();

export const storageByTypeData: StorageByTypeItem[] = [
    { type: 'Active', storageGB: 45000, cost: 2500, color: '#6932D5' },
    { type: 'Time Travel', storageGB: 1500, cost: 150, color: '#A78BFA' },
    { type: 'Fail-safe', storageGB: 800, cost: 80, color: '#C4B5FD' },
];

export const accountCostBreakdown = [
    { name: 'Compute', cost: 10000, tokens: 80000, percentage: 80, color: '#6932D5' },
    { name: 'Storage', cost: 2500, tokens: 18000, percentage: 20, color: '#A78BFA' },
];

export const topQueriesData: TopQuery[] = [
    { id: 'q-1', queryText: 'SELECT * FROM FACT_SALES WHERE EVENT_DATE >= "2023-01-01"', tokens: 4.5, cost: 12.50, user: 'jane_doe', duration: '02:30' },
];

export const storageSummaryData = { totalStorageGB: 45000, totalSpend: 2500, totalCredits: 2100 };
export const totalStorageMetrics = { totalSizeGB: 45000, totalCost: 2500 };
export const storageGrowthForecast = { nextMonthSizeGB: 48000, nextMonthCost: 2700 };
export const topStorageConsumersData: TopStorageConsumer[] = [];
export const databaseTablesData: DatabaseTable[] = [
    { id: 't-1', name: 'FACT_SALES', sizeGB: 1200, rows: 15000000, monthlyGrowth: 4.5 },
];
export const dataAgeDistributionData: DataAgeDistributionItem[] = [];
export const storageByTierData = {
    current: [{ name: 'Hot', value: 80, color: '#DC2626' }],
    recommended: [{ name: 'Hot', value: 60, color: '#DC2626' }]
};
export const tieringOpportunitiesData: TieringOpportunityItem[] = [];
export const policyComplianceData = { compliancePercentage: 85 };
export const costSpendForecastData = [];
export const costForecastByTierData = [];
export const costAnomalyAlertsData: AnomalyAlertItem[] = [];
export const costSavingsProjectionData = { message: 'AI projects 15% savings', savingsPercentage: 15 };
export const availableWidgetsData: Omit<Widget, 'id' | 'dataSource'>[] = [
    { widgetId: 'total-spend', title: 'Total Spend', type: 'StatCard', description: 'Overall spend across accounts', layout: { w: 1, h: 1 }, tags: ['Cost'] },
    { widgetId: 'spend-breakdown', title: 'Spend Breakdown', type: 'DonutChart', description: 'Percentage of cost by resource', layout: { w: 1, h: 1 }, tags: ['Cost'] },
];
export const overviewMetrics = {
    cost: { current: 48500 },
    tokens: { current: 380000 }
};
export const costBreakdownData = [
    { name: 'Compute', cost: 40000, tokens: 320000, percentage: 82, color: '#6932D5' },
    { name: 'Storage', cost: 8500, tokens: 60000, percentage: 18, color: '#A78BFA' },
];
export const accountSpend = {
    cost: { monthly: 12500, forecasted: 15000 },
    tokens: { monthly: 98000, forecasted: 110000 }
};

export const sqlFilesData: SQLFile[] = [
    {
        id: 'file-1',
        name: 'monthly_spend_report.sql',
        accountId: 'acc-1',
        accountName: 'Finance Prod',
        createdDate: '2023-11-01T10:00:00Z',
        versions: [
            {
                id: 'v1-1',
                version: 1,
                date: '2023-11-01T10:00:00Z',
                description: 'Initial query for monthly spend.',
                user: 'FinOps Admin',
                tag: 'General',
                sql: 'SELECT * FROM spend_table;'
            }
        ]
    }
];

export const dashboardsData: DashboardItem[] = [
    {
        id: 'dash-1',
        title: 'Executive Overview',
        createdOn: '2023-10-15',
        description: 'High-level metrics for executive review.',
        widgets: [],
    }
];

export const assignedQueriesData: AssignedQuery[] = [
    {
        id: 'aq-1',
        queryId: 'q-9482103',
        queryText: 'SELECT * FROM FACT_SALES WHERE EVENT_DATE >= "2023-01-01";',
        assignedBy: 'FinOps Admin',
        assignedTo: 'Alex Johnson',
        priority: 'High',
        status: 'Assigned',
        message: 'High credit consumption detected. Please optimize.',
        assignedOn: '2023-11-19T14:00:00Z',
        cost: 12.50,
        tokens: 4.5,
        credits: 4.5,
        warehouse: 'COMPUTE_WH',
        history: []
    }
];

export const pullRequestsData: PullRequest[] = [
    {
        id: 1,
        title: 'Optimize Sales Query',
        author: 'Alex Johnson',
        status: 'Open',
        sourceBranch: 'feature/optimize-sales',
        targetBranch: 'main',
        createdAt: '2023-11-20T09:00:00Z',
        performanceMetrics: [],
        automatedChecks: [],
        reviewers: [],
        oldCode: 'SELECT * FROM FACT_SALES;',
        newCode: 'SELECT ID, AMOUNT FROM FACT_SALES WHERE EVENT_DATE > CURRENT_DATE - 30;'
    }
];

export const activityLogsData: ActivityLog[] = [
    {
        id: 'log-1',
        user: 'FinOps Admin',
        action: 'Viewed Account Overview',
        timestamp: '2023-11-20T10:00:00Z',
        status: 'Success'
    }
];

export const accountApplicationsData: Application[] = [
    {
        id: 'app-1',
        name: 'Sales Dashboard',
        description: 'Internal sales reporting application.',
        totalCredits: 1200,
        warehouseCredits: 800,
        storageCredits: 300,
        otherCredits: 100,
        queryCount: 4500,
        lastActive: '2023-11-20T11:00:00Z',
        insightCount: 3
    }
];

export const usageCreditsData = spendTrendsData;
export const resourceSnapshotData = [
    { name: 'Compute', value: 44250 },
    { name: 'Storage', value: 2100 },
    { name: 'Services', value: 6800 },
];