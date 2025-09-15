import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Web3 from 'web3';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Web3 setup for blockchain integration
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');

// Simple smart contract ABI for logging collections
const CONTRACT_ABI = [
  {
    inputs: [
      { name: '_recordId', type: 'string' },
      { name: '_herbType', type: 'string' },
      { name: '_quantity', type: 'uint256' },
      { name: '_latitude', type: 'string' },
      { name: '_longitude', type: 'string' },
      { name: '_timestamp', type: 'uint256' }
    ],
    name: 'logCollection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const contract = new web3.eth.Contract(
  CONTRACT_ABI,
  process.env.CONTRACT_ADDRESS
);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create collection record
app.post('/api/collections', async (req, res) => {
  try {
    const { id, collectorId, herbType, quantity, photos, location, timestamp } = req.body;

    // Validate required fields
    if (!id || !collectorId || !herbType || !quantity || !location || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('collections')
      .insert([{
        id,
        collector_id: collectorId,
        herb_type: herbType,
        quantity,
        photos: photos || [],
        latitude: location.latitude,
        longitude: location.longitude,
        location_accuracy: location.accuracy,
        timestamp: new Date(timestamp).toISOString(),
        synced_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Queue for blockchain logging (in background)
    queueBlockchainLog({
      recordId: id,
      herbType,
      quantity,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      timestamp: Math.floor(new Date(timestamp).getTime() / 1000)
    });

    res.json({ success: true, data });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get collections (for admin/debugging)
app.get('/api/collections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blockchain integration functions
async function queueBlockchainLog(collectionData) {
  try {
    // In production, you'd use a proper queue system (Redis, etc.)
    // For now, we'll log immediately in background
    setTimeout(async () => {
      await logToBlockchain(collectionData);
    }, 1000);
  } catch (error) {
    console.error('Failed to queue blockchain log:', error);
  }
}

async function logToBlockchain(data) {
  try {
    if (!process.env.CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) {
      console.log('Blockchain not configured, skipping...');
      return;
    }

    const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);

    const tx = await contract.methods.logCollection(
      data.recordId,
      data.herbType,
      Math.floor(data.quantity * 1000), // Convert to grams for blockchain
      data.latitude,
      data.longitude,
      data.timestamp
    ).send({
      from: account.address,
      gas: 200000
    });

    console.log('Blockchain transaction:', tx.transactionHash);

    // Update Supabase record with blockchain hash
    await supabase
      .from('collections')
      .update({ blockchain_hash: tx.transactionHash })
      .eq('id', data.recordId);

  } catch (error) {
    console.error('Blockchain logging failed:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});