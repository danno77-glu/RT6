import { processField } from './templateProcessing/fieldProcessor';
import { processConditionals } from './templateProcessing/conditionalProcessor';
import { processVariables } from './templateProcessing/variableProcessor';
import { formatDate } from './dateFormatting';
import { formatCurrency } from './formatters';

export const processTemplate = async (template, audit, damageRecords, brandPrices) => {
  if (!template?.content || !audit || !damageRecords) {
    console.error("Error processing template: Missing template, audit, or damageRecords data. Audit:", audit, "Damage Records:", damageRecords);
    return ''; 
  }

  const processedFields = {
    date: { label: 'Date', value: formatDate(audit.audit_date) },
    referenceNumber: { label: 'Reference', value: audit.reference_number },
    supplyType: { label: 'Supply Type', value: audit.supplyType },
    auditor_name: { label: 'Auditor Name', value: audit.auditor_name },
    site_name: { label: 'Site Name', value: audit.site_name },
    company_name: { label: 'Company Name', value: audit.company_name },
    damage_records: damageRecords
  };

  let content = template.content;
  content = processConditionals(content, processedFields);
  content = await processVariables(content, processedFields, brandPrices); 
  return content;
};
