import { useState, useEffect, useMemo } from 'react';
import type { Tariff } from '../../types';
import { Input, Select } from '../ui';

interface TariffFormProps {
  tariff: Tariff | null;
  onSave: (formData: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  categories: string[];
}

export function TariffForm({ tariff, onSave, onCancel, onDirtyChange, categories }: TariffFormProps) {
  const initialFormData = tariff ? {
    ...tariff,
    tariffCode: tariff.tariffCode || "",
    descriptionAFR: tariff.descriptionAFR || ""
  } : {
    code: "",
    tariffCode: "",
    description: "",
    descriptionAFR: "",
    price: 0,
    category: "",
    measure: ""
  };

  const [f, setF] = useState(initialFormData);
  const s = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  // Track if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!tariff) {
      // New tariff - check if any data entered
      return f.code.trim() !== "" ||
        f.description.trim() !== "" ||
        f.price !== 0;
    } else {
      // Editing - check if anything changed
      return JSON.stringify(f) !== JSON.stringify(initialFormData);
    }
  }, [f, tariff, initialFormData]);

  // Notify parent when dirty state changes
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Input
          label="User Code"
          value={f.code}
          onChange={v => s("code", v)}
          required
          placeholder="e.g. 9704"
        />
        <Input
          label="Tariff Code"
          value={f.tariffCode}
          onChange={v => s("tariffCode", v)}
          placeholder="e.g. 9736 (optional)"
        />
        <Input
          label="Price"
          value={f.price.toString()}
          onChange={v => s("price", parseFloat(v) || 0)}
          type="number"
          required
          placeholder="e.g. 150.00"
        />
      </div>

      <Input
        label="Description (English)"
        value={f.description}
        onChange={v => s("description", v)}
        required
        placeholder="e.g. Crown, per tooth"
        style={{ marginBottom: 16 }}
      />

      <Input
        label="Description (Afrikaans)"
        value={f.descriptionAFR}
        onChange={v => s("descriptionAFR", v)}
        placeholder="e.g. Kroon, per tand"
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <Select
          label="Category"
          value={f.category}
          onChange={v => s("category", v)}
          options={categories.map(c => ({ value: c, label: c }))}
          placeholder="Select category..."
        />
        <Input
          label="Measure"
          value={f.measure}
          onChange={v => s("measure", v)}
          placeholder="e.g. each, per mm"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSave(f)}
          disabled={!f.code.trim() || !f.description.trim()}
        >
          Save Tariff
        </button>
      </div>
    </div>
  );
}
