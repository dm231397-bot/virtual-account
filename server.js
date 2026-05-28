const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get('/', (req, res) => {
  res.send('Virtual Account API is running 🚀');
});

// Create virtual account (using Paystack's recommended business flow)
app.post('/create-va', async (req, res) => {
  const { name, email, preferred_bank } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Paystack Dedicated Account API
    const response = await axios.post(
      'https://api.paystack.co/dedicated_account',
      {
        customer: {
          name,
          email
        },
        preferred_bank: preferred_bank || null,
        currency: 'NGN'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const va = response.data.data;
    res.json({ message: 'Virtual Account created successfully', va });
  } catch (err) {
    console.error('Paystack error:', err.response?.data || err.message);

    // Fallback response to help debugging
    res.status(500).json({
      error: 'Failed to create virtual account',
      details: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
