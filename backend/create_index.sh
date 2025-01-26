#!/bin/bash

curl -X POST http://admin:password@localhost:5984/wishlists/_index \
-H "Content-Type: application/json" \
-d '{
  "index": {
    "fields": ["userId", "dueDate"]
  },
  "name": "user-dueDate-compound",
  "type": "json"
}' 