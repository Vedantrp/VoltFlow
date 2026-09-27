import React, { useState } from 'react';
import { FileSpreadsheet, X, Download, DollarSign, IndianRupee } from 'lucide-react';
import type { PlacedComponent, BOMItem } from '../types';
import { COMPONENT_CATALOG } from '../catalog';

interface BOMExporterProps {
  components: PlacedComponent[];
  onClose: () => void;
}

const USD_TO_INR_RATE = 85.0;

export const BOMExporter: React.FC<BOMExporterProps> = ({ components, onClose }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const rate = currency === 'INR' ? USD_TO_INR_RATE : 1.0;
  const symbol = currency === 'INR' ? '₹' : '$';

  // Aggregate component quantities
  const bomMap = new Map<string, BOMItem>();

  components.forEach((comp) => {
    const compDef = COMPONENT_CATALOG.find((cat) => cat.type === comp.type);
    if (!compDef) return;

    const rawCost = compDef.estimatedCost * rate;
    const convertedUnitCost =
      currency === 'INR'
        ? (rawCost < 5 ? Number(rawCost.toFixed(2)) : Math.round(rawCost))
        : Number(rawCost.toFixed(2));

    if (bomMap.has(comp.type)) {
      const existing = bomMap.get(comp.type)!;
      existing.quantity += 1;
      existing.totalCost = existing.quantity * existing.unitCost;
    } else {
      bomMap.set(comp.type, {
        id: comp.type,
        name: compDef.name,
        category: compDef.category,
        quantity: 1,
        footprint: compDef.footprint,
        unitCost: convertedUnitCost,
        totalCost: convertedUnitCost,
      });
    }
  });

  const bomItems = Array.from(bomMap.values());
  const grandTotal = bomItems.reduce((acc, item) => acc + item.totalCost, 0);

  const handleExportCSV = () => {
    let csv = `Part Name,Category,Quantity,Footprint,Unit Cost (${symbol}),Total Cost (${symbol})\n`;
    bomItems.forEach((item) => {
      csv += `"${item.name}","${item.category}",${item.quantity},"${item.footprint}",${item.unitCost.toFixed(2)},${item.totalCost.toFixed(2)}\n`;
    });
    csv += `\nGrand Total,,,,,${grandTotal.toFixed(2)}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_Circuit_Simulator_${currency}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-container" style={{ width: 740, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', color: '#f8fafc' }}>
        
        {/* Header */}
        <div style={{ padding: '14px 20px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSpreadsheet size={18} color="#10b981" /> Bill of Materials (BOM) & Cost Estimator
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Currency Selector Toggle */}
            <div style={{ display: 'flex', backgroundColor: '#0f172a', padding: 2, borderRadius: 6, border: '1px solid #334155' }}>
              <button
                onClick={() => setCurrency('INR')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: currency === 'INR' ? '#10b981' : 'transparent',
                  color: currency === 'INR' ? '#0f172a' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <IndianRupee size={13} /> INR (₹)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: currency === 'USD' ? '#10b981' : 'transparent',
                  color: currency === 'USD' ? '#0f172a' : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <DollarSign size={13} /> USD ($)
              </button>
            </div>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div style={{ padding: 20, maxHeight: 360, overflowY: 'auto' }}>
          {bomItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>No components on workspace.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#38bdf8', textAlign: 'left' }}>
                  <th style={{ padding: 10 }}>Part Name</th>
                  <th style={{ padding: 10 }}>Category</th>
                  <th style={{ padding: 10 }}>Qty</th>
                  <th style={{ padding: 10 }}>Footprint</th>
                  <th style={{ padding: 10 }}>Unit Price ({symbol})</th>
                  <th style={{ padding: 10 }}>Total Price ({symbol})</th>
                </tr>
              </thead>
              <tbody>
                {bomItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: 10, color: '#94a3b8' }}>{item.category}</td>
                    <td style={{ padding: 10, fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: 10, color: '#64748b' }}>{item.footprint}</td>
                    <td style={{ padding: 10 }}>{symbol}{item.unitCost.toFixed(2)}</td>
                    <td style={{ padding: 10, color: '#10b981', fontWeight: 600 }}>{symbol}{item.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
            Estimated Total Cost: <span style={{ color: '#10b981' }}>{symbol}{grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '8px 14px', borderRadius: 6, backgroundColor: '#334155', color: '#f8fafc', border: 'none', cursor: 'pointer' }}>Close</button>
            <button onClick={handleExportCSV} style={{ padding: '8px 18px', borderRadius: 6, backgroundColor: '#10b981', color: '#0f172a', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Download size={15} /> Export CSV ({currency})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
