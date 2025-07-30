// Script to add password to existing user
const bcrypt = require('bcrypt');
const { userModel } = require('./dist/Models/userModel');
const mongoose = require('mongoose');

const addPasswordToUser = async () => {
  try {
    // Connect to MongoDB using the same connection string as the app
    const connectionString = "mongodb+srv://vivekshaurya62:smartSender@cluster0.xlwnhxl.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    const email = 'nemogpt.dev@gmail.com';
    const password = 'Inemo@9634';

    // Find the user
    const user = await userModel.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user with password
    user.password = hashedPassword;
    await user.save();

    console.log('Password added successfully for user:', email);
    
    // Test the authentication
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password verification test:', isValid);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

addPasswordToUser();
