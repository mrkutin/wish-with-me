#!/bin/bash
set -e

# Debug: Print environment variables
echo "Debug: COUCHDB_HOST = ${COUCHDB_HOST}"
echo "Debug: COUCHDB_PORT = ${COUCHDB_PORT}"
echo "Debug: COUCHDB_USERNAME = ${COUCHDB_USERNAME}"

# Debug: Try to resolve CouchDB host
echo "Debug: Trying to resolve ${COUCHDB_HOST}"
getent hosts ${COUCHDB_HOST}

echo "Waiting for CouchDB to start..."
# Debug: Show the URL we're trying to connect to
echo "Debug: Trying to connect to http://${COUCHDB_HOST}:${COUCHDB_PORT}/"

until curl -s http://${COUCHDB_HOST}:${COUCHDB_PORT}/ > /dev/null; do
    sleep 1
done

echo "Creating _users database..."
curl -X PUT http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/_users

echo "Creating _replicator database..."
curl -X PUT http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/_replicator

echo "Creating _global_changes database..."
curl -X PUT http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/_global_changes


echo "Creating wishlists database..."
curl -X PUT http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/wishlists

echo "Creating indexes..."
curl -X POST http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/wishlists/_index \
-H "Content-Type: application/json" \
-d '{
  "index": {
    "fields": ["userId"]
  },
  "name": "user-id-index",
  "type": "json"
}'

curl -X POST http://${COUCHDB_USERNAME}:${COUCHDB_PASSWORD}@${COUCHDB_HOST}:${COUCHDB_PORT}/wishlists/_index \
-H "Content-Type: application/json" \
-d '{
  "index": {
    "fields": ["sharedWith"]
  },
  "name": "shared-with-index",
  "type": "json"
}'

echo "Database initialization completed." 