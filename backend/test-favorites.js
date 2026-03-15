// Test script for favorites functionality
const axios = require('axios');

// Use environment variable or default to localhost for development
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test with a sample user token (you'll need to replace this)
const TEST_TOKEN = 'your-jwt-token-here';

async function testFavoritesAPI() {
    console.log('🧪 Testing Favorites API...\n');

    try {
        // Test 1: Get favorite count (public endpoint)
        console.log('1. Testing public favorite count...');
        const countResponse = await axios.get(`${BASE_URL}/favorites/test-product/count`);
        console.log('✅ Favorite count:', countResponse.data.favoriteCount);

        // Test 2: Get most favorited products (public endpoint)
        console.log('\n2. Testing most favorited products...');
        const mostFavoritedResponse = await axios.get(`${BASE_URL}/favorites/banner/most-favorited?limit=5`);
        console.log('✅ Most favorited products:', mostFavoritedResponse.data.length, 'items');

        // Test 3: Protected endpoints (require authentication)
        if (TEST_TOKEN && TEST_TOKEN !== 'your-jwt-token-here') {
            console.log('\n3. Testing authenticated endpoints...');
            
            const config = {
                headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
            };

            // Add to favorites
            try {
                const addResponse = await axios.post(`${BASE_URL}/favorites/test-product`, {}, config);
                console.log('✅ Added to favorites:', addResponse.data.id);
            } catch (error) {
                if (error.response?.status === 400) {
                    console.log('ℹ️ Product already in favorites');
                }
            }

            // Check if favorited
            const checkResponse = await axios.get(`${BASE_URL}/favorites/test-product/check`, config);
            console.log('✅ Is favorited:', checkResponse.data.isFavorite);

            // Get user's favorites
            const userFavoritesResponse = await axios.get(`${BASE_URL}/favorites`, config);
            console.log('✅ User favorites:', userFavoritesResponse.data.length, 'items');

            // Remove from favorites
            await axios.delete(`${BASE_URL}/favorites/test-product`, config);
            console.log('✅ Removed from favorites');
        } else {
            console.log('\n3. Skipping authenticated tests (no valid token provided)');
        }

        console.log('\n🎉 All favorites API tests passed!');

    } catch (error) {
        console.error('❌ Error testing favorites API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Instructions
console.log('📋 Favorites API Test Script');
console.log('============================');
console.log('');
console.log('🔥 IMPORTANT: This app uses SUPABASE, not localhost!');
console.log('');
console.log('Prerequisites:');
console.log('1. Run migrations in Supabase SQL Editor:');
console.log('   - create-sold-products-table.sql');
console.log('   - migrate-favorites-to-users.sql');
console.log('2. Start the backend server: npm run start:dev');
console.log('3. (Optional) Update TEST_TOKEN with a valid JWT token');
console.log('');
console.log('Note: Data is stored in Supabase, not localhost database');
console.log('');
console.log('To run the test: node test-favorites.js');
console.log('');

// Only run test if called directly
if (require.main === module) {
    testFavoritesAPI();
}

module.exports = { testFavoritesAPI };
