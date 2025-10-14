import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User.entity';
import { Product } from '../entities/Product.entity';
import { LabelTemplate } from '../entities/LabelTemplate.entity';
import { Label } from '../entities/Label.entity';
import { LabelSpecification } from '../entities/LabelSpecification.entity';
import { TemplateType, LabelType, LabelStatus } from '../types/enums';
import { hashPassword } from '../utils/jwt';

const logger = {
  info: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  section: (msg: string) => console.log(`\n\x1b[36m━━━ ${msg} ━━━\x1b[0m`),
};

/**
 * Test users with different roles
 */
const TEST_USERS = [
  {
    email: 'admin@eyelighting.com.au',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  },
  {
    email: 'engineer@eyelighting.com.au',
    password: 'engineer123',
    firstName: 'John',
    lastName: 'Engineer',
    role: UserRole.ENGINEER,
  },
  {
    email: 'designer@eyelighting.com.au',
    password: 'designer123',
    firstName: 'Jane',
    lastName: 'Designer',
    role: UserRole.DESIGNER,
  },
  {
    email: 'approver@eyelighting.com.au',
    password: 'approver123',
    firstName: 'Mike',
    lastName: 'Approver',
    role: UserRole.APPROVER,
  },
];

/**
 * Test products - realistic lighting products
 */
const TEST_PRODUCTS = [
  {
    gs1BarcodeNumber: '9300001234567',
    productCode: 'DL-150-WH',
    productName: 'LED Downlight 150mm White',
    description: '15W LED downlight with adjustable color temperature',
    metadata: { category: 'downlights', wattage: 15, voltage: '240V' },
  },
  {
    gs1BarcodeNumber: '9300001234574',
    productCode: 'DL-150-BK',
    productName: 'LED Downlight 150mm Black',
    description: '15W LED downlight with adjustable color temperature',
    metadata: { category: 'downlights', wattage: 15, voltage: '240V' },
  },
  {
    gs1BarcodeNumber: '9300001234581',
    productCode: 'PNL-600-40W',
    productName: 'LED Panel 600x600 40W',
    description: 'Square LED panel for commercial spaces',
    metadata: { category: 'panels', wattage: 40, voltage: '240V', size: '600x600' },
  },
  {
    gs1BarcodeNumber: '9300001234598',
    productCode: 'HB-200W-CCT',
    productName: 'High Bay 200W CCT Selectable',
    description: 'Industrial high bay with selectable color temperature',
    metadata: { category: 'high-bay', wattage: 200, voltage: '240V', cct: 'selectable' },
  },
  {
    gs1BarcodeNumber: '9300001234604',
    productCode: 'FL-150-4FT',
    productName: 'LED Batten 4ft 150cm',
    description: '50W LED linear batten for commercial use',
    metadata: { category: 'battens', wattage: 50, voltage: '240V', length: '1500mm' },
  },
  {
    gs1BarcodeNumber: '9300001234611',
    productCode: 'EM-DL-150',
    productName: 'Emergency Downlight 150mm',
    description: 'LED downlight with emergency battery backup',
    metadata: { category: 'emergency', wattage: 12, voltage: '240V', backup: '3hrs' },
  },
  {
    gs1BarcodeNumber: '9300001234628',
    productCode: 'EM-EXIT-LED',
    productName: 'LED Exit Sign Emergency',
    description: 'LED exit sign with battery backup',
    metadata: { category: 'emergency', wattage: 3, voltage: '240V', backup: '3hrs' },
  },
  {
    gs1BarcodeNumber: '9300001234635',
    productCode: 'TR-SPOT-12W',
    productName: 'Track Spotlight 12W',
    description: 'Adjustable track spotlight for retail',
    metadata: { category: 'track', wattage: 12, voltage: '240V', beam: '30deg' },
  },
  {
    gs1BarcodeNumber: '9300001234642',
    productCode: 'BULKHEAD-20W',
    productName: 'LED Bulkhead 20W Round',
    description: 'Weatherproof LED bulkhead IP65',
    metadata: { category: 'outdoor', wattage: 20, voltage: '240V', ip: 'IP65' },
  },
  {
    gs1BarcodeNumber: '9300001234659',
    productCode: 'FL-100-3FT',
    productName: 'LED Batten 3ft 90cm',
    description: '36W LED linear batten',
    metadata: { category: 'battens', wattage: 36, voltage: '240V', length: '900mm' },
  },
];

/**
 * Label templates with realistic template data
 */
const createTemplateData = (type: TemplateType) => {
  const baseElements = [
    {
      type: 'text',
      x: 10,
      y: 10,
      width: 180,
      height: 30,
      properties: {
        content: 'EYE LIGHTING AUSTRALIA',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Arial',
      },
    },
    {
      type: 'text',
      x: 10,
      y: 45,
      width: 180,
      height: 25,
      properties: {
        content: '{{productName}}',
        fontSize: 12,
        fontFamily: 'Arial',
      },
    },
    {
      type: 'text',
      x: 10,
      y: 75,
      width: 100,
      height: 20,
      properties: {
        content: 'Model: {{productCode}}',
        fontSize: 10,
        fontFamily: 'Arial',
      },
    },
    {
      type: 'barcode',
      x: 10,
      y: 100,
      width: 180,
      height: 60,
      properties: {
        value: '{{gs1BarcodeNumber}}',
        format: 'GS1-128',
        displayValue: true,
      },
    },
  ];

  // Add type-specific elements
  const additionalElements: any[] = [];

  if (type === TemplateType.CCT_SELECTABLE) {
    additionalElements.push({
      type: 'text',
      x: 10,
      y: 170,
      width: 180,
      height: 40,
      properties: {
        content: 'CCT: {{cctOptions}}',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Arial',
      },
    });
  }

  if (type === TemplateType.POWER_SELECTABLE) {
    additionalElements.push({
      type: 'text',
      x: 10,
      y: 170,
      width: 180,
      height: 40,
      properties: {
        content: 'Power: {{powerOptions}}',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Arial',
      },
    });
  }

  if (type === TemplateType.EMERGENCY) {
    additionalElements.push(
      {
        type: 'icon',
        x: 170,
        y: 10,
        width: 30,
        height: 30,
        properties: {
          iconType: 'emergency',
          color: 'red',
        },
      },
      {
        type: 'text',
        x: 10,
        y: 170,
        width: 180,
        height: 40,
        properties: {
          content: 'EMERGENCY LIGHTING\\nBackup: 3 Hours',
          fontSize: 10,
          fontWeight: 'bold',
          fontFamily: 'Arial',
          color: 'red',
        },
      }
    );
  }

  return {
    width: 200,
    height: type === TemplateType.STANDARD ? 180 : 220,
    elements: [...baseElements, ...additionalElements],
    styles: {
      border: '1px solid #000',
      backgroundColor: '#ffffff',
      padding: 5,
    },
  };
};

const LABEL_TEMPLATES = [
  {
    name: 'Standard Product Label',
    type: TemplateType.STANDARD,
  },
  {
    name: 'CCT Selectable Label',
    type: TemplateType.CCT_SELECTABLE,
  },
  {
    name: 'Power Selectable Label',
    type: TemplateType.POWER_SELECTABLE,
  },
  {
    name: 'Emergency Lighting Label',
    type: TemplateType.EMERGENCY,
  },
];

/**
 * Seed users
 */
async function seedUsers() {
  logger.section('Seeding Users');

  const userRepo = AppDataSource.getRepository(User);
  const users: User[] = [];

  for (const userData of TEST_USERS) {
    const existing = await userRepo.findOne({
      where: { email: userData.email },
    });

    if (existing) {
      logger.warn(`User ${userData.email} already exists, skipping`);
      users.push(existing);
      continue;
    }

    const hashedPassword = await hashPassword(userData.password);

    const user = userRepo.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isActive: true,
    });

    await userRepo.save(user);
    logger.info(`Created user: ${userData.email} (${userData.role})`);
    users.push(user);
  }

  logger.info(`Total users: ${users.length}`);
  return users;
}

/**
 * Seed products
 */
async function seedProducts() {
  logger.section('Seeding Products');

  const productRepo = AppDataSource.getRepository(Product);
  const products: Product[] = [];

  for (const productData of TEST_PRODUCTS) {
    const existing = await productRepo.findOne({
      where: { gs1BarcodeNumber: productData.gs1BarcodeNumber },
    });

    if (existing) {
      logger.warn(`Product ${productData.productCode} already exists, skipping`);
      products.push(existing);
      continue;
    }

    const product = productRepo.create(productData);
    await productRepo.save(product);
    logger.info(`Created product: ${productData.productCode} - ${productData.productName}`);
    products.push(product);
  }

  logger.info(`Total products: ${products.length}`);
  return products;
}

/**
 * Seed label templates
 */
async function seedTemplates() {
  logger.section('Seeding Label Templates');

  const templateRepo = AppDataSource.getRepository(LabelTemplate);
  const templates: LabelTemplate[] = [];

  for (const templateData of LABEL_TEMPLATES) {
    const existing = await templateRepo.findOne({
      where: { name: templateData.name },
    });

    if (existing) {
      logger.warn(`Template ${templateData.name} already exists, skipping`);
      templates.push(existing);
      continue;
    }

    const template = templateRepo.create({
      ...templateData,
      templateData: createTemplateData(templateData.type),
    });

    await templateRepo.save(template);
    logger.info(`Created template: ${templateData.name} (${templateData.type})`);
    templates.push(template);
  }

  logger.info(`Total templates: ${templates.length}`);
  return templates;
}

/**
 * Seed sample labels
 */
async function seedLabels(products: Product[], templates: LabelTemplate[]) {
  logger.section('Seeding Sample Labels');

  const labelRepo = AppDataSource.getRepository(Label);
  const specRepo = AppDataSource.getRepository(LabelSpecification);

  const sampleLabels = [
    {
      product: products[0],
      template: templates[0],
      labelType: LabelType.PRODUCT,
      status: LabelStatus.DRAFT,
      notes: 'Initial draft for standard downlight',
    },
    {
      product: products[1],
      template: templates[0],
      labelType: LabelType.PRODUCT,
      status: LabelStatus.IN_DESIGN,
      notes: 'Working on design layout',
    },
    {
      product: products[3],
      template: templates[1],
      labelType: LabelType.PRODUCT,
      status: LabelStatus.REVIEW,
      notes: 'CCT selectable label ready for review',
      specs: {
        powerInput: '240V AC 50Hz',
        temperatureRating: '-20°C to +40°C',
        ipRating: 'IP65',
        cctOptions: '3000K / 4000K / 5700K',
      },
    },
    {
      product: products[5],
      template: templates[3],
      labelType: LabelType.PRODUCT,
      status: LabelStatus.APPROVED,
      approvedAt: new Date(),
      notes: 'Emergency lighting label approved',
      specs: {
        powerInput: '240V AC 50Hz',
        temperatureRating: '0°C to +35°C',
        ipRating: 'IP44',
        classRating: 'Class I',
        additionalSpecs: { batteryBackup: '3 hours', chargingTime: '24 hours' },
      },
    },
    {
      product: products[2],
      template: templates[0],
      labelType: LabelType.CARTON,
      status: LabelStatus.DRAFT,
      notes: 'Carton label for panel lights',
    },
  ];

  const labels: Label[] = [];

  for (const labelData of sampleLabels) {
    const { product, template, specs, ...restData } = labelData;

    // Check if label already exists
    const existing = await labelRepo.findOne({
      where: {
        productId: product.id,
        templateId: template.id,
        labelType: labelData.labelType,
      },
    });

    if (existing) {
      logger.warn(
        `Label for ${product.productCode} with ${template.name} already exists, skipping`
      );
      labels.push(existing);
      continue;
    }

    // Create label
    const labelInput: any = {
      labelType: restData.labelType,
      status: restData.status,
      notes: restData.notes,
      approvedAt: restData.approvedAt,
      productId: product.id,
      templateId: template.id,
      labelData: {
        design: {},
        fields: {
          productName: product.productName,
          productCode: product.productCode,
          gs1BarcodeNumber: product.gs1BarcodeNumber,
        },
        customizations: {},
      },
    };
    const label = labelRepo.create(labelInput) as unknown as Label;

    await labelRepo.save(label);

    // Create specifications if provided
    if (specs) {
      const specification = specRepo.create({
        labelId: label.id,
        ...specs,
      });
      await specRepo.save(specification);
    }

    logger.info(
      `Created label: ${product.productCode} - ${template.name} (${labelData.status})`
    );
    labels.push(label);
  }

  logger.info(`Total labels: ${labels.length}`);
  return labels;
}

/**
 * Main seed function
 */
async function seed() {
  try {
    logger.section('Starting Database Seed');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established');
    }

    // Run seeds in order
    const users = await seedUsers();
    const products = await seedProducts();
    const templates = await seedTemplates();
    const labels = await seedLabels(products, templates);

    logger.section('Seed Complete');
    logger.info('');
    logger.info('🎉 Database seeded successfully!');
    logger.info('');
    logger.info('Summary:');
    logger.info(`  Users:     ${users.length}`);
    logger.info(`  Products:  ${products.length}`);
    logger.info(`  Templates: ${templates.length}`);
    logger.info(`  Labels:    ${labels.length}`);
    logger.info('');
    logger.info('Test Credentials:');
    logger.info('  Admin:    admin@eyelighting.com.au / admin123');
    logger.info('  Engineer: engineer@eyelighting.com.au / engineer123');
    logger.info('  Designer: designer@eyelighting.com.au / designer123');
    logger.info('  Approver: approver@eyelighting.com.au / approver123');
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run seed
seed();
