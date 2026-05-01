const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('password123', 12);
  const userPassword = await bcrypt.hash('password123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { fullName: 'Admin User', email: 'admin@example.com', password: adminPassword, phone: '0800000001', role: 'admin' },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { fullName: 'John Doe', email: 'user@example.com', password: userPassword, phone: '0800000002', role: 'user' },
  });

  await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: { fullName: 'Jane Smith', email: 'jane@example.com', password: userPassword, phone: '0800000003', role: 'user' },
  });

  // Tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.restaurantTable.upsert({
      where: { tableNumber: i },
      update: {},
      create: {
        tableNumber: i,
        capacity: i <= 4 ? 2 : i <= 7 ? 4 : 6,
        location: i <= 4 ? 'Indoor' : i <= 7 ? 'Outdoor' : 'Private Room',
      },
    });
    tables.push(table);
  }

  // ─── ล้างข้อมูลเก่าทั้งหมดก่อน ────────────────────────
  console.log('🧹 Cleaning old data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();

  // ─── Categories ────────────────────────────────────────
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.menuCategory.create({ data: { name: 'กาแฟ', description: 'กาแฟสดคั่วบด', sortOrder: 1 } }),
    prisma.menuCategory.create({ data: { name: 'ชา', description: 'ชาหอมจากทั่วโลก', sortOrder: 2 } }),
    prisma.menuCategory.create({ data: { name: 'ปั่น & Smoothie', description: 'เครื่องดื่มปั่นผลไม้สด', sortOrder: 3 } }),
    prisma.menuCategory.create({ data: { name: 'โซดา & น้ำผลไม้', description: 'สดชื่นทุกวัน', sortOrder: 4 } }),
    prisma.menuCategory.create({ data: { name: 'นม & ช็อกโกแลต', description: 'เข้มข้น หวานมัน', sortOrder: 5 } }),
  ]);

  // ─── Menu Items ────────────────────────────────────────
  console.log('🍹 Creating menu items...');
  const menuData = [
    // กาแฟ
    {
      categoryId: categories[0].id,
      name: 'Espresso',
      description: 'กาแฟเอสเปรสโซ่เข้มข้น หอมกลิ่นคั่วบด ดื่มร้อนหรือเย็น',
      price: '55',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[0].id,
      name: 'Americano',
      description: 'เอสเปรสโซ่ผสมน้ำร้อน กลมกล่อม ไม่ขมเกินไป',
      price: '65',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1521302200778-33500795e128?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[0].id,
      name: 'Cappuccino',
      description: 'เอสเปรสโซ่ นมสด และโฟมนมฟูนุ่ม คลาสสิกอิตาลี',
      price: '85',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[0].id,
      name: 'Latte',
      description: 'กาแฟลาเต้นมสดเยอะ เนื้อนมเนียน หวานน้อย',
      price: '90',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[0].id,
      name: 'Caramel Macchiato',
      description: 'ลาเต้ราดคาราเมล หวานหอม เหมาะสำหรับคนชอบหวาน',
      price: '105',
      sortOrder: 5,
      imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[0].id,
      name: 'Cold Brew',
      description: 'กาแฟสกัดเย็น 12 ชั่วโมง เข้มข้น หอม ไม่ขม',
      price: '95',
      sortOrder: 6,
      imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&auto=format',
    },
    // ชา
    {
      categoryId: categories[1].id,
      name: 'ชาเขียวมัทฉะ',
      description: 'มัทฉะแท้จากญี่ปุ่น เข้มข้น หอมใบชา ร้อนหรือเย็น',
      price: '95',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[1].id,
      name: 'Thai Milk Tea',
      description: 'ชาไทยสูตรต้นตำรับ นมข้นหวาน สีส้มสวย',
      price: '65',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[1].id,
      name: 'Earl Grey Latte',
      description: 'ชาเอิร์ลเกรย์หอมดอกส้ม ผสมนมสด เข้มกลมกล่อม',
      price: '85',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[1].id,
      name: 'Chamomile Honey',
      description: 'ชาคาโมมายล์ราดน้ำผึ้งแท้ ผ่อนคลาย นอนหลับดี',
      price: '75',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop&auto=format',
    },
    // ปั่น & Smoothie
    {
      categoryId: categories[2].id,
      name: 'Matcha Frappe',
      description: 'มัทฉะปั่นกับนมและน้ำแข็ง ราดวิปครีม หอมเย็นสดชื่น',
      price: '115',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[2].id,
      name: 'Strawberry Smoothie',
      description: 'สตรอเบอร์รีสดปั่นกับโยเกิร์ต เปรี้ยวหวาน สีชมพูสวย',
      price: '110',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[2].id,
      name: 'Mango Lassi',
      description: 'มะม่วงสุกปั่นกับโยเกิร์ตอินเดีย หวานมัน เนื้อเนียน',
      price: '105',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[2].id,
      name: 'Blue Butterfly Pea',
      description: 'ดอกอัญชันปั่น เปลี่ยนสีสวยงาม ราดน้ำมะนาว',
      price: '95',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=400&h=300&fit=crop&auto=format',
    },
    // โซดา & น้ำผลไม้
    {
      categoryId: categories[3].id,
      name: 'Lemon Soda',
      description: 'โซดามะนาวสดบีบ หวานน้อย เย็นชื่นใจ',
      price: '65',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[3].id,
      name: 'Fresh Orange Juice',
      description: 'น้ำส้มคั้นสดวันต่อวัน ไม่เติมน้ำตาล วิตามินซีสูง',
      price: '80',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[3].id,
      name: 'Watermelon Juice',
      description: 'น้ำแตงโมสด หวานฉ่ำ เติมเกลือชมพูหิมาลัยนิดหน่อย',
      price: '70',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[3].id,
      name: 'Sparkling Water',
      description: 'น้ำอัดลมแร่ธาตุนำเข้า เสิร์ฟพร้อมมะนาวและมิ้นต์',
      price: '55',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&h=300&fit=crop&auto=format',
    },
    // นม & ช็อกโกแลต
    {
      categoryId: categories[4].id,
      name: 'Hot Chocolate',
      description: 'ช็อกโกแลตแท้ละลายในนมอุ่น เข้มข้น หวานกำลังดี',
      price: '90',
      sortOrder: 1,
      imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[4].id,
      name: 'Chocolate Frappe',
      description: 'ช็อกโกแลตปั่นเย็น ราดซอสช็อกโกแลต หอมหวานเย็นชื่น',
      price: '110',
      sortOrder: 2,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[4].id,
      name: 'Strawberry Milk',
      description: 'นมสตรอเบอร์รีเกาหลีสไตล์ หวานหอม สีชมพูน่ารัก',
      price: '85',
      sortOrder: 3,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop&auto=format',
    },
    {
      categoryId: categories[4].id,
      name: 'Oat Milk Latte',
      description: 'ลาเต้นมข้าวโอ๊ต vegan friendly หวานน้อย ดีต่อสุขภาพ',
      price: '100',
      sortOrder: 4,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&auto=format',
    },
  ];

  const menuItems = await Promise.all(
    menuData.map(item => prisma.menuItem.create({ data: item }))
  );

  // Sample Reservation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      userId: user1.id,
      tableId: tables[0].id,
      reservationDate: tomorrow,
      timeSlot: '14:00',
      guestCount: 2,
      specialRequest: 'ขอที่นั่งริมหน้าต่าง',
      status: 'confirmed',
    },
  });

  // Sample Order
  await prisma.order.create({
    data: {
      userId: user1.id,
      totalPrice: '250',
      status: 'completed',
      notes: 'หวานน้อย ไม่ใส่น้ำแข็ง',
      orderItems: {
        create: [
          { menuItemId: menuItems[3].id,  quantity: 1, unitPrice: '90', subtotal: '90'  },
          { menuItemId: menuItems[6].id,  quantity: 1, unitPrice: '95', subtotal: '95'  },
          { menuItemId: menuItems[14].id, quantity: 1, unitPrice: '65', subtotal: '65'  },
        ],
      },
    },
  });

  console.log(`✅ Seed completed! Menu items: ${menuItems.length} รายการ`);
  console.log('👤 Admin: admin@example.com / password123');
  console.log('👤 User:  user@example.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());