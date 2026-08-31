import 'dotenv/config'
import mariadb from 'mariadb'

async function testConnection() {
  console.log('Testing database connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  
  try {
    const pool = mariadb.createPool({ 
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'yangtautauaja',
      database: 'innavance',
      connectionLimit: 5
    })
    
    console.log('Pool created, attempting to get connection...')
    const conn = await pool.getConnection()
    console.log('✅ Connection successful!')
    
    const rows = await conn.query('SELECT DATABASE() as db')
    console.log('Current database:', rows[0].db)
    
    const tables = await conn.query('SHOW TABLES')
    console.log('\nTables in database:')
    tables.forEach((row: any) => {
      console.log(' -', Object.values(row)[0])
    })
    
    conn.release()
    await pool.end()
    
    console.log('\n✅ Test complete!')
  } catch (error) {
    console.error('❌ Connection failed:', error)
  }
}

testConnection()
