import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { LabelTemplate } from '../entities/LabelTemplate.entity';
import { TemplateType } from '../types/enums';

async function createTemplates() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const templateRepository = AppDataSource.getRepository(LabelTemplate);

    // Find existing templates by name to update them
    const existingEmergency = await templateRepository.findOne({ where: { name: 'Emergency/TB Label' } });
    const existingStandard = await templateRepository.findOne({ where: { name: 'Standard Product Label' } });
    const existingCarton = await templateRepository.findOne({ where: { name: 'Carton Label' } });

    // Template 1: Emergency/TB Label (like L-Line 55W EM/TB)
    const emergencyTemplateData = {
      name: 'Emergency/TB Label',
      type: TemplateType.EMERGENCY,
      isActive: true,
      templateData: {
        width: 150,
        height: 100,
        elements: [
          // Top section - Product name and code
          {
            type: 'text',
            x: 10,
            y: 5,
            width: 90,
            height: 15,
            properties: {
              text: 'Product Name',
              fontSize: 12,
              fontWeight: 'bold',
              fill: '#000000',
            },
          },
          {
            type: 'text',
            x: 110,
            y: 5,
            width: 35,
            height: 15,
            properties: {
              text: 'Product Code',
              fontSize: 12,
              fontWeight: 'bold',
              fill: '#000000',
            },
          },
          // Middle section - Specifications
          {
            type: 'text',
            x: 10,
            y: 25,
            width: 135,
            height: 10,
            properties: {
              text: 'Power Input',
              fontSize: 9,
              fill: '#000000',
            },
          },
          {
            type: 'text',
            x: 10,
            y: 35,
            width: 135,
            height: 10,
            properties: {
              text: 'Temperature',
              fontSize: 9,
              fill: '#000000',
            },
          },
          // Bottom section - Ratings and symbols
          {
            type: 'text',
            x: 5,
            y: 50,
            width: 20,
            height: 12,
            properties: {
              text: 'IP Rating',
              fontSize: 8,
              fill: '#000000',
            },
          },
          {
            type: 'text',
            x: 30,
            y: 50,
            width: 25,
            height: 12,
            properties: {
              text: 'Class Rating',
              fontSize: 8,
              fill: '#000000',
            },
          },
          // Company name
          {
            type: 'text',
            x: 5,
            y: 70,
            width: 80,
            height: 10,
            properties: {
              text: 'EYE LIGHTING AUSTRALIA',
              fontSize: 8,
              fontWeight: 'bold',
              fill: '#000000',
            },
          },
          // Made in
          {
            type: 'text',
            x: 5,
            y: 82,
            width: 60,
            height: 8,
            properties: {
              text: 'Made in',
              fontSize: 7,
              fill: '#000000',
            },
          },
          // Barcode placeholder
          {
            type: 'rect',
            x: 95,
            y: 65,
            width: 50,
            height: 30,
            properties: {
              fill: '#f0f0f0',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
        ],
      },
    };

    const emergencyTemplate = existingEmergency
      ? Object.assign(existingEmergency, emergencyTemplateData)
      : templateRepository.create(emergencyTemplateData);

    // Template 2: Standard Product Label (compact version - like Hades label)
    const productLabelSmallData = {
      name: 'Standard Product Label',
      type: TemplateType.STANDARD,
      isActive: true,
      templateData: {
        width: 400,
        height: 250,
        elements: [
          // Black header bar - Product Name (left half)
          {
            type: 'rect',
            x: 0,
            y: 0,
            width: 200,
            height: 60,
            properties: {
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 20,
            y: 20,
            width: 160,
            height: 30,
            properties: {
              text: 'Product Name',
              fontSize: 18,
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          // Black header bar - Product Code (right half)
          {
            type: 'rect',
            x: 200,
            y: 0,
            width: 200,
            height: 60,
            properties: {
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 220,
            y: 20,
            width: 160,
            height: 30,
            properties: {
              text: 'Product Code',
              fontSize: 18,
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          // Logo placeholder area
          {
            type: 'rect',
            x: 15,
            y: 75,
            width: 80,
            height: 60,
            properties: {
              fill: '#f5f5f5',
              stroke: '#cccccc',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 35,
            y: 100,
            width: 40,
            height: 15,
            properties: {
              text: 'LOGO',
              fontSize: 10,
              fill: '#999999',
            },
          },
          // Description area
          {
            type: 'text',
            x: 110,
            y: 80,
            width: 280,
            height: 50,
            properties: {
              text: 'Description',
              fontSize: 11,
              fill: '#000000',
            },
          },
          // Bottom section - IP Rating
          {
            type: 'text',
            x: 15,
            y: 155,
            width: 60,
            height: 25,
            properties: {
              text: 'IP Rating',
              fontSize: 14,
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          // Class Rating
          {
            type: 'text',
            x: 85,
            y: 155,
            width: 70,
            height: 25,
            properties: {
              text: 'Class Rating',
              fontSize: 14,
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          // Barcode area
          {
            type: 'rect',
            x: 270,
            y: 145,
            width: 115,
            height: 80,
            properties: {
              fill: '#f0f0f0',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          // Company name
          {
            type: 'text',
            x: 15,
            y: 190,
            width: 200,
            height: 20,
            properties: {
              text: 'EYE LIGHTING AUSTRALIA',
              fontSize: 12,
              fontWeight: 'bold',
              fill: '#000000',
            },
          },
          // LOT NO
          {
            type: 'text',
            x: 15,
            y: 215,
            width: 80,
            height: 15,
            properties: {
              text: 'LOT NO:',
              fontSize: 10,
              fill: '#000000',
            },
          },
          // Made in China
          {
            type: 'text',
            x: 110,
            y: 215,
            width: 100,
            height: 15,
            properties: {
              text: 'Made in China',
              fontSize: 10,
              fill: '#000000',
            },
          },
        ],
      },
    };

    const productLabelSmall = existingStandard
      ? Object.assign(existingStandard, productLabelSmallData)
      : templateRepository.create(productLabelSmallData);

    // Template 3: Carton Label (larger version - like big Hades label)
    const cartonLabelData = {
      name: 'Carton Label',
      type: TemplateType.STANDARD,
      isActive: true,
      templateData: {
        width: 600,
        height: 375,
        elements: [
          // Black header bar - Product Name (left half)
          {
            type: 'rect',
            x: 0,
            y: 0,
            width: 300,
            height: 90,
            properties: {
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 30,
            y: 30,
            width: 240,
            height: 40,
            properties: {
              text: 'Product Name',
              fontSize: 26,
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          // Black header bar - Product Code (right half)
          {
            type: 'rect',
            x: 300,
            y: 0,
            width: 300,
            height: 90,
            properties: {
              fill: '#000000',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 330,
            y: 30,
            width: 240,
            height: 40,
            properties: {
              text: 'Product Code',
              fontSize: 26,
              fill: '#ffffff',
              fontWeight: 'bold',
            },
          },
          // Logo placeholder area
          {
            type: 'rect',
            x: 25,
            y: 110,
            width: 120,
            height: 90,
            properties: {
              fill: '#f5f5f5',
              stroke: '#cccccc',
              strokeWidth: 1,
            },
          },
          {
            type: 'text',
            x: 60,
            y: 148,
            width: 50,
            height: 20,
            properties: {
              text: 'LOGO',
              fontSize: 14,
              fill: '#999999',
            },
          },
          // Full description area
          {
            type: 'text',
            x: 165,
            y: 120,
            width: 420,
            height: 75,
            properties: {
              text: 'Description',
              fontSize: 16,
              fill: '#000000',
            },
          },
          // Bottom section - IP Rating
          {
            type: 'text',
            x: 25,
            y: 230,
            width: 90,
            height: 35,
            properties: {
              text: 'IP Rating',
              fontSize: 20,
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          // Class Rating
          {
            type: 'text',
            x: 130,
            y: 230,
            width: 100,
            height: 35,
            properties: {
              text: 'Class Rating',
              fontSize: 20,
              fill: '#000000',
              fontWeight: 'bold',
            },
          },
          // Barcode area
          {
            type: 'rect',
            x: 405,
            y: 215,
            width: 170,
            height: 120,
            properties: {
              fill: '#f0f0f0',
              stroke: '#000000',
              strokeWidth: 1,
            },
          },
          // Company name
          {
            type: 'text',
            x: 25,
            y: 285,
            width: 300,
            height: 30,
            properties: {
              text: 'EYE LIGHTING AUSTRALIA',
              fontSize: 18,
              fontWeight: 'bold',
              fill: '#000000',
            },
          },
          // LOT NO
          {
            type: 'text',
            x: 25,
            y: 325,
            width: 120,
            height: 20,
            properties: {
              text: 'LOT NO:',
              fontSize: 14,
              fill: '#000000',
            },
          },
          // Made in China
          {
            type: 'text',
            x: 165,
            y: 325,
            width: 150,
            height: 20,
            properties: {
              text: 'Made in China',
              fontSize: 14,
              fill: '#000000',
            },
          },
        ],
      },
    };

    const cartonLabel = existingCarton
      ? Object.assign(existingCarton, cartonLabelData)
      : templateRepository.create(cartonLabelData);

    await templateRepository.save([emergencyTemplate, productLabelSmall, cartonLabel]);

    console.log('✅ Templates created successfully!');
    console.log('- Emergency/TB Label');
    console.log('- Standard Product Label');
    console.log('- Carton Label');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error creating templates:', error);
    process.exit(1);
  }
}

createTemplates();
