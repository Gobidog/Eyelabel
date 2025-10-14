# Manual Testing Instructions - Phase 2 Batch Label Generation

## Quick Start

**URL:** http://192.168.50.61:3002/labels/batch  
**Sample CSV:** `/mnt/shareproj/Shared Projects Coder/Projects/Eye/test-data/sample-products-valid.csv`

**Login Credentials:**
- Email: admin@eyelighting.com.au
- Password: admin123

---

## Step-by-Step Testing Procedure

### Step 1: Login (if needed)
1. Navigate to http://192.168.50.61:3002
2. If not logged in, enter credentials above
3. Verify you see "Admin User (Admin)" in the top-right

**Expected Result:** ✅ Dashboard page loads

---

### Step 2: Navigate to Batch Labels
1. Click "Batch Labels" button in the top navigation bar
2. Verify URL changes to `/labels/batch`

**Expected Result:** 
- ✅ 4-step progress indicator visible
- ✅ Step 1 "Upload CSV" is active/highlighted
- ✅ Blue "Upload CSV File" button visible
- ✅ Instruction text below button

**Screenshot:** Take `step1-upload-page.png`

---

### Step 3: Upload CSV File
1. Click the "Upload CSV File" button
2. File dialog opens
3. Navigate to: `/mnt/shareproj/Shared Projects Coder/Projects/Eye/test-data/`
4. Select: `sample-products-valid.csv`
5. Click "Open"

**Expected Result:**
- ✅ Page automatically advances to Step 2 "Map Columns"
- ✅ Blue info alert shows: "Found 3 rows in CSV. Map the columns to the required label fields."
- ✅ 10 dropdown fields visible for column mapping

**Screenshot:** Take `step2-column-mapping.png`

**If Error Occurs:**
- File too large: "File size exceeds 10MB limit"
- Too many rows: "CSV contains X rows. Maximum allowed is 500 rows"
- Empty file: "CSV file is empty"

---

### Step 4: Map Columns
The CSV headers should auto-match. Verify each dropdown shows:

| Field Name | Selected CSV Column |
|-----------|-------------------|
| product Name | productName |
| product Code | productCode |
| gs1 Barcode Number | gs1BarcodeNumber |
| power Input | powerInput |
| temperature Rating | temperatureRating |
| ip Rating | ipRating |
| class Rating | classRating |
| frequency | frequency |
| cct Value | cctValue |
| made In | madeIn |

**Actions:**
1. Verify all dropdowns are populated (not showing "None")
2. Click "Continue to Generation" button

**Expected Result:**
- ✅ Page advances to Step 3 "Generate Labels"
- ✅ Blue info alert: "Ready to generate 3 carton labels"
- ✅ "Generate All Labels" button visible

**Screenshot:** Take `step3-ready-to-generate.png`

---

### Step 5: Generate Labels
1. Click "Generate All Labels" button
2. Watch progress bar

**Expected Result:**
- ✅ Progress bar appears: 0% → 33% → 66% → 100%
- ✅ Progress text: "Generating labels... 0%" → "33%" → "67%" → "100%"
- ✅ Generation completes in ~2-5 seconds
- ✅ Page automatically advances to Step 4 "Download PDFs"

**Screenshot:** Take `step3-generating-progress.png` (during generation if possible)

**Console Check:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Expected: No red errors (only normal logs)

---

### Step 6: Review Generated Labels
After generation completes, verify:

**Success Banner:**
- ✅ Green success alert: "Successfully generated 3 labels"

**Download Button:**
- ✅ "Download All as PDF" button visible and enabled

**Label Grid:**
Three cards should be visible, each showing:
- ✅ Label preview image (800x600px)
- ✅ Product name below image
- ✅ Green checkmark icon
- ✅ "Generated" status in green
- ✅ Small download icon button

**Label Details to Verify:**
Each label image should contain:
1. Product name at top (bold, large)
2. Product code below name
3. Specifications box with border
4. Barcode image (EAN-13 format)
5. Four symbol icons (IP rating, Class, Recycle, Bin)
6. "EYE LIGHTING AUSTRALIA" branding at bottom
7. "Made in China" text

**Screenshot:** Take `step4-labels-generated.png` (full page)

---

### Step 7: Download PDFs

#### Test A: Download All
1. Click "Download All as PDF" button
2. Wait for download

**Expected Result:**
- ✅ PDF file downloads: `carton-labels-batch-[timestamp].pdf`
- ✅ File size: ~300-500 KB
- ✅ Opens in PDF viewer
- ✅ Contains 3 pages (one per label)
- ✅ Each page is A4 landscape
- ✅ Labels are high quality (not pixelated)

**Screenshot:** Take `pdf-all-labels.png` (PDF open in viewer)

#### Test B: Download Individual
1. Click the small download icon on first label card
2. Wait for download

**Expected Result:**
- ✅ PDF downloads: `label-L-Line-55W-EM-TB.pdf`
- ✅ Contains 1 page with that specific label
- ✅ High quality rendering

---

### Step 8: Start New Batch
1. Click "Start New Batch" button at bottom

**Expected Result:**
- ✅ Page returns to Step 1 "Upload CSV"
- ✅ All form data cleared
- ✅ Ready for new upload

**Screenshot:** Take `step1-reset.png`

---

## Error Testing (Optional Advanced Tests)

### Test: File Too Large
1. Create large CSV > 10MB
2. Upload it

**Expected:** Red error alert "File size exceeds 10MB limit"

### Test: Too Many Rows
1. Create CSV with > 500 rows
2. Upload it

**Expected:** Red error alert "CSV contains X rows. Maximum allowed is 500"

### Test: Invalid Barcode
1. Edit CSV, change barcode to invalid number (e.g., "1234567890123")
2. Upload and process

**Expected:** Label generation fails with error status, error message shown

### Test: Empty CSV
1. Create CSV with only headers, no data rows
2. Upload it

**Expected:** Red error "CSV file is empty"

---

## Success Criteria Checklist

Mark each item as you verify:

- [ ] All 4 steps accessible
- [ ] CSV upload works
- [ ] Column mapping displays correctly
- [ ] 3 labels generate successfully
- [ ] All labels show valid barcodes
- [ ] Progress bar updates correctly
- [ ] No console errors
- [ ] Download All PDF works
- [ ] Individual PDF download works
- [ ] All label elements present (name, code, specs, barcode, symbols, branding)
- [ ] "Start New Batch" resets properly
- [ ] File size validation works
- [ ] Row count validation works

---

## Troubleshooting

### Issue: Upload button does nothing
**Solution:** Check browser console for errors, try different browser

### Issue: Column mapping empty
**Solution:** Check CSV format, ensure headers are present

### Issue: Labels fail to generate
**Solution:** 
1. Check browser console for errors
2. Verify backend is running: `docker ps | grep label-backend`
3. Test barcode API manually: See test-results-phase2.md

### Issue: Barcode not rendering
**Solution:**
1. Verify backend API: `curl http://192.168.50.61:4000/api/barcode/generate`
2. Check console for barcode generation errors
3. Verify barcodes are valid EAN-13 format

### Issue: PDF download fails
**Solution:**
1. Check browser download settings
2. Verify labels generated successfully first
3. Try individual download instead of batch

---

## Test Data Files

| File | Purpose | Barcodes |
|------|---------|----------|
| `sample-products-valid.csv` | ✅ Valid test data | Valid EAN-13 check digits |
| `sample-products.csv` | ❌ Invalid (will fail) | Invalid check digits |

**Always use:** `sample-products-valid.csv` for testing

---

## Contact & Support

If issues occur during testing:
1. Document the error message
2. Take screenshot
3. Check browser console (F12)
4. Note which step failed
5. Report findings with screenshots

**Test Report Location:** `/mnt/shareproj/Shared Projects Coder/Projects/Eye/test-results-phase2.md`
