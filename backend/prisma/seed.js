const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Static vocabulary data (mirrors src/data/vocabularyData.ts)
// Seeded as global cards (userId = null) so every child can use them.
// ─────────────────────────────────────────────
const VOCABULARY = [
  // ── Needs ──────────────────────────────────
  { id: 'water',   imageUrl: '💧', text: { en: 'water',   ar: 'ماء'    }, category: 'needs',      level: 'BASIC',        order: 1  },
  { id: 'food',    imageUrl: '🍎', text: { en: 'food',    ar: 'طعام'   }, category: 'needs',      level: 'BASIC',        order: 2  },
  { id: 'toilet',  imageUrl: '🚽', text: { en: 'toilet',  ar: 'حمام'   }, category: 'needs',      level: 'BASIC',        order: 3  },
  { id: 'sleep',   imageUrl: '😴', text: { en: 'sleep',   ar: 'نوم'    }, category: 'needs',      level: 'BASIC',        order: 4  },

  // ── Actions ────────────────────────────────
  { id: 'want',    imageUrl: '✋', text: { en: 'want',    ar: 'أريد'   }, category: 'actions',    level: 'BASIC',        order: 5  },
  { id: 'go',      imageUrl: '🚶', text: { en: 'go',      ar: 'اذهب'   }, category: 'actions',    level: 'BASIC',        order: 6  },
  { id: 'play',    imageUrl: '🎮', text: { en: 'play',    ar: 'ألعب'   }, category: 'actions',    level: 'BASIC',        order: 7  },
  { id: 'stop',    imageUrl: '✋', text: { en: 'stop',    ar: 'توقف'   }, category: 'actions',    level: 'BASIC',        order: 8  },

  // ── Feelings ───────────────────────────────
  { id: 'happy',   imageUrl: '😊', text: { en: 'happy',   ar: 'سعيد'   }, category: 'feelings',   level: 'BASIC',        order: 9  },
  { id: 'sad',     imageUrl: '😢', text: { en: 'sad',     ar: 'حزين'   }, category: 'feelings',   level: 'BASIC',        order: 10 },
  { id: 'tired',   imageUrl: '😴', text: { en: 'tired',   ar: 'متعب'   }, category: 'feelings',   level: 'BASIC',        order: 11 },
  { id: 'angry',   imageUrl: '😡', text: { en: 'angry',   ar: 'غاضب'   }, category: 'feelings',   level: 'BASIC',        order: 12 },

  // ── People ─────────────────────────────────
  { id: 'mom',     imageUrl: '👩', text: { en: 'mom',     ar: 'أم'     }, category: 'people',     level: 'BASIC',        order: 13 },
  { id: 'dad',     imageUrl: '👨', text: { en: 'dad',     ar: 'أب'     }, category: 'people',     level: 'BASIC',        order: 14 },
  { id: 'teacher', imageUrl: '👩‍🏫', text: { en: 'teacher', ar: 'معلم'   }, category: 'people',     level: 'BASIC',        order: 15 },
  { id: 'friend',  imageUrl: '👫', text: { en: 'friend',  ar: 'صديق'   }, category: 'people',     level: 'BASIC',        order: 16 },

  // ── Places ─────────────────────────────────
  { id: 'place-home',   imageUrl: '🏠', text: { en: 'home',   ar: 'منزل'   }, category: 'places', level: 'BASIC', order: 17 },
  { id: 'place-school', imageUrl: '🏫', text: { en: 'school', ar: 'مدرسة'  }, category: 'places', level: 'BASIC', order: 18 },

  // ── Social ─────────────────────────────────
  { id: 'hello',     imageUrl: '👋', text: { en: 'hello',    ar: 'مرحبا'     }, category: 'social', level: 'BASIC', order: 19 },
  { id: 'thank-you', imageUrl: '👍', text: { en: 'thank you', ar: 'شكرا'    }, category: 'social', level: 'BASIC', order: 20 },
  { id: 'please',    imageUrl: '🙏', text: { en: 'please',   ar: 'من فضلك'  }, category: 'social', level: 'BASIC', order: 21 },
  { id: 'yes',       imageUrl: '✅', text: { en: 'yes',      ar: 'نعم'       }, category: 'social', level: 'BASIC', order: 22 },
  { id: 'no',        imageUrl: '❌', text: { en: 'no',       ar: 'لا'        }, category: 'social', level: 'BASIC', order: 23 },

  // ── Intermediate phrases ───────────────────
  { id: 'i-want-water',    imageUrl: '💧', text: { en: 'I want water',    ar: 'أريد ماء'             }, category: 'needs',      level: 'INTERMEDIATE', order: 24 },
  { id: 'i-want-food',     imageUrl: '🍎', text: { en: 'I want food',     ar: 'أريد طعام'            }, category: 'needs',      level: 'INTERMEDIATE', order: 25 },
  { id: 'i-am-happy',      imageUrl: '😊', text: { en: 'I am happy',      ar: 'أنا سعيد'             }, category: 'feelings',   level: 'INTERMEDIATE', order: 26 },
  { id: 'i-am-sad',        imageUrl: '😢', text: { en: 'I am sad',        ar: 'أنا حزين'             }, category: 'feelings',   level: 'INTERMEDIATE', order: 27 },
  { id: 'i-want-to-play',  imageUrl: '🎮', text: { en: 'I want to play',  ar: 'أريد أن ألعب'         }, category: 'activities', level: 'INTERMEDIATE', order: 28 },
  { id: 'i-need-help',     imageUrl: '🆘', text: { en: 'I need help',     ar: 'أحتاج مساعدة'         }, category: 'actions',    level: 'INTERMEDIATE', order: 29 },

  // ── Advanced sentences ─────────────────────
  { id: 'i-want-to-go-home', imageUrl: '🏠', text: { en: 'I want to go home', ar: 'أريد الذهاب إلى المنزل' }, category: 'places', level: 'ADVANCED', order: 30 },
  { id: 'i-love-you',        imageUrl: '❤️', text: { en: 'I love you',        ar: 'أحبك'                   }, category: 'social', level: 'ADVANCED', order: 31 },
];

// ─────────────────────────────────────────────
// Default locations — seeded for the test child only.
// Parents manage their own children's locations via the admin UI.
// ─────────────────────────────────────────────
const DEFAULT_LOCATIONS = [
  {
    id: 'loc-test-home',
    name: 'Home',
    type: 'home',
    icon: '🏠',
    color: 'from-blue-400 to-blue-600',
    categories: [
      { category: 'needs',    enabled: true },
      { category: 'actions',  enabled: true },
      { category: 'feelings', enabled: true },
      { category: 'people',   enabled: true },
    ],
    enabled: true,
    order: 1,
  },
  {
    id: 'loc-test-school',
    name: 'School',
    type: 'school',
    icon: '🏫',
    color: 'from-green-400 to-green-600',
    categories: [
      { category: 'needs',      enabled: true },
      { category: 'actions',    enabled: true },
      { category: 'social',     enabled: true },
      { category: 'activities', enabled: true },
    ],
    enabled: true,
    order: 2,
  },
  {
    id: 'loc-test-store',
    name: 'Store',
    type: 'store',
    icon: '🛒',
    color: 'from-purple-400 to-purple-600',
    categories: [
      { category: 'needs',   enabled: true },
      { category: 'actions', enabled: true },
      { category: 'social',  enabled: true },
    ],
    enabled: true,
    order: 3,
  },
  {
    id: 'loc-test-restaurant',
    name: 'Restaurant',
    type: 'restaurant',
    icon: '🍽️',
    color: 'from-orange-400 to-orange-600',
    categories: [
      { category: 'needs',   enabled: true },
      { category: 'actions', enabled: true },
      { category: 'social',  enabled: true },
    ],
    enabled: true,
    order: 4,
  },
];

async function seedVocabulary() {
  console.log('📚 Seeding global vocabulary...');
  let created = 0;
  let skipped = 0;

  for (const item of VOCABULARY) {
    const result = await prisma.vocabulary.upsert({
      where: { id: item.id },
      update: {
        // Keep text and imageUrl in sync if the item already exists
        text: item.text,
        imageUrl: item.imageUrl,
        category: item.category,
        level: item.level,
        order: item.order,
        enabled: true,
      },
      create: {
        id: item.id,
        userId: null, // null = global card visible to all children
        text: item.text,
        imageUrl: item.imageUrl,
        category: item.category,
        level: item.level,
        order: item.order,
        enabled: true,
      },
    });

    if (result) created++;
    else skipped++;
  }

  console.log(`   ✓ ${VOCABULARY.length} vocabulary items upserted`);
}

async function seedReviews() {
  console.log('⭐ Seeding default reviews...');
  const defaults = [
    { id: 'review-1', name: 'Sarah J.', role: 'Parent of a 6-year-old', quote: 'Jisr has given my daughter a voice. She can now express her needs and feelings independently — it has been life-changing.', active: true, order: 1 },
    { id: 'review-2', name: 'Dr. Michael Chen', role: 'Speech-language pathologist', quote: 'Customizing vocabulary per child is effortless, and the analytics give me a clear picture of progress between sessions.', active: true, order: 2 },
    { id: 'review-3', name: 'Emma R.', role: 'Special education teacher', quote: 'My students love using Jisr. It is so intuitive that even non-verbal children can use it independently.', active: true, order: 3 },
  ];
  for (const r of defaults) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: { name: r.name, role: r.role, quote: r.quote, active: r.active, order: r.order },
      create: r,
    });
  }
  console.log('   ✓ 3 reviews seeded');
}

async function seedTestChild(parentId) {
  console.log('👦 Seeding test child...');

  const child = await prisma.child.upsert({
    where: { id: 'test-child-1' },
    update: {},
    create: {
      id: 'test-child-1',
      name: 'Test Child',
      age: 7,
      userId: parentId,
    },
  });

  // AAC settings for the test child
  await prisma.aACSettings.upsert({
    where: { childId: child.id },
    update: {},
    create: {
      childId: child.id,
      primaryLanguage: 'en',
      voiceType: 'child',
      speechSpeed: 0.8,
      volume: 1.0,
      maxSentenceLength: 10,
      visibleImageCount: 0,
      vocabularyLevel: 'BASIC',
      speechMode: 'SENTENCE',
    },
  });

  console.log(`   ✓ Child "${child.name}" ready (id: ${child.id})`);
  return child;
}

async function seedChildLocations(childId) {
  console.log('📍 Seeding default locations for test child...');

  for (const loc of DEFAULT_LOCATIONS) {
    await prisma.location.upsert({
      where: { childId_name: { childId, name: loc.name } },
      update: {
        icon: loc.icon,
        color: loc.color,
        categories: loc.categories,
        enabled: loc.enabled,
        order: loc.order,
      },
      create: {
        id: loc.id,
        childId,
        name: loc.name,
        type: loc.type,
        icon: loc.icon,
        color: loc.color,
        categories: loc.categories,
        enabled: loc.enabled,
        order: loc.order,
      },
    });
  }

  console.log(`   ✓ ${DEFAULT_LOCATIONS.length} locations upserted`);
}

async function seedChildVocabularyAssignments(childId) {
  console.log('🔗 Assigning vocabulary to test child...');
  let assigned = 0;

  for (const item of VOCABULARY) {
    // upsert on the composite unique key — safe to re-run
    await prisma.childVocabulary.upsert({
      where: {
        childId_vocabularyId: { childId, vocabularyId: item.id },
      },
      update: {},
      create: { childId, vocabularyId: item.id },
    });
    assigned++;
  }

  console.log(`   ✓ ${assigned} vocabulary items assigned to child`);
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Users ──────────────────────────────────
  console.log('👤 Seeding users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@jisr.com' },
    update: { password: adminPassword, role: 'ADMIN', accountType: 'admin', emailVerified: true },
    create: {
      name: 'Admin User',
      email: 'admin@jisr.com',
      password: adminPassword,
      role: 'ADMIN',
      accountType: 'admin',
      emailVerified: true,
    },
  });

  const parentPassword = await bcrypt.hash('Parent123!', 10);
  const parent = await prisma.user.upsert({
    where: { email: 'parent@jisr.com' },
    update: {},
    create: {
      name: 'Test Parent',
      email: 'parent@jisr.com',
      password: parentPassword,
      role: 'USER',
      accountType: 'parent',
      emailVerified: true,
    },
  });
  console.log('   ✓ Admin and test parent ready\n');

  // ── Payment plans ──────────────────────────
  console.log('💳 Seeding payment plans...');
  await prisma.paymentPlan.upsert({
    where: { id: 'free-plan' },
    update: {},
    create: {
      id: 'free-plan',
      name: 'Free',
      price: 0,
      period: 'month',
      description: 'Perfect for trying out Jisr',
      features: ['Up to 50 vocabulary cards', 'Basic text-to-speech', 'Single child account'],
      popular: false,
      enabled: true,
    },
  });

  await prisma.paymentPlan.upsert({
    where: { id: 'family-plan' },
    update: {},
    create: {
      id: 'family-plan',
      name: 'Family',
      price: 15,
      period: 'month',
      description: 'Best for families with one child',
      features: ['Unlimited vocabulary cards', 'Advanced text-to-speech', 'Single child account', 'Priority support'],
      popular: true,
      enabled: true,
    },
  });

  await prisma.paymentPlan.upsert({
    where: { id: 'family-plus-plan' },
    update: {},
    create: {
      id: 'family-plus-plan',
      name: 'Family Plus',
      price: 25,
      period: 'month',
      description: 'Perfect for families with multiple children',
      features: ['Everything in Family', 'Multiple child accounts', 'Family management dashboard'],
      popular: false,
      enabled: true,
    },
  });
  console.log('   ✓ 3 payment plans ready\n');

  // ── Discounts ──────────────────────────────
  console.log('🏷️  Seeding discount codes...');
  await prisma.discount.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      type: 'PERCENTAGE',
      value: 20,
      description: 'Welcome discount for new users',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUses: 100,
      currentUses: 0,
      enabled: true,
    },
  });
  console.log('   ✓ Discount codes ready\n');

  // ── Vocabulary ─────────────────────────────
  await seedVocabulary();
  console.log();

  // ── Test child + locations + assignments ───
  const child = await seedTestChild(parent.id);
  console.log();
  await seedChildLocations(child.id);
  console.log();
  await seedChildVocabularyAssignments(child.id);
  console.log();

  // ── Reviews ────────────────────────────────
  await seedReviews();
  console.log();

  // ── Summary ────────────────────────────────
  console.log('✅ Seeding complete!\n');
  console.log('  📧 Admin  : admin@jisr.com   /  admin123');
  console.log('  👤 Parent : parent@jisr.com  /  Parent123!');
  console.log('  👦 Child  : Test Child       (id: test-child-1)');
  console.log(`  📚 Vocab  : ${VOCABULARY.length} global cards`);
  console.log(`  📍 Locs   : ${DEFAULT_LOCATIONS.length} default locations\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
