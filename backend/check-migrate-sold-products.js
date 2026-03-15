// Helper script to check and run historical sold products migration
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SQL_FILE = path.join(__dirname, 'migrate-historical-sold-products.sql');

function executeSQLQuery(query, description) {
    console.log(`\n🔍 ${description}`);
    console.log('─'.repeat(50));
    try {
        // This would need to be adapted for your specific database connection
        // For now, just showing what would be executed
        console.log(`SQL: ${query.substring(0, 100)}...`);
        console.log('✅ Query ready to execute');
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

function checkMigrationPrerequisites() {
    console.log('📋 Checking Migration Prerequisites');
    console.log('='.repeat(50));
    
    // Check if SQL file exists
    if (!fs.existsSync(SQL_FILE)) {
        console.error('❌ Migration SQL file not found:', SQL_FILE);
        return false;
    }
    
    console.log('✅ Migration SQL file found');
    
    // Check if sold_products table exists (in real scenario)
    console.log('ℹ️  Checking if sold_products table exists...');
    console.log('   (This would query your database)');
    
    return true;
}

function showMigrationSteps() {
    console.log('\n🚀 Migration Steps');
    console.log('='.repeat(50));
    
    console.log('\n1️⃣  **Pre-Migration Check**');
    console.log('   - Check existing completed orders');
    console.log('   - Verify sold_products table exists');
    console.log('   - Backup data if needed');
    
    console.log('\n2️⃣  **Run Migration**');
    console.log('   - Execute migrate-historical-sold-products.sql');
    console.log('   - Process all completed orders');
    console.log('   - Create sold_products records');
    
    console.log('\n3️⃣  **Post-Migration Verification**');
    console.log('   - Check created records');
    console.log('   - Update soldCount in products');
    console.log('   - Verify data integrity');
    
    console.log('\n4️⃣  **Test New Features**');
    console.log('   - Test banner endpoints');
    console.log('   - Verify sold products data');
    console.log('   - Check analytics functionality');
}

function showExpectedResults() {
    console.log('\n📊 Expected Migration Results');
    console.log('='.repeat(50));
    
    console.log('\n📈 **Data Created**');
    console.log('   • sold_products records for each completed order item');
    console.log('   • Historical sales data preserved');
    console.log('   • Product soldCount updated');
    
    console.log('\n🎯 **New Capabilities**');
    console.log('   • Recent sold products banner');
    console.log('   • Top selling products analytics');
    console.log('   • Category-specific sales data');
    console.log('   • Historical sales reporting');
    
    console.log('\n📋 **Sample Queries Available**');
    console.log('   • GET /api/admin/orders/banner/recent-sold');
    console.log('   • GET /api/admin/orders/banner/top-selling');
    console.log('   • GET /api/admin/orders/banner/recent-sold/:categoryId');
}

function showRollbackPlan() {
    console.log('\n🔄 Rollback Plan (if needed)');
    console.log('='.repeat(50));
    
    console.log('\n⚠️  **If Migration Fails**');
    console.log('   1. Stop the application');
    console.log('   2. Restore from backup');
    console.log('   3. Verify data integrity');
    
    console.log('\n🗑️  **Clean Up Commands**');
    console.log('   ```sql');
    console.log('   -- Delete migrated data');
    console.log('   DELETE FROM sold_products;');
    console.log('   ');
    console.log('   -- Reset soldCount');
    console.log('   UPDATE products SET sold_count = 0;');
    console.log('   ```');
}

function main() {
    console.log('🛠️  Historical Sold Products Migration Helper');
    console.log('='.repeat(60));
    
    // Check prerequisites
    if (!checkMigrationPrerequisites()) {
        console.log('\n❌ Prerequisites not met. Please fix issues before proceeding.');
        return;
    }
    
    // Show migration steps
    showMigrationSteps();
    
    // Show expected results
    showExpectedResults();
    
    // Show rollback plan
    showRollbackPlan();
    
    console.log('\n📝 **Next Steps**');
    console.log('─'.repeat(30));
    console.log('1. Run the SQL script in Supabase:');
    console.log('   - Open Supabase SQL Editor');
    console.log('   - Copy-paste migrate-historical-sold-products.sql');
    console.log('   - Execute section by section');
    console.log('');
    console.log('2. Verify results using the verification queries');
    console.log('');
    console.log('3. Test the new banner endpoints');
    console.log('');
    console.log('4. Update frontend to use new sold products data');
    
    console.log('\n✨ Migration script ready!');
    console.log('📄 File: migrate-historical-sold-products.sql');
}

// Run the helper
if (require.main === module) {
    main();
}

module.exports = {
    checkMigrationPrerequisites,
    showMigrationSteps,
    showExpectedResults,
    showRollbackPlan
};
