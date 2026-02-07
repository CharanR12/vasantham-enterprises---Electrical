import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types/inventory';
import { format, parseISO } from 'date-fns';

// Number to Words for Indian formatting
const priceInWords = (price: number) => {
    var sglDigit = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
        dblDigit = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
        tensPlace = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    var str = "",
        n = Math.floor(price);

    var digit_1 = n % 10;
    n = Math.floor(n / 10);
    var digit_2 = n % 10;
    n = Math.floor(n / 10);
    var digit_3 = n % 10;
    n = Math.floor(n / 10);

    // Hundreds
    if (digit_3 > 0) {
        str = sglDigit[digit_3] + " Hundred " + str;
    }

    // Thousands
    var digit_4 = n % 10;
    n = Math.floor(n / 10);
    var digit_5 = n % 10;
    n = Math.floor(n / 10);

    if (digit_5 > 0 || digit_4 > 0) {
        if (digit_5 === 1) str = dblDigit[digit_4] + " Thousand " + str;
        else if (digit_5 === 0) str = sglDigit[digit_4] + " Thousand " + str;
        else str = tensPlace[digit_5] + " " + sglDigit[digit_4] + " Thousand " + str;
    }

    // Lakhs
    var digit_6 = n % 10;
    n = Math.floor(n / 10);
    var digit_7 = n % 10;
    n = Math.floor(n / 10);

    if (digit_7 > 0 || digit_6 > 0) {
        if (digit_7 === 1) str = dblDigit[digit_6] + " Lakh " + str;
        else if (digit_7 === 0) str = sglDigit[digit_6] + " Lakh " + str;
        else str = tensPlace[digit_7] + " " + sglDigit[digit_6] + " Lakh " + str;
    }

    // Tens and Units for the end
    var finalStr = str;
    if (digit_2 > 0 || digit_1 > 0) {
        if (digit_2 === 1) finalStr += dblDigit[digit_1];
        else if (digit_2 === 0) finalStr += sglDigit[digit_1];
        else finalStr += tensPlace[digit_2] + " " + sglDigit[digit_1];
    }

    return "Rupees " + finalStr + " Only";
}


export const generateInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Design Config
    const mLeft = 14;
    const mRight = 14;
    const mTop = 15;
    const contentWidth = pageWidth - mLeft - mRight;
    // Brand Color: Black
    const primaryColor: [number, number, number] = [0, 0, 0];

    // Helper for formatting currency
    const formatCurrency = (amount: number) => amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // Helper to format quantity
    const formatQty = (qty: number) => qty.toFixed(3).replace(/\.?0+$/, "");

    // --- Border ---
    doc.setLineWidth(0.4);
    doc.setDrawColor(0);
    // We will draw the main rect later or continuously
    // Let's draw the top part header manually

    // --- Header ---
    let currentY = mTop + 8;

    // GSTIN & Contact
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN: 33AHOPG7790A1ZD", mLeft + 4, currentY);

    doc.text("(ORIGINAL)", pageWidth - mRight - 4, currentY - 2, { align: 'right' });
    doc.text("PHONE: 0424 - 2210366", pageWidth - mRight - 4, currentY + 3, { align: 'right' });

    currentY += 12;

    // Company Name
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VASANTHAM ENTERPRISES", pageWidth / 2, currentY, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset

    currentY += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("366-C SATHY ROAD, ERODE-3", pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    // QUOTATION Title with underline
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("QUOTATION", pageWidth / 2, currentY, { align: 'center' });
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 16, currentY + 1.5, pageWidth / 2 + 16, currentY + 1.5);
    doc.setDrawColor(0); // Reset

    currentY += 6;
    doc.setLineWidth(0.4);
    doc.line(mLeft, currentY, pageWidth - mRight, currentY);

    // --- Details Section (GridBox) ---
    const boxHeight = 28;
    const midX = pageWidth / 2 + 10;

    // Vertical Divider
    doc.line(midX, currentY, midX, currentY + boxHeight);

    // Left Side: Customer Details
    let leftY = currentY + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("To.", mLeft + 3, leftY);

    doc.setFontSize(10);
    doc.text((invoice.customerName || "Customer").toUpperCase(), mLeft + 12, leftY);

    if (invoice.companyName) {
        doc.setFont("helvetica", "normal");
        doc.text(invoice.companyName.toUpperCase(), mLeft + 12, leftY + 5);
    }

    // Right Side: Quotation Details
    let rightY = currentY + 6;
    const labelX = midX + 3;
    const valueX = midX + 35;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    doc.text("Payment Terms", labelX, rightY);
    doc.text(":  Cash", valueX, rightY);

    doc.text("No", labelX, rightY + 5);
    // Prefix Logic: Replace INV- with QTN-
    const qtnNumber = invoice.invoiceNumber.replace(/^INV-/, 'QTN-');
    doc.text(`:  ${qtnNumber}`, valueX, rightY + 5);

    doc.text("Date", labelX, rightY + 10);
    const invDate = invoice.createdAt ? format(parseISO(invoice.createdAt), 'dd-MM-yyyy') : format(new Date(), 'dd-MM-yyyy');
    doc.text(`:  ${invDate}`, valueX, rightY + 10);

    currentY += boxHeight;
    doc.line(mLeft, currentY, pageWidth - mRight, currentY);

    // --- Items Table ---
    // Calculate widths for manual lines
    const colWidths = [12, 0, 22, 28, 32];
    const fixedSum = colWidths.reduce((a, b) => a + b, 0); // Excluding 0
    const autoWidth = contentWidth - fixedSum;
    colWidths[1] = autoWidth;

    const verticalLineX: number[] = [];
    let curX = mLeft;
    colWidths.forEach(w => {
        verticalLineX.push(curX);
        curX += w;
    });
    verticalLineX.push(curX); // Final border X

    const tableColumn = ["S.No", "Description", "Qty", "Rate", "Total Amount"];
    const tableRows: any[] = [];

    let totalQuantity = 0;

    invoice.items.forEach((item, index) => {
        totalQuantity += item.quantity;
        tableRows.push([
            index + 1,
            `${item.productName} ${item.modelNumber}`.toUpperCase(),
            `${item.quantity} ${item.productName.toLowerCase().includes('coil') ? 'COIL' : 'NOS'}`,
            formatCurrency(item.salePrice),
            formatCurrency(item.lineTotal)
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: 'middle',
            textColor: 0,
            lineColor: 0,
            lineWidth: 0.2,
            font: 'helvetica',
            fontStyle: 'bold'
        },
        headStyles: {
            fillColor: false, // No Fill
            textColor: 0,
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.2,
            lineColor: 0
        },
        columnStyles: {
            0: { cellWidth: colWidths[0], halign: 'center' },
            1: { cellWidth: colWidths[1] },
            2: { cellWidth: colWidths[2], halign: 'center' },
            3: { cellWidth: colWidths[3], halign: 'right' },
            4: { cellWidth: colWidths[4], halign: 'right' }
        },
        margin: { left: mLeft, right: mRight },
    });

    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 0.5; // Small adjustment

    // --- Footer Placement Check ---
    // We need 45 units for the footer section (Total Row + Tax + NetAmount + Words)
    const footerNeededHeight = 45;
    const bottomLineY = pageHeight - mTop - footerNeededHeight;

    // If overlap, New Page
    if (finalY > bottomLineY) {
        doc.addPage();
        finalY = mTop;
        // Redraw top border for continuity concept? 
        // For now, just reset Y.
    }

    // Draw Main Border Rect up to bottomLineY
    doc.setLineWidth(0.4);
    // Top, Left, Right are continuous. Bottom is at bottomLineY (Total Row Start)
    doc.rect(mLeft, mTop, contentWidth, bottomLineY - mTop);


    // --- Extend Columns to Bottom ---
    doc.setLineWidth(0.2);
    doc.setDrawColor(0);
    if (finalY < bottomLineY) {
        // Draw vertical lines for columns
        // Skip first and last if they overlap with page border
        // Indices: 1, 2, 3, 4 (internal lines)
        // verticalLineX: [start, col1end, col2end, col3end, col4end, end]
        // We draw indices 1, 2, 3, 4
        for (let i = 1; i < verticalLineX.length - 1; i++) {
            doc.line(verticalLineX[i], finalY, verticalLineX[i], bottomLineY);
        }
    }

    // --- Footer Section ---
    let footerY = bottomLineY;

    // 1. Total Row
    const totalRowHeight = 7;

    // Draw Total Row Border (Top line of this row is bottom of main table)
    doc.line(mLeft, footerY, pageWidth - mRight, footerY); // Border Top
    doc.line(mLeft, footerY + totalRowHeight, pageWidth - mRight, footerY + totalRowHeight); // Border Bottom

    // Vertical Lines in Total Row
    // Divider for Qty (index 2 end -> verticalLineX[3])?
    // Wait, Qty is Col 2 (Index 2). 
    // verticalLineX: [0:SNo, 1:Desc, 2:Qty, 3:Rate, 4:Amount] -> Ends are [1, 2, 3, 4, 5]
    // Qty is between verticalLineX[2] and verticalLineX[3]
    // Amount is between verticalLineX[4] and verticalLineX[5]

    // We want to box the Qty and Amount in the Total Row? 
    // Screenshot shows lines extending down.
    // So draw lines at verticalLineX[3] (End of Qty) and verticalLineX[4] (Start of Amount)
    // Also verticalLineX[2] (Start of Qty / End of Desc)

    doc.line(verticalLineX[2], footerY, verticalLineX[2], footerY + totalRowHeight); // Separator before Qty
    doc.line(verticalLineX[3], footerY, verticalLineX[3], footerY + totalRowHeight); // Separator after Qty
    doc.line(verticalLineX[4], footerY, verticalLineX[4], footerY + totalRowHeight); // Separator before Amount

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total", mLeft + 5, footerY + 5);

    // Total Qty
    // Center in Qty Column
    const qtyCenter = verticalLineX[2] + (colWidths[2] / 2);
    doc.text(formatQty(totalQuantity), qtyCenter, footerY + 5, { align: 'center' });

    const totalAmount = invoice.totalAmount;
    doc.text(formatCurrency(totalAmount), pageWidth - mRight - 2, footerY + 5, { align: 'right' });


    // 2. Tax Breakdown
    // Header Row
    const taxHeaderY = footerY + totalRowHeight;
    const taxHeaderHeight = 6;
    const taxValueHeight = 7;

    // Current layout width is contentWidth.
    // Columns: Taxable Value, CGST%, AMT, SGST%, AMT, NET%, AMT
    // Widths approx: [25, 12, 18, 12, 18, 12, 18] (Total ~115, remaining spread)
    // Actually, let's use equal spacing or approximate.

    // Draw horizontal line after headers
    doc.line(mLeft, taxHeaderY + taxHeaderHeight, pageWidth - mRight, taxHeaderY + taxHeaderHeight);

    // Headers Text
    const taxYText = taxHeaderY + 4;
    doc.setFontSize(8);

    // We need to figure out X positions.
    // Let's create a mini layout helper
    // Total 7 columns.
    const taxColX = [
        mLeft + 2, // Taxable Value
        mLeft + 35, // CGST%
        mLeft + 50, // AMT
        mLeft + 75, // SGST%
        mLeft + 90, // AMT
        mLeft + 115, // NET%
        mLeft + 130  // AMT
    ];

    doc.text("Taxable Value", taxColX[0], taxYText);
    doc.text("CGST%", taxColX[1], taxYText);
    doc.text("AMT", taxColX[2], taxYText);
    doc.text("SGST%", taxColX[3], taxYText);
    doc.text("AMT", taxColX[4], taxYText);
    doc.text("NET%", taxColX[5], taxYText);
    doc.text("AMT", taxColX[6], taxYText);

    // Filter values
    // Assuming 0 tax for now as per schema
    const taxValYText = taxHeaderY + taxHeaderHeight + 4.5;

    doc.text(formatCurrency(totalAmount), taxColX[0], taxValYText);
    doc.text("0.00", taxColX[1], taxValYText);
    doc.text("0.00", taxColX[2], taxValYText);
    doc.text("0.00", taxColX[3], taxValYText);
    doc.text("0.00", taxColX[4], taxValYText);
    doc.text("0.00", taxColX[5], taxValYText);
    doc.text("0.00", taxColX[6], taxValYText);

    // Bottom border of Tax Section
    const taxSectionEnd = taxHeaderY + taxHeaderHeight + taxValueHeight;
    doc.line(mLeft, taxSectionEnd, pageWidth - mRight, taxSectionEnd);

    // Side borders for the whole footer block
    doc.line(mLeft, bottomLineY, mLeft, pageHeight - mTop - 2); // Left
    doc.line(pageWidth - mRight, bottomLineY, pageWidth - mRight, pageHeight - mTop - 2); // Right
    doc.line(mLeft, pageHeight - mTop - 2, pageWidth - mRight, pageHeight - mTop - 2); // Bottom closure


    // 3. Final Footer (E. & O.E. + Net Amount)
    let finalSectionY = taxSectionEnd;

    // Split Horizontal Line for Net Amount?
    // Screenshot shows "Net Amount :" line separate or just text? 
    // It looks like a row: | E & OE ... Net Amount : XXX |

    // Separator line for "Net Amount" row?
    // The screenshot has a line separating Tax values from E & OE / Net Amount.
    // Yes, we drew that at taxSectionEnd.

    // E. & O.E.
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("E. & O.E.", mLeft + 2, finalSectionY + 5);

    // Net Amount Label and Value
    // Align Right
    const netAmountY = finalSectionY + 5;
    doc.setFontSize(12);
    doc.text(formatCurrency(totalAmount), pageWidth - mRight - 2, netAmountY, { align: 'right' });
    doc.setFontSize(10);
    doc.text("Net Amount : ", pageWidth - mRight - 35, netAmountY, { align: 'right' });

    // Horizontal Line below E & OE / above Words?
    // Screenshot shows: [E & OE ... Net Amount]
    //                   [Rupees ....              ]
    const wordsLineY = finalSectionY + 8;
    doc.line(mLeft, wordsLineY, pageWidth - mRight, wordsLineY);

    // Amount in Words
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(priceInWords(totalAmount), mLeft + 2, wordsLineY + 5);

    // Footer message (Outside border or very bottom)
    doc.setFontSize(8);
    doc.setFont("times", "normal");
    doc.text("QUOTATION VALID ONLY 3 DAYS..", pageWidth / 2, pageHeight - mTop + 3, { align: 'center' });

    doc.save(`Quotation_${qtnNumber}.pdf`);
};
