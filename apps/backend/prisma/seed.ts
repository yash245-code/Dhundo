import { PrismaClient, UserRole, BugSeverity, BugStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Dhundo database...');

  // ─── Office IDs ─────────────────────────────────────────────────────────────
  const officeIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'DEV001', 'DEV002', 'QA001', 'ADM001'];

  for (const id of officeIds) {
    await prisma.officeId.upsert({
      where: { officeId: id },
      update: {},
      create: { officeId: id },
    });
  }
  console.log(`✅ Created ${officeIds.length} office IDs`);

  // ─── Admin User ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin User',
      officeId: 'ADM001',
      email: 'admin@company.com',
      role: UserRole.ADMIN,
      passwordHash: adminHash,
    },
  });

  // ─── Developer User ──────────────────────────────────────────────────────────
  const devHash = await bcrypt.hash('Dev@1234', 12);
  const developer = await prisma.user.upsert({
    where: { email: 'dev1@company.com' },
    update: {},
    create: {
      name: 'Arjun Mehta',
      officeId: 'DEV001',
      email: 'dev1@company.com',
      role: UserRole.DEVELOPER,
      passwordHash: devHash,
    },
  });

  // ─── Employee User ────────────────────────────────────────────────────────────
  const empHash = await bcrypt.hash('Emp@1234', 12);
  const employee = await prisma.user.upsert({
    where: { email: 'emp1@company.com' },
    update: {},
    create: {
      name: 'Priya Rawat',
      officeId: 'EMP001',
      email: 'emp1@company.com',
      role: UserRole.EMPLOYEE,
      passwordHash: empHash,
    },
  });

  console.log('✅ Created seed users');

  // ─── Projects ─────────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { id: 'proj-bahi-001' },
    update: {},
    create: {
      id: 'proj-bahi-001',
      name: 'Bahi — Multi-Tenant Business Suite',
      description: 'Internal business management platform with CRM, inventory, and finance modules.',
      repoUrl: 'https://github.com/company/bahi',
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-dhundo-001' },
    update: {},
    create: {
      id: 'proj-dhundo-001',
      name: 'Dhundo — Bug Tracker',
      description: 'Cross-platform internal bug tracking application.',
      repoUrl: 'https://github.com/company/dhundo',
    },
  });

  console.log('✅ Created sample projects');

  // ─── Sample Bugs ─────────────────────────────────────────────────────────────
  const bug1 = await prisma.bug.create({
    data: {
      title: 'CRM page crashes on filter by date range',
      description:
        'When applying a date range filter in the CRM customer list, the page throws an unhandled exception and shows a blank screen.',
      stepsToReproduce:
        '1. Navigate to CRM → Customers\n2. Click "Filter"\n3. Select any date range\n4. Click "Apply"',
      severity: BugSeverity.HIGH,
      status: BugStatus.OPEN,
      environment: 'Chrome 128 / macOS 14.6',
      projectId: project1.id,
      reporterId: employee.id,
      assigneeId: developer.id,
    },
  });

  const bug2 = await prisma.bug.create({
    data: {
      title: 'Login screen: office ID field does not trim whitespace',
      description:
        'If a user accidentally types a trailing space in the office ID field, login fails with no helpful error message.',
      severity: BugSeverity.MEDIUM,
      status: BugStatus.IN_PROGRESS,
      environment: 'iOS 17.4 / iPhone 15',
      projectId: project2.id,
      reporterId: employee.id,
      assigneeId: developer.id,
    },
  });

  // ─── Sample Comments ──────────────────────────────────────────────────────────
  await prisma.bugComment.create({
    data: {
      bugId: bug1.id,
      userId: developer.id,
      comment: 'Reproduced on my end. Looks like the date picker library has a timezone issue. Will investigate.',
    },
  });

  await prisma.bugComment.create({
    data: {
      bugId: bug1.id,
      userId: admin.id,
      comment: 'Marking as HIGH priority — this is blocking the sales team.',
    },
  });

  console.log('✅ Created sample bugs and comments');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Admin:     ADM001 / Admin@1234');
  console.log('  Developer: DEV001 / Dev@1234');
  console.log('  Employee:  EMP001 / Emp@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
