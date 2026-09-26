import { useState, useMemo } from 'react';
import type { LineItem, Tariff, Macro } from '../../types';
import { CodeInput, Modal } from '../ui';
import { SvgIcon, ICO } from '../../utils/icons';
import { genId, fmt, descForLang } from '../../utils/helpers';

interface LineItemEditorProps {
  items: LineItem[];
  setItems: (items: LineItem[] | ((prev: LineItem[]) => LineItem[])) => void;
  tariffs: Tariff[];
  macros?: Macro[];
  lang: 'en' | 'af';
}

export function LineItemEditor({ items, setItems, tariffs, macros, lang }: LineItemEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showMacroPicker, setShowMacroPicker] = useState(false);
  const [tSearch, setTSearch] = useState("");
  const [mSearch, setMSearch] = useState("");

  const addBlank = () => {
    const id = genId();
    setItems(prev => [...prev, { id, code: "", description: "", qty: 1, price: 0 }]);
    return id;
  };

  const consolidateItems = (currentItems: LineItem[], newItems: LineItem[]): LineItem[] => {
    const consolidated = [...currentItems];
    newItems.forEach(newItem => {
      const existingIndex = consolidated.findIndex(existing => existing.code === newItem.code);
      if (existingIndex >= 0) {
        // Duplicate found - add quantities, update price/description to latest
        consolidated[existingIndex] = {
          ...consolidated[existingIndex],
          qty: (parseFloat(String(consolidated[existingIndex].qty)) || 0) + (parseFloat(String(newItem.qty)) || 0),
          price: newItem.price,
          description: newItem.description,
          tariffCode: newItem.tariffCode
        };
      } else {
        consolidated.push(newItem);
      }
    });
    return consolidated;
  };

  const addTariff = (t: Tariff) => {
    const newItem: LineItem = {
      id: genId(),
      code: t.code,
      tariffCode: t.tariffCode || t.code,
      description: descForLang(t, lang),
      qty: 1,
      price: t.price
    };
    setItems(prev => consolidateItems(prev, [newItem]));
    setShowPicker(false);
    setTSearch("");
  };

  const addMacro = (macro: Macro) => {
    const newItems: LineItem[] = macro.codes.map(c => {
      const t = tariffs.find(t => t.code === c.code);
      return {
        id: genId(),
        code: c.code,
        tariffCode: t?.tariffCode || c.code,
        description: t ? descForLang(t, lang) : c.code,
        qty: c.qty || 1,
        price: t?.price || 0
      };
    });
    setItems(prev => consolidateItems(prev, newItems));
    setShowMacroPicker(false);
    setMSearch("");
  };

  const update = (id: string, key: keyof LineItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: value } : i));
  };

  const multiUpdate = (id: string, fields: Partial<LineItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...fields } : i));
  };

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const fTariffs = useMemo(() => {
    const q = tSearch.toLowerCase();
    return tariffs.filter(t =>
      t.code?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  }, [tariffs, tSearch]);

  const filteredMacros = useMemo(() => {
    const q = mSearch.toLowerCase();
    return (macros || []).filter(m => m.name.toLowerCase().includes(q))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [macros, mSearch]);

  const subtotal = items.reduce((s, i) =>
    s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0), 0
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>Line Items</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {macros && macros.length > 0 && (
            <button
              className="btn btn-sm"
              title="Select a device macro to add all its tariff codes at once"
              style={{ background: '#7c3aed', color: 'white' }}
              onClick={() => setShowMacroPicker(true)}
            >
              <SvgIcon path={ICO.menu} size={13} /> From Macro
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            title="Add a single tariff code from the tariff list"
            onClick={() => setShowPicker(true)}
          >
            <SvgIcon path={ICO.tag} size={13} /> From Tariff
          </button>
          <button
            className="btn btn-secondary btn-sm"
            title="Add a blank line item with custom description and price"
            onClick={addBlank}
          >
            <SvgIcon path={ICO.plus} size={13} /> Custom
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
          No items. Add from tariff codes or custom.
        </p>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'left', width: 90 }}>Code</th>
                <th style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'center', width: 60 }}>Qty</th>
                <th style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'right', width: 100 }}>Price</th>
                <th style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', textAlign: 'right', width: 100 }}>Total</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '4px 8px' }}>
                    <CodeInput
                      value={item.code}
                      onChange={v => update(item.id, "code", v)}
                      onSelect={t => multiUpdate(item.id, {
                        code: t.code,
                        tariffCode: t.tariffCode || t.code,
                        description: descForLang(t, lang),
                        price: t.price,
                        qty: 1
                      })}
                      onAddLine={addBlank}
                      tariffs={tariffs}
                      rowId={item.id}
                      inputStyle={{ padding: '4px 6px', fontSize: 12, fontFamily: 'monospace' }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <input
                      className="input-field"
                      data-field="description"
                      data-row={item.id}
                      title="Item description — auto-filled from tariff or type your own"
                      value={item.description}
                      onChange={e => update(item.id, "description", e.target.value)}
                      style={{ padding: '4px 6px', fontSize: 12 }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <input
                      className="input-field"
                      title="Quantity"
                      type="number"
                      value={item.qty}
                      onChange={e => update(item.id, "qty", e.target.value)}
                      min="1"
                      style={{ padding: '4px 6px', fontSize: 12, textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px' }}>
                    <input
                      className="input-field"
                      title="Unit price — auto-filled from tariff or type your own"
                      type="number"
                      value={item.price}
                      onChange={e => update(item.id, "price", e.target.value)}
                      step="0.01"
                      style={{ padding: '4px 6px', fontSize: 12, textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ padding: '4px 8px', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
                    {fmt((parseFloat(String(item.qty)) || 0) * (parseFloat(String(item.price)) || 0))}
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      title="Remove this line item"
                      onClick={() => remove(item.id)}
                    >
                      <SvgIcon path={ICO.x} size={13} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ background: '#f9fafb', padding: '8px 12px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Subtotal: {fmt(subtotal)}</span>
          </div>
        </div>
      )}

      {/* Tariff Picker Modal */}
      <Modal open={showPicker} onClose={() => { setShowPicker(false); setTSearch(""); }} title="Select Tariff Code" autoFocus={false}>
        <input
          className="input-field"
          value={tSearch}
          onChange={e => setTSearch(e.target.value)}
          placeholder="Search tariff codes..."
          style={{ marginBottom: 12 }}
          autoFocus
        />
        <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          {fTariffs.map(t => (
            <button
              key={t.id}
              title="Click to add this tariff code as a line item"
              onClick={() => addTariff(t)}
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#2563eb', fontWeight: 600, marginRight: 8 }}>
                  {t.code}
                </span>
                <span style={{ fontSize: 13 }}>{t.description}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmt(t.price)}</span>
            </button>
          ))}
          {fTariffs.length === 0 && (
            <p style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: 13 }}>No matching tariffs</p>
          )}
        </div>
      </Modal>

      {/* Macro Picker Modal */}
      <Modal open={showMacroPicker} onClose={() => { setShowMacroPicker(false); setMSearch(""); }} title="Select Macro (Device Template)" autoFocus={false}>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
          Selecting a macro will add all its tariff codes to the line items. You can still change quantities or add more items after.
        </p>
        <input
          className="input-field"
          value={mSearch}
          onChange={e => setMSearch(e.target.value)}
          placeholder="Search macros..."
          style={{ marginBottom: 12 }}
          autoFocus
        />
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          {filteredMacros.map(m => {
            const totalPrice = m.codes.reduce((s, c) => {
              const t = tariffs.find(t => t.code === c.code);
              return s + (t ? t.price * (c.qty || 1) : 0);
            }, 0);
            return (
              <button
                key={m.id}
                title="Click to add all codes from this macro to the line items"
                onClick={() => addMacro(m)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f5f3ff')}
                onMouseOut={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6' }}>{m.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{fmt(totalPrice)}</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b7280' }}>
                  {m.codes.length} codes: {m.codes.map(c => c.code + (c.qty > 1 ? ' x' + c.qty : '')).join(', ')}
                </p>
              </button>
            );
          })}
          {filteredMacros.length === 0 && (
            <p style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: 13 }}>No matching macros</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
