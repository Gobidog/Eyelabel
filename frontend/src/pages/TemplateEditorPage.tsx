import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Paper,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { fabric } from 'fabric';
import { TemplateType } from '@/types';
import { templateService } from '@/services/template.service';
import { useNotifications } from '@/utils/notifications';
import { logger } from '@/utils/logger';

interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'table' | 'barcode' | 'image' | 'selectable-boxes';
  name: string;
  props: any;
}

const TemplateEditorPage: React.FC = () => {
  const notifications = useNotifications();
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Template metadata
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TemplateType>(TemplateType.STANDARD);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  // Canvas elements
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Preset templates
  const [presetTemplates] = useState([
    {
      id: 'outer-carton',
      name: 'Outer Carton Label',
      description: 'Table-based layout with product specs and symbols',
      type: TemplateType.STANDARD,
      width: 800,
      height: 600,
    },
    {
      id: 'carton-selectable',
      name: 'Carton Label (Selectable)',
      description: 'Black header with CCT/PWR selectable boxes',
      type: TemplateType.CCT_SELECTABLE,
      width: 800,
      height: 700,
    },
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#FFFFFF',
      });
      fabricCanvasRef.current = canvas;

      // Add grid
      addGrid(canvas);

      return () => {
        canvas.dispose();
      };
    }
  }, [width, height]);

  const addGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20;
    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(
        new fabric.Line([i * gridSize, 0, i * gridSize, height], {
          stroke: '#E0E0E0',
          selectable: false,
          evented: false,
        })
      );
    }
    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(
        new fabric.Line([0, i * gridSize, width, i * gridSize], {
          stroke: '#E0E0E0',
          selectable: false,
          evented: false,
        })
      );
    }
  };

  const loadPresetTemplate = (presetId: string) => {
    if (presetId === 'outer-carton') {
      loadOuterCartonTemplate();
    } else if (presetId === 'carton-selectable') {
      loadCartonSelectableTemplate();
    }
  };

  const loadOuterCartonTemplate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setName('Outer Carton Label');
    setDescription('Exact replica of outer carton label with table layout');
    setType(TemplateType.STANDARD);

    canvas.clear();
    canvas.setDimensions({ width: 600, height: 400 });
    addGrid(canvas);

    const startX = 50;
    const startY = 30;
    const totalWidth = 500;
    const totalHeight = 340;

    // OUTER TABLE BORDER
    const outerBorder = new fabric.Rect({
      left: startX,
      top: startY,
      width: totalWidth,
      height: totalHeight,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 3,
      selectable: false,
    });
    canvas.add(outerBorder);

    // ROW 1: Header with Product Name and Code (Height: 50px)
    const row1Height = 50;

    // Vertical divider for row 1 (splits into 2 cells)
    const row1Divider = new fabric.Line(
      [startX + totalWidth * 0.6, startY, startX + totalWidth * 0.6, startY + row1Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row1Divider);

    const productNameText = new fabric.Text('{{productName}}', {
      left: startX + 10,
      top: startY + 15,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(productNameText);

    const productCodeText = new fabric.Text('{{productCode}}', {
      left: startX + totalWidth * 0.6 + 20,
      top: startY + 15,
      fontSize: 18,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(productCodeText);

    // Horizontal line after row 1
    const row1Bottom = new fabric.Line(
      [startX, startY + row1Height, startX + totalWidth, startY + row1Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row1Bottom);

    // ROW 2: Specs and Product Image (Height: 100px)
    const row2Top = startY + row1Height;
    const row2Height = 100;

    // Vertical divider for row 2 (splits into 2 cells)
    const row2Divider = new fabric.Line(
      [startX + totalWidth * 0.6, row2Top, startX + totalWidth * 0.6, row2Top + row2Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row2Divider);

    const specsText = new fabric.Text('{{powerInput}}\n{{frequency}} tₐ= {{temperatureRating}} {{cctValue}}', {
      left: startX + 10,
      top: row2Top + 30,
      fontSize: 14,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(specsText);

    const productImageBox = new fabric.Rect({
      left: startX + totalWidth * 0.6 + 10,
      top: row2Top + 10,
      width: totalWidth * 0.4 - 30,
      height: row2Height - 20,
      fill: '#F0F0F0',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(productImageBox);

    const imageLabel = new fabric.Text('[Product\nDiagram]', {
      left: startX + totalWidth * 0.6 + 30,
      top: row2Top + 30,
      fontSize: 10,
      fill: '#999999',
      fontFamily: 'Arial',
      textAlign: 'center',
      selectable: false,
    });
    canvas.add(imageLabel);

    // Horizontal line after row 2
    const row2Bottom = new fabric.Line(
      [startX, row2Top + row2Height, startX + totalWidth, row2Top + row2Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row2Bottom);

    // ROW 3: Symbols and Barcode (Height: 120px)
    const row3Top = row2Top + row2Height;
    const row3Height = 120;

    const symbolCellWidth = totalWidth * 0.12;

    // Cell dividers for symbol cells
    for (let i = 1; i <= 3; i++) {
      const dividerX = startX + symbolCellWidth * i;
      const divider = new fabric.Line(
        [dividerX, row3Top, dividerX, row3Top + row3Height],
        {
          stroke: '#000000',
          strokeWidth: 3,
          selectable: false,
        }
      );
      canvas.add(divider);
    }

    // IP66 Symbol
    const ip66Text = new fabric.Text('{{ipRating}}', {
      left: startX + 10,
      top: row3Top + 45,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(ip66Text);

    // Class I Symbol
    const classText = new fabric.Text('{{classRating}}', {
      left: startX + symbolCellWidth + 5,
      top: row3Top + 45,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(classText);

    // Warning Symbol Triangle (cell 3)
    const trianglePoints = [
      { x: startX + symbolCellWidth * 2 + 30, y: row3Top + 20 },
      { x: startX + symbolCellWidth * 2 + 10, y: row3Top + 60 },
      { x: startX + symbolCellWidth * 2 + 50, y: row3Top + 60 },
    ];
    const triangle = new fabric.Polygon(trianglePoints, {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: false,
    });
    canvas.add(triangle);

    const exclamation = new fabric.Text('!', {
      left: startX + symbolCellWidth * 2 + 25,
      top: row3Top + 35,
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(exclamation);

    // Recycling Symbol (cell 4)
    const recycleCircle = new fabric.Circle({
      left: startX + symbolCellWidth * 3 + 15,
      top: row3Top + 30,
      radius: 25,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: false,
    });
    canvas.add(recycleCircle);

    const recycleSymbol = new fabric.Text('♻', {
      left: startX + symbolCellWidth * 3 + 22,
      top: row3Top + 35,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(recycleSymbol);

    // Barcode area (right side)
    const barcodeArea = new fabric.Rect({
      left: startX + symbolCellWidth * 4 + 10,
      top: row3Top + 20,
      width: totalWidth - symbolCellWidth * 4 - 20,
      height: 80,
      fill: '#F5F5F5',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(barcodeArea);

    const barcodeText = new fabric.Text('{{barcode}}', {
      left: startX + symbolCellWidth * 4 + 40,
      top: row3Top + 50,
      fontSize: 12,
      fill: '#666666',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(barcodeText);

    // Horizontal line after row 3
    const row3Bottom = new fabric.Line(
      [startX, row3Top + row3Height, startX + totalWidth, row3Top + row3Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row3Bottom);

    // ROW 4: Branding Footer (Height: 70px)
    const row4Top = row3Top + row3Height;
    const row4Height = totalHeight - (row1Height + row2Height + row3Height);

    // Vertical divider for row 4
    const row4Divider = new fabric.Line(
      [startX + totalWidth * 0.6, row4Top, startX + totalWidth * 0.6, row4Top + row4Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row4Divider);

    const brandingText = new fabric.Text('EYE LIGHTING AUSTRALIA', {
      left: startX + 10,
      top: row4Top + 20,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(brandingText);

    const madeInText = new fabric.Text('Made in {{madeIn}}', {
      left: startX + totalWidth * 0.6 + 20,
      top: row4Top + 20,
      fontSize: 12,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(madeInText);

    canvas.renderAll();
  };

  const loadCartonSelectableTemplate = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setName('Carton Label with Selectable Options');
    setDescription('Exact replica of carton label with CCT/PWR selectable boxes');
    setType(TemplateType.CCT_SELECTABLE);

    canvas.clear();
    canvas.setDimensions({ width: 700, height: 650 });
    addGrid(canvas);

    const startX = 50;
    const startY = 30;
    const totalWidth = 600;
    const totalHeight = 590;

    // OUTER TABLE BORDER
    const outerBorder = new fabric.Rect({
      left: startX,
      top: startY,
      width: totalWidth,
      height: totalHeight,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 3,
      selectable: false,
    });
    canvas.add(outerBorder);

    // ROW 1: Black Header with Product Name and Code (Height: 50px)
    const row1Height = 50;

    // Black background for header
    const headerBg = new fabric.Rect({
      left: startX,
      top: startY,
      width: totalWidth,
      height: row1Height,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 3,
      selectable: false,
    });
    canvas.add(headerBg);

    // Vertical divider for row 1
    const row1Divider = new fabric.Line(
      [startX + totalWidth * 0.7, startY, startX + totalWidth * 0.7, startY + row1Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row1Divider);

    const productNameWhite = new fabric.Text('{{productName}}', {
      left: startX + 15,
      top: startY + 15,
      fontSize: 18,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(productNameWhite);

    const productCodeWhite = new fabric.Text('{{productCode}}', {
      left: startX + totalWidth * 0.7 + 15,
      top: startY + 15,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(productCodeWhite);

    // Horizontal line after row 1
    const row1Bottom = new fabric.Line(
      [startX, startY + row1Height, startX + totalWidth, startY + row1Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row1Bottom);

    // ROW 2: Product Image and CCT Selectable (Height: 150px)
    const row2Top = startY + row1Height;
    const row2Height = 150;

    // Vertical divider for row 2 (40% left, 60% right)
    const row2Divider = new fabric.Line(
      [startX + totalWidth * 0.4, row2Top, startX + totalWidth * 0.4, row2Top + row2Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row2Divider);

    // Product Image placeholder (left cell)
    const imagePlaceholder = new fabric.Rect({
      left: startX + 15,
      top: row2Top + 15,
      width: totalWidth * 0.4 - 30,
      height: row2Height - 30,
      fill: '#F0F0F0',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(imagePlaceholder);

    const imageLabel = new fabric.Text('[Product\nImage]', {
      left: startX + totalWidth * 0.2 - 25,
      top: row2Top + row2Height / 2 - 15,
      fontSize: 12,
      fill: '#999999',
      fontFamily: 'Arial',
      textAlign: 'center',
      selectable: false,
    });
    canvas.add(imageLabel);

    // CCT Selectable section (right cell)
    const cctStartX = startX + totalWidth * 0.4;
    const cctWidth = totalWidth * 0.6;
    const cctHeaderHeight = 35;

    // CCT black header
    const cctHeaderBg = new fabric.Rect({
      left: cctStartX,
      top: row2Top,
      width: cctWidth,
      height: cctHeaderHeight,
      fill: '#000000',
      selectable: false,
    });
    canvas.add(cctHeaderBg);

    const cctHeaderText = new fabric.Text('CCT Selectable', {
      left: cctStartX + 10,
      top: row2Top + 8,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(cctHeaderText);

    // Horizontal line after CCT header
    const cctHeaderBottom = new fabric.Line(
      [cctStartX, row2Top + cctHeaderHeight, cctStartX + cctWidth, row2Top + cctHeaderHeight],
      {
        stroke: '#000000',
        strokeWidth: 2,
        selectable: false,
      }
    );
    canvas.add(cctHeaderBottom);

    // CCT boxes area
    const cctBoxesTop = row2Top + cctHeaderHeight;
    const cctBoxesHeight = row2Height - cctHeaderHeight;
    const cctBoxWidth = cctWidth / 3;

    // CCT box dividers
    for (let i = 1; i < 3; i++) {
      const divider = new fabric.Line(
        [cctStartX + cctBoxWidth * i, cctBoxesTop, cctStartX + cctBoxWidth * i, cctBoxesTop + cctBoxesHeight],
        {
          stroke: '#000000',
          strokeWidth: 2,
          selectable: false,
        }
      );
      canvas.add(divider);
    }

    // CCT box labels
    const cctOptions = ['3000K', '4000K', '5000K'];
    cctOptions.forEach((option, index) => {
      const text = new fabric.Text(option, {
        left: cctStartX + cctBoxWidth * index + cctBoxWidth / 2 - 25,
        top: cctBoxesTop + cctBoxesHeight / 2 - 10,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        fontFamily: 'Arial',
        selectable: false,
      });
      canvas.add(text);
    });

    // Horizontal line after row 2
    const row2Bottom = new fabric.Line(
      [startX, row2Top + row2Height, startX + totalWidth, row2Top + row2Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row2Bottom);

    // ROW 3: Specs and PWR Selectable (Height: 150px)
    const row3Top = row2Top + row2Height;
    const row3Height = 150;

    // Vertical divider for row 3 (40% left, 60% right)
    const row3Divider = new fabric.Line(
      [startX + totalWidth * 0.4, row3Top, startX + totalWidth * 0.4, row3Top + row3Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row3Divider);

    // Specs text (left cell)
    const specsText = new fabric.Text('{{powerInput}}\n{{frequency}}\ntₐ= {{temperatureRating}}\n{{cctValue}}', {
      left: startX + 15,
      top: row3Top + 30,
      fontSize: 14,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(specsText);

    // PWR Selectable section (right cell)
    const pwrStartX = startX + totalWidth * 0.4;
    const pwrWidth = totalWidth * 0.6;
    const pwrHeaderHeight = 35;

    // PWR black header
    const pwrHeaderBg = new fabric.Rect({
      left: pwrStartX,
      top: row3Top,
      width: pwrWidth,
      height: pwrHeaderHeight,
      fill: '#000000',
      selectable: false,
    });
    canvas.add(pwrHeaderBg);

    const pwrHeaderText = new fabric.Text('PWR Selectable', {
      left: pwrStartX + 10,
      top: row3Top + 8,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(pwrHeaderText);

    // Horizontal line after PWR header
    const pwrHeaderBottom = new fabric.Line(
      [pwrStartX, row3Top + pwrHeaderHeight, pwrStartX + pwrWidth, row3Top + pwrHeaderHeight],
      {
        stroke: '#000000',
        strokeWidth: 2,
        selectable: false,
      }
    );
    canvas.add(pwrHeaderBottom);

    // PWR boxes area
    const pwrBoxesTop = row3Top + pwrHeaderHeight;
    const pwrBoxesHeight = row3Height - pwrHeaderHeight;
    const pwrBoxWidth = pwrWidth / 3;

    // PWR box dividers
    for (let i = 1; i < 3; i++) {
      const divider = new fabric.Line(
        [pwrStartX + pwrBoxWidth * i, pwrBoxesTop, pwrStartX + pwrBoxWidth * i, pwrBoxesTop + pwrBoxesHeight],
        {
          stroke: '#000000',
          strokeWidth: 2,
          selectable: false,
        }
      );
      canvas.add(divider);
    }

    // PWR box labels
    const pwrOptions = ['75W', '112W', '150W'];
    pwrOptions.forEach((option, index) => {
      const text = new fabric.Text(option, {
        left: pwrStartX + pwrBoxWidth * index + pwrBoxWidth / 2 - 20,
        top: pwrBoxesTop + pwrBoxesHeight / 2 - 10,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
        fontFamily: 'Arial',
        selectable: false,
      });
      canvas.add(text);
    });

    // Horizontal line after row 3
    const row3Bottom = new fabric.Line(
      [startX, row3Top + row3Height, startX + totalWidth, row3Top + row3Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row3Bottom);

    // ROW 4: Symbols and Barcode (Height: 120px)
    const row4Top = row3Top + row3Height;
    const row4Height = 120;

    const symbolCellWidth = totalWidth * 0.12;

    // Cell dividers for symbol cells (3 symbols)
    for (let i = 1; i <= 2; i++) {
      const dividerX = startX + symbolCellWidth * i;
      const divider = new fabric.Line(
        [dividerX, row4Top, dividerX, row4Top + row4Height],
        {
          stroke: '#000000',
          strokeWidth: 3,
          selectable: false,
        }
      );
      canvas.add(divider);
    }

    // Divider between symbols and barcode
    const barcodeStartX = startX + symbolCellWidth * 3;
    const symbolBarcodeDiv = new fabric.Line(
      [barcodeStartX, row4Top, barcodeStartX, row4Top + row4Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(symbolBarcodeDiv);

    // IP66 Symbol
    const ip66Text = new fabric.Text('{{ipRating}}', {
      left: startX + 15,
      top: row4Top + 50,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(ip66Text);

    // Class I Symbol
    const classText = new fabric.Text('{{classRating}}', {
      left: startX + symbolCellWidth + 10,
      top: row4Top + 45,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(classText);

    // Warning Triangle Symbol
    const trianglePoints = [
      { x: startX + symbolCellWidth * 2 + 36, y: row4Top + 30 },
      { x: startX + symbolCellWidth * 2 + 16, y: row4Top + 70 },
      { x: startX + symbolCellWidth * 2 + 56, y: row4Top + 70 },
    ];
    const triangle = new fabric.Polygon(trianglePoints, {
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: false,
    });
    canvas.add(triangle);

    const exclamation = new fabric.Text('!', {
      left: startX + symbolCellWidth * 2 + 31,
      top: row4Top + 45,
      fontSize: 18,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(exclamation);

    // Barcode area
    const barcodeArea = new fabric.Rect({
      left: barcodeStartX + 15,
      top: row4Top + 25,
      width: totalWidth - symbolCellWidth * 3 - 30,
      height: 70,
      fill: '#F5F5F5',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(barcodeArea);

    const barcodeText = new fabric.Text('{{barcode}}', {
      left: barcodeStartX + 50,
      top: row4Top + 55,
      fontSize: 12,
      fill: '#666666',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(barcodeText);

    // Horizontal line after row 4
    const row4Bottom = new fabric.Line(
      [startX, row4Top + row4Height, startX + totalWidth, row4Top + row4Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row4Bottom);

    // ROW 5: Footer with Branding, LOT NO, Made In (Height: remaining)
    const row5Top = row4Top + row4Height;
    const row5Height = totalHeight - (row1Height + row2Height + row3Height + row4Height);

    // Two vertical dividers for 3 cells
    const row5Divider1 = new fabric.Line(
      [startX + totalWidth * 0.5, row5Top, startX + totalWidth * 0.5, row5Top + row5Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row5Divider1);

    const row5Divider2 = new fabric.Line(
      [startX + totalWidth * 0.75, row5Top, startX + totalWidth * 0.75, row5Top + row5Height],
      {
        stroke: '#000000',
        strokeWidth: 3,
        selectable: false,
      }
    );
    canvas.add(row5Divider2);

    // Branding text
    const brandingText = new fabric.Text('EYE LIGHTING\nAUSTRALIA', {
      left: startX + 15,
      top: row5Top + 20,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(brandingText);

    // LOT NO
    const lotText = new fabric.Text('LOT NO:\n{{lotNumber}}', {
      left: startX + totalWidth * 0.5 + 10,
      top: row5Top + 20,
      fontSize: 11,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(lotText);

    // Made In
    const madeInText = new fabric.Text('Made in\n{{madeIn}}', {
      left: startX + totalWidth * 0.75 + 10,
      top: row5Top + 20,
      fontSize: 11,
      fill: '#000000',
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(madeInText);

    canvas.renderAll();
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const templateData = {
        width,
        height,
        elements: fabricCanvasRef.current.getObjects().map((obj: any) => ({
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          text: obj.text,
          rx: obj.rx,
          ry: obj.ry,
          radius: obj.radius,
        })),
        backgroundColor: '#FFFFFF',
      };

      await templateService.create({
        name,
        type,
        templateData: templateData as any,
      });

      notifications.success('Template saved successfully!');
      navigate('/templates');
    } catch (error) {
      logger.error('Error saving template:', error);
      notifications.error('Failed to save template');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/templates')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4">Create Label Template</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Template Settings */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Template Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Template Type"
              value={type}
              onChange={(e) => setType(e.target.value as TemplateType)}
              sx={{ mb: 2 }}
            >
              <MenuItem value={TemplateType.STANDARD}>Standard</MenuItem>
              <MenuItem value={TemplateType.CCT_SELECTABLE}>CCT Selectable</MenuItem>
              <MenuItem value={TemplateType.POWER_SELECTABLE}>Power Selectable</MenuItem>
              <MenuItem value={TemplateType.EMERGENCY}>Emergency</MenuItem>
            </TextField>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Width (px)"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Height (px)"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Preset Templates
            </Typography>
            <List dense>
              {presetTemplates.map((preset) => (
                <ListItem key={preset.id} disablePadding>
                  <ListItemButton onClick={() => loadPresetTemplate(preset.id)}>
                    <ListItemText
                      primary={preset.name}
                      secondary={preset.description}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!name}
            >
              Save Template
            </Button>
          </Paper>
        </Grid>

        {/* Center Panel - Canvas */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Template Canvas
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Use the preset templates on the left to load standard label formats.
              Variables like {'{'}{'{'} productName{'}'}{'}'} will be replaced with actual data when generating labels.
            </Alert>
            <Box sx={{ border: '1px solid #ddd', display: 'inline-block', backgroundColor: '#f5f5f5' }}>
              <canvas ref={canvasRef} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateEditorPage;
