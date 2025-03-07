export const processVariables = async (content, fields, brandPrices) => {
  let processedContent = content;
  let totalMaterialsCost = 0;
  let totalInstallationCost = 0;

  if (content.includes('{{#each damage_records}}')) {
    let damageContent = '';
    for (const record of fields.damage_records) { // Use for...of loop for async/await
      let recordTemplate = content.match(/{{#each damage_records}}([\s\S]*?){{\/each}}/)[1];
      const brandPricesForRecord = brandPrices[record.brand]?.[record.damage_type] || { product_cost: 0, installation_cost: 0 };
      const productCost = parseFloat(record.product_cost) || brandPricesForRecord.product_cost;
      const installationCost = parseFloat(record.installation_cost) || brandPricesForRecord.installation_cost;
      const totalCost = productCost + (fields.supplyType === 'Parts and Installation' ? installationCost : 0);

      totalMaterialsCost += productCost;
      totalInstallationCost += installationCost;

      const recordFields = {
        damage_type: record.damage_type,
        risk_level: record.risk_level,
        location_details: record.location_details,
        recommendation: record.recommendation,
        notes: record.notes || '',
        photo_url: record.photo_url || '',
        product_cost: formatCurrency(productCost),
        installation_cost: formatCurrency(installationCost),
        total_cost: formatCurrency(totalCost),
        building_area: record.building_area || '',
        brand: record.brand
      };

      Object.entries(recordFields).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        recordTemplate = recordTemplate.replace(regex, value);
      });

      // Handle image URLs - ensure they are absolute URLs
      if (record.photo_url) {
        const absolutePhotoUrl = new URL(record.photo_url, window.location.origin).href;
        const imgTag = `<img src="${absolutePhotoUrl}" alt="Damage Photo" style="max-width: 300px; height: auto;">`;
        recordTemplate = recordTemplate.replace(/{{#if photo_url}}([\s\S]*?){{\/if}}/g, imgTag);
      } else {
        recordTemplate = recordTemplate.replace(/{{#if photo_url}}[\s\S]*?{{\/if}}/g, '');
      }

      damageContent += recordTemplate;
    }

    processedContent = processedContent.replace(
      /{{#each damage_records}}[\s\S]*?{{\/each}}/,
      damageContent
    );
  }

  processedContent = processedContent.replace(/{{totalMaterialsCost}}/g, formatCurrency(totalMaterialsCost));
  processedContent = processedContent.replace(/{{totalInstallationCost}}/g, formatCurrency(totalInstallationCost));
  processedContent = processedContent.replace(/{{subtotal}}/g, formatCurrency(totalMaterialsCost + totalInstallationCost));
  processedContent = processedContent.replace(/{{gst}}/g, formatCurrency((totalMaterialsCost + totalInstallationCost) * 0.1));
  processedContent = processedContent.replace(/{{totalWithGst}}/g, formatCurrency((totalMaterialsCost + totalInstallationCost) * 1.1));

  Object.entries(fields).forEach(([key, field]) => {
    const value = field?.value || field || '';
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });

  return processedContent;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
};
