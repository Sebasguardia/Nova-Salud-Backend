import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed...');

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@botica.com' },
  });

  if (existing) {
    console.log('✅ Admin ya existe, saltando seed de usuario');
  } else {
    const passwordHash = await bcrypt.hash('Admin123', 12);

    const admin = await prisma.user.create({
      data: {
        firstName:          'Admin',
        lastName:           'Sistema',
        email:              'admin@botica.com',
        dni:                '00000000',
        position:           'Administrador',
        role:               Role.ADMIN,
        passwordHash,
        mustChangePassword: false,
        isActive:           true,
        permissions: {
          create: [
            { module: 'dashboard', canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'sales',     canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'clients',   canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'reports',   canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'inventory', canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'audit',     canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'users',     canAccess: true, canCreate: true, canEdit: true, canDelete: true },
            { module: 'settings',  canAccess: true, canCreate: true, canEdit: true, canDelete: true },
          ],
        },
      },
    });

    console.log(`✅ Admin creado: ${admin.email}`);
  }

  const settingsData = [
    { key: 'botica_name',    value: 'Botica San Juan',  description: 'Nombre de la botica' },
    { key: 'ruc',            value: '10000000000',       description: 'RUC de la botica' },
    { key: 'address',        value: 'Av. Principal 123', description: 'Dirección de la botica' },
    { key: 'igv_rate',       value: '18',                description: 'Porcentaje de IGV' },
    { key: 'points_per_sol', value: '1',                 description: 'Puntos por cada sol gastado' },
    { key: 'points_value',   value: '0.01',              description: 'Valor monetario de cada punto (soles)' },
  ];

  for (const setting of settingsData) {
    await prisma.settings.upsert({
      where:  { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Configuración inicial creada');
  console.log('🎉 Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });