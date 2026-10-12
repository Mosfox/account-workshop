const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'account-db';

async function main() {
  const client = new MongoClient(MONGO_URL);

  try {
    await client.connect();
    const users = client.db(DATABASE_NAME).collection('users');

    const username = 'somchai';
    const password = 'P@ssw0rd';

    // ลบข้อมูลทดสอบชื่อ somchai เดิมก่อน เพื่อให้รันซ้ำได้
    await users.deleteOne({ username });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      username,
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'member',
      passwordHash,
      createdAt: new Date()
    });

    console.log(`สร้างผู้ใช้ ${username} แล้ว id: ${result.insertedId}`);

    const user = await users.findOne({ username });
    console.log(`รหัสผ่านถูกต้อง: ${await bcrypt.compare(password, user.passwordHash)}`);
    console.log(`รหัสผ่านผิด: ${await bcrypt.compare('123456', user.passwordHash)}`);

    const list = await users.find(
      {},
      { projection: { passwordHash: 0 } }
    ).toArray();

    console.log('รายชื่อสมาชิก (ไม่แสดง passwordHash):');
    console.log(list);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
