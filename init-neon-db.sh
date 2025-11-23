#!/bin/bash
# Initialize Supabase database with schema

set -e

echo "🗄️  Initializing Supabase Database"
echo "==================================="
echo ""
echo "Database: sabeel_db"
echo "Host: aws-1-eu-west-1.pooler.supabase.com"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ psql is not installed."
    echo ""
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo ""
    exit 1
fi

echo "📋 Running database schema..."
echo ""

# Run the schema file
PGPASSWORD=npg_cUJsgiQRV2f7 psql \
    -h ep-withered-math-ag82cu62-pooler.c-2.eu-central-1.aws.neon.tech \
    -p 5432 \
    -U neondb_owner \
    -d sabeel_db \
    -f server/db/schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema initialized successfully!"
    echo ""
    echo "📊 Verifying tables..."
    PGPASSWORD=npg_cUJsgiQRV2f7 psql \
        -h ep-withered-math-ag82cu62-pooler.c-2.eu-central-1.aws.neon.tech \
        -p 5432 \
        -U neondb_owner \
        -d sabeel_db \
        -c "\dt"
    
    echo ""
    echo "✅ Database is ready!"
else
    echo ""
    echo "❌ Failed to initialize database schema"
    exit 1
fi
