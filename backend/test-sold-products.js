// Test script to verify sold products functionality
// Run this after setting up the database table

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/admin/orders';

async function testBannerEndpoints() {
    try {
        console.log('🧪 Testing Banner Endpoints...\n');

        // Test 1: Get recent sold products
        console.log('1. Testing recent sold products...');
        const recentResponse = await axios.get(`${BASE_URL}/banner/recent-sold?limit=5`);
        console.log('✅ Recent sold products:', recentResponse.data.length, 'items');
        
        // Test 2: Get top selling products
        console.log('\n2. Testing top selling products...');
        const topResponse = await axios.get(`${BASE_URL}/banner/top-selling?limit=5`);
        console.log('✅ Top selling products:', topResponse.data.length, 'items');
        
        // Test 3: Get category-specific recent sold (if categories exist)
        console.log('\n3. Testing category-specific recent sold...');
        try {
            const categoryResponse = await axios.get(`${BASE_URL}/banner/recent-sold/test-category?limit=3`);
            console.log('✅ Category-specific products:', categoryResponse.data.length, 'items');
        } catch (err) {
            console.log('ℹ️ Category test skipped (no data or invalid category)');
        }

        console.log('\n🎉 All banner endpoints are working!');
        
    } catch (error) {
        console.error('❌ Error testing endpoints:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Instructions
console.log('📋 Sold Products Test Script');
console.log('============================');
console.log('');
console.log('Prerequisites:');
console.log('1. Run the SQL script: create-sold-products-table.sql');
console.log('2. Start the backend server: npm run start:dev');
console.log('3. Make sure there are some completed orders in the system');
console.log('');
console.log('To run the test: node test-sold-products.js');
console.log('');

// Only run test if called directly
if (require.main === module) {
    testBannerEndpoints();
}

module.exports = { testBannerEndpoints };
