const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verificar que se cargó correctamente
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    
    // Define URL schema
    const urlSchema = new mongoose.Schema(
      {
        originalUrl: String,
        shortCode: String,
        clicks: Number,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
      {
        timestamps: true,
      }
    );

    // Create URL model
    const Url = mongoose.model('Url', urlSchema);

    // Find all URLs
    Url.find()
      .then(urls => {
        console.log('Total URLs:', urls.length);
        console.log('URLs:');
        urls.forEach(url => {
          console.log(`- Original URL: ${url.originalUrl}`);
          console.log(`  Short Code: ${url.shortCode}`);
          console.log(`  Clicks: ${url.clicks}`);
          console.log(`  Created At: ${url.createdAt}`);
          console.log('---');
        });
        mongoose.connection.close();
      })
      .catch(err => {
        console.error('Error finding URLs:', err);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  }); 