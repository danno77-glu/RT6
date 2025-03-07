import React, { useState, useEffect } from 'react';
import './styles.css';
import { supabase } from '../../supabase';
import { processTemplate } from '../../utils/templateProcessor';
import { generatePDF } from '../QuoteTemplates/utils/pdfGenerator';
import { imageToBase64 } from '../../utils/assetPaths';

const RepairQuoteModal = ({ audit, damageRecords, auditorDetails, onClose }) => {
  const [processedContent, setProcessedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [brandPrices, setBrandPrices] = useState({});
  const [supplyType, setSupplyType] = useState('Parts Only');
  const [overwritePrices, setOverwritePrices] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('hidden', false)
          .order('name');

        if (error) {
          console.error('Error fetching templates:', error);
          setTemplates([]);
          return;
        }

        setTemplates(data || []);
        if (data && data.length > 0) {
          setSelectedTemplate(data[0]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      }
    };

    const fetchBrandPrices = async () => {
      try {
        const brands = [...new Set(damageRecords.filter(record => record.risk_level !== 'GREEN').map(record => record.brand))];
        if (brands.length === 0) {
          setBrandPrices({});
          return;
        }
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name')
          .in('name', brands);

        if (brandsError) {
          console.error('Error fetching brands:', brandsError);
          setBrandPrices({});
          return;
        }

        const brandMap = {};
        brandsData.forEach(brand => brandMap[brand.name] = brand.id);

        const { data: pricesData, error: pricesError } = await supabase
          .from('brand_prices')
          .select('*')
          .in('brand_id', brandsData.map(b => b.id));

        if (pricesError) {
          console.error('Error fetching brand prices:', pricesError);
          setBrandPrices({});
          return;
        }

        const prices = {};
        pricesData.forEach(price => {
          const brandName = brandsData.find(b => b.id === price.brand_id)?.name;
          if (brandName) {
            prices[brandName] = prices[brandName] || {};
            prices[brandName][price.damage_type] = {
              product_cost: price.product_cost || 0,
              installation_cost: price.installation_cost || 0
            };
          }
        });

        setBrandPrices(prices);
      } catch (error) {
        console.error('Error fetching brand prices:', error);
        setBrandPrices({});
      }
    };

    fetchTemplates();
    fetchBrandPrices();
  }, [damageRecords]);

  useEffect(() => {
    const generateQuote = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!selectedTemplate || !audit || !damageRecords) {
          setProcessedContent('<div class="no-preview">Select a template and ensure audit data is available.</div>');
          setLoading(false);
          return;
        }

        const filteredRecords = damageRecords.filter(record => record.risk_level !== 'GREEN');

        const processedRecords = filteredRecords.map(record => {
          const brandPricesForRecord = brandPrices[record.brand]?.[record.damage_type] || { product_cost: 0, installation_cost: 0 };
          const overwrittenPrice = overwritePrices[record.id] || {};
          const productCost = overwrittenPrice.product_cost !== undefined ? parseFloat(overwrittenPrice.product_cost) : brandPricesForRecord.product_cost;
          const installationCost = overwrittenPrice.installation_cost !== undefined ? parseFloat(overwrittenPrice.installation_cost) : brandPricesForRecord.installation_cost;
          const totalCost = productCost + (supplyType === 'Parts and Installation' ? installationCost : 0);

          return {
            ...record,
            product_cost: productCost,
            installation_cost: installationCost,
            total_cost: totalCost
          };
        });

        const auditWithDetails = {
          ...audit,
          auditor_email: auditorDetails?.email || '',
          auditor_phone: auditorDetails?.phone || '',
          supplyType: supplyType
        };

        console.log("Audit data before processing:", auditWithDetails);
        console.log("Damage records before processing:", processedRecords);
        console.log("Brand prices:", brandPrices);

        const content = await processTemplate(selectedTemplate, auditWithDetails, processedRecords, brandPrices);
        setProcessedContent(content);
      } catch (error) {
        console.error('Error generating repair quote:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    generateQuote();
  }, [audit, damageRecords, selectedTemplate, brandPrices, supplyType, overwritePrices, auditorDetails]);

  const handleDownload = async () => {
    if (!processedContent || !audit) return;
    try {
      await generatePDF({
        content: processedContent,
        filename: `repair-quote-${audit.reference_number}.pdf`
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleOverwritePriceChange = (recordId, field, value) => {
    setOverwritePrices(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [field]: value
      }
    }));
  };

  const handleCreateQuote = () => {
    if (!processedContent) return;
    const newWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.document.write(processedContent);
      newWindow.document.close();
    }
  };

  if (loading) {
    return <div className="loading">Generating repair quote...</div>;
  }

  return (
    <div className="repair-quote-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Repair Quote</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="template-selector">
            <label>Select Template:</label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value))}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="supply-type-selector">
            <label>Supply Type:</label>
            <select value={supplyType} onChange={(e) => setSupplyType(e.target.value)}>
              <option value="Parts Only">Parts Only</option>
              <option value="Parts and Installation">Parts and Installation</option>
            </select>
          </div>
          {processedContent ? (
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          ) : (
            <div className="no-preview">No repair quote available.</div>
          )}
          <div className="price-adjustments">
            <h3>Price Adjustments</h3>
            {damageRecords.filter(record => record.risk_level !== 'GREEN').map(record => (
              <div key={record.id} className="price-adjustment-item">
                <div className="price-adjustment-header">
                  <h4>{record.damage_type}</h4>
                  <span className="risk-badge">{record.risk_level}</span>
                </div>
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label>Product Cost</label>
                    <input
                      type="number"
                      value={overwritePrices[record.id]?.product_cost || brandPrices[record.brand]?.[record.damage_type]?.product_cost || 0}
                      onChange={(e) => handleOverwritePriceChange(record.id, 'product_cost', e.target.value)}
                      className="price-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Installation Cost</label>
                    <input
                      type="number"
                      value={overwritePrices[record.id]?.installation_cost || brandPrices[record.brand]?.[record.damage_type]?.installation_cost || 0}
                      onChange={(e) => handleOverwritePriceChange(record.id, 'installation_cost', e.target.value)}
                      className="price-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleCreateQuote} className="create-quote-btn">Create Repair Quote</button>
          <button onClick={handleDownload} className="download-btn" disabled={!processedContent}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairQuoteModal;
