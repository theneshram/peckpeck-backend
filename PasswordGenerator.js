const bcrypt = require('bcrypt');
const readline = require('readline');

const storedHash = '$2b$10$2r5N7eGuBUI0WXLW5Gqz4uwk2YVXbNL5cH.X/xQx41hiE0PVoYwuq'; // Existing hash for "Pass$$123"
const defaultPassword = 'Pass$$123';

if (process.argv[2] === 'manual') {
  // Manual test mode: prompt the user for a password to test against storedHash
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter password to test: ', (input) => {
    bcrypt.compare(input, storedHash)
      .then(result => {
        console.log('Comparison result:', result);
        rl.close();
      })
      .catch(err => {
        console.error('Error:', err);
        rl.close();
      });
  });
} else {
  // Default behavior: generate a new hash for defaultPassword, then compare it
  console.log('Generating hash for:', defaultPassword);
  bcrypt.hash(defaultPassword, 10)
    .then(newHash => {
      console.log('New Hash:', newHash);
      return bcrypt.compare(defaultPassword, newHash);
    })
    .then(result => {
      console.log('Comparison result with new hash:', result);
    })
    .catch(err => {
      console.error('Error:', err);
    })
    .finally(() => {
      console.log('Finished.');
    });
}
