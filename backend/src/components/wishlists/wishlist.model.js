const itemSchema = new Schema({
  name: { type: String, required: true },
  url: String,
  price: Number,
  currency: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  notes: String,
  bought: { type: Boolean, default: false },
  // ... other fields
}) 