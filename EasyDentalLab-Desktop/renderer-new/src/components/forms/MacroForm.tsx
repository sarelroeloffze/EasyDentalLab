import { useState, useEffect, useMemo } from 'react';
import type { Macro } from '../../types';
import { Input } from '../ui';
import { genId } from '../../utils/helpers';

interface MacroFormProps {
  macro: Macro | null;
  onSave: (formData: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

interface MacroCode {
  id: string;
  code: string;
  qty: number;
}

export function MacroForm({ macro, onSave, onCancel, onDirtyChange }: MacroFormProps) {
  const getInitialCodes = (): MacroCode[] => {
    if (macro && Array.isArray(macro.codes)) {
      return macro.codes.map(c => ({ id: genId(), code: c.code, qty: c.qty }));
    }
    return [{ id: genId(), code: "", qty: 1 }];
  };

  const initialFormData = {
    name: macro?.name || "",
    codes: getInitialCodes()
  };

  const [name, setName] = useState(initialFormData.name);
  const [codes, setCodes] = useState<MacroCode[]>(initialFormData.codes);

  // Track if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!macro) {
      // New macro - check if any data entered
      return name.trim() !== "" ||
        (codes.length > 1) ||
        (codes.length === 1 && codes[0].code !== "");
    } else {
      // Editing - check if anything changed
      return JSON.stringify({ name, codes }) !== JSON.stringify({
        name: initialFormData.name,
        codes: initialFormData.codes
      });
    }
  }, [name, codes, macro, initialFormData]);

  // Notify parent when dirty state changes
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const addCode = () => {
    setCodes([...codes, { id: genId(), code: "", qty: 1 }]);
  };

  const removeCode = (id: string) => {
    if (codes.length > 1) {
      setCodes(codes.filter(c => c.id !== id));
    }
  };

  const updateCode = (id: string, field: 'code' | 'qty', value: string | number) => {
    setCodes(codes.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = () => {
    // Filter out empty codes before saving
    const validCodes = codes.filter(c => c.code.trim() !== "");
    onSave({
      name,
      codes: validCodes.map(c => ({ code: c.code, qty: c.qty }))
    });
  };

  return (
    <div>
      <Input
        label="Macro Name"
        value={name}
        onChange={v => setName(v)}
        required
        placeholder="e.g. Full Crown Set"
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)' }}>
            Tariff Codes
          </label>
          <button
            className="btn btn-secondary"
            onClick={addCode}
            style={{ fontSize: 12, padding: '4px 8px' }}
          >
            + Add Code
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--c-border)' }}>
          <thead>
            <tr style={{ background: 'var(--c-surface2)' }}>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--c-text2)' }}>
                Code
              </th>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--c-text2)', width: 100 }}>
                Qty
              </th>
              <th style={{ padding: '8px', width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((item) => (
              <tr key={item.id} style={{ borderTop: '1px solid var(--c-border2)' }}>
                <td style={{ padding: '8px' }}>
                  <input
                    type="text"
                    value={item.code}
                    onChange={e => updateCode(item.id, 'code', e.target.value)}
                    placeholder="e.g. 9704"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--c-border)',
                      borderRadius: 4,
                      fontSize: 13,
                      fontFamily: 'monospace'
                    }}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => updateCode(item.id, 'qty', parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid var(--c-border)',
                      borderRadius: 4,
                      fontSize: 13
                    }}
                  />
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  {codes.length > 1 && (
                    <button
                      onClick={() => removeCode(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: 16,
                        padding: 4
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!name.trim() || codes.filter(c => c.code.trim() !== "").length === 0) && (
          <p style={{
            fontSize: 12,
            color: '#dc2626',
            marginTop: 8,
            marginBottom: 0
          }}>
            {!name.trim()
              ? "Macro name is required"
              : "At least one tariff code is required"}
          </p>
        )}
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
          onClick={handleSave}
          disabled={!name.trim() || codes.filter(c => c.code.trim() !== "").length === 0}
        >
          Save Macro
        </button>
      </div>
    </div>
  );
}
