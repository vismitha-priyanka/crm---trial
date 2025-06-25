import psycopg2

try:
    conn = psycopg2.connect(dbname="crm", user="postgres", password="vismitha", host="localhost")
    cur = conn.cursor()
    
    # Check counts for each table
    tables = ['activity_stats', 'deal_insights', 'lead_analytics', 'overview_metrics']
    
    print("Data counts in each table:")
    print("-" * 40)
    
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"{table}: {count:,} records")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}") 