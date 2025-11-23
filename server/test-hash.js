const bcrypt = require('bcrypt');

// Generate hash for 'admin123'
bcrypt.hash('admin123', 10).then(hash => {
    console.log('Generated hash for admin123:');
    console.log(hash);

    // Test the hash from schema.sql
    const schemaHash = '$2b$10$rGvM3ZqN0vhKKf3LWqHODe5H3HZqP5HYxvg6OYxGN/VK0FcPvkY7G';
    bcrypt.compare('admin123', schemaHash).then(result => {
        console.log('\nTesting schema hash with admin123:', result);
    });
});
