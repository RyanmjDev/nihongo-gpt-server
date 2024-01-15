const User = require('../models/User');

// Function to delete old demo accounts
const deleteOldDemoAccounts = async () => {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 24); // Accounts can be around for 24 hours

  try {
    await User.deleteMany({ 
      isDemo: true, 
      createdAt: { $lt: cutoffDate } 
    });
    console.log('Old demo accounts deleted');
  } catch (error) {
    console.error('Error deleting old demo accounts:', error);
  }
};

module.exports = deleteOldDemoAccounts;