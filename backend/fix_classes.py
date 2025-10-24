import sqlite3

# Connect to database
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Remove classes and analytics migration history
cursor.execute("DELETE FROM django_migrations WHERE app = 'classes'")
cursor.execute("DELETE FROM django_migrations WHERE app = 'analytics'")
print("Removed classes and analytics migration history")

# Commit changes
conn.commit()
conn.close()

print("Database cleaned successfully!")
