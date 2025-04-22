#!/bin/bash

# Navigate to the backend directory
cd ../dataroom_backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
fi

# Run the migration script
python3 migrations/add_oauth_fields.py

# Return to the frontend directory
cd ../dataroom_frontend

echo "Migration completed!" 