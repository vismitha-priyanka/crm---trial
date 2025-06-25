import psycopg2
from faker import Faker
import random

fake = Faker()
conn = psycopg2.connect(dbname="crm", user="postgres", password="vismitha", host="localhost")
cur = conn.cursor()

print("Starting to insert 400,000 records (100,000 per table)...")

# Insert into activity_stats (100,000 rows)
print("Inserting 100,000 records into activity_stats...")
for i in range(100000):
    if i % 10000 == 0:
        print(f"Progress: {i} records inserted into activity_stats")
    cur.execute(
        "INSERT INTO activity_stats (day, calls, emails, meetings) VALUES (%s, %s, %s, %s)",
        (fake.date_between(start_date='-2y', end_date='today'), random.randint(0, 20), random.randint(0, 20), random.randint(0, 10))
    )

# Insert into deal_insights (100,000 rows)
print("Inserting 100,000 records into deal_insights...")
stages = ['Prospecting', 'Negotiation', 'Closed Won', 'Closed Lost']
for i in range(100000):
    if i % 10000 == 0:
        print(f"Progress: {i} records inserted into deal_insights")
    cur.execute(
        "INSERT INTO deal_insights (stage, count, total_value) VALUES (%s, %s, %s)",
        (random.choice(stages), random.randint(1, 100), round(random.uniform(1000, 100000), 2))
    )

# Insert into lead_analytics (100,000 rows)
print("Inserting 100,000 records into lead_analytics...")
sources = ['Website', 'Referral', 'Event', 'Social Media', 'Email Campaign']
for i in range(100000):
    if i % 10000 == 0:
        print(f"Progress: {i} records inserted into lead_analytics")
    cur.execute(
        "INSERT INTO lead_analytics (source, count, conversion_rate) VALUES (%s, %s, %s)",
        (random.choice(sources), random.randint(1, 100), round(random.uniform(0, 100), 2))
    )

# Insert into overview_metrics (100,000 rows)
print("Inserting 100,000 records into overview_metrics...")
metrics = ['Total Revenue', 'Open Deals', 'Closed Deals', 'New Leads', 'Active Users']
for i in range(100000):
    if i % 10000 == 0:
        print(f"Progress: {i} records inserted into overview_metrics")
    cur.execute(
        "INSERT INTO overview_metrics (title, value) VALUES (%s, %s)",
        (random.choice(metrics), str(random.randint(1, 1000000)))
    )

conn.commit()
cur.close()
conn.close()
print("Done inserting 400,000 records (100,000 per table)!")