const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const corsOptions = {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let collection;

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const database = client.db('waste_audit');
        collection = database.collection('readings');
    } catch (err) {
        console.error(err);
    }
}

connectDB();

app.post('/api/readings', async (req, res) => {
    try {
        const doc = req.body;
        const result = await collection.insertOne(doc);
        res.status(201).json({ message: 'Reading saved!', id: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save reading' });
    }
});

app.get('/api/readings', async (req, res) => {
    try {
        const readings = await collection.find({}).toArray();
        res.status(200).json(readings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch readings' });
    }
});

// GET one reading by id
app.put('/api/readings/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { id: id };
        const updateDoc = { ...req.body };
        delete updateDoc._id;

        const result = await collection.updateOne(filter, { $set: updateDoc });

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Reading not found' });
        }

        res.json({ message: 'Reading updated!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update reading' });
    }
});

// DELETE one reading by id
app.delete('/api/readings/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { id: id }; // match your ID field!

        const result = await collection.deleteOne(filter);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Reading not found' });
        }

        res.json({ message: 'Reading deleted!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete reading' });
    }
});



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
