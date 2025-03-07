export const newQuoteTemplate = {
  name: "New Quote Template",
  content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Repair Quote</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header img {
      max-width: 200px;
      height: auto;
      margin-bottom: 15px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 2em;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      color: #2563eb;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-size: 1.5em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 1em;
    }
    th, td {
      padding: 10px;
      border: 1px solid #e5e7eb;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-weight: bold;
    }
    .damage-record {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 15px;
      margin-bottom: 15px;
    }
    .risk-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      margin-left: 10px;
    }
    .risk-badge.red { background-color: #fee2e2; color: #dc2626; }
    .risk-badge.amber { background-color: #fef3c7; color: #d97706; }
    .total-row {
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 10px auto;
    }
    @page {
      size: A4;
      margin: 20mm;
    }
    @media print {
      body { margin: 0; }
      .header h1 { color: #2563eb !important; }
      .section h2 { color: #2563eb !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/assets/images/logo1.png" alt="Company Logo">
      <h1>Repair Quote</h1>
      <p><strong>Reference:</strong> {{referenceNumber}}</p>
      <p><strong>Date:</strong> {{date}}</p>
      <p><strong>Auditor:</strong> {{auditor_name}}</p>
      <p><strong>Supply Type:</strong> {{supplyType}}</p>
    </div>

    <div class="section">
      <h2>Site Details</h2>
      <p><strong>Site Name:</strong> {{site_name}}</p>
      <p><strong>Company:</strong> {{company_name}}</p>
    </div>

    <div class="section">
      <h2>Damage Summary</h2>
      {{#each damage_records}}
        <div class="damage-record">
          <h3>{{damage_type}} <span class="risk-badge {{risk_level}}">{{risk_level}}</span></h3>
          <p><strong>Location:</strong> {{location_details}}</p>
          {{#if building_area}}<p><strong>Building/Area:</strong> {{building_area}}</p>{{/if}}
          <p><strong>Brand:</strong> {{brand}}</p>
          <p><strong>Recommendation:</strong> {{recommendation}}</p>
          {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          {{#if photo_url}}<img src="{{photo_url}}" alt="Damage Photo">{{/if}}
          <p><strong>Product Cost:</strong> {{product_cost}}</p>
          <p><strong>Installation Cost:</strong> {{installation_cost}}</p>
          <p><strong>Total Cost:</strong> {{total_cost}}</p>
        </div>
      {{/each}}
    </div>

    <div class="section">
      <h2>Cost Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Materials Cost</td>
            <td class="total-row">{{totalMaterialsCost}}</td>
          </tr>
          <tr>
            <td>Total Installation Cost</td>
            <td class="total-row">{{totalInstallationCost}}</td>
          </tr>
          <tr>
            <td>Subtotal</td>
            <td class="total-row">{{subtotal}}</td>
          </tr>
          <tr>
            <td>GST (10%)</td>
            <td class="total-row">{{gst}}</td>
          </tr>
          <tr>
            <td><strong>Total (incl. GST)</strong></td>
            <td class="total-row">{{totalWithGst}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Thank you for your business.</p>
      <p>DMD Storage Group</p>
      <p>Contact: sales@dmd.com.au</p>
    </div>
  </div>
</body>
</html>`
};
