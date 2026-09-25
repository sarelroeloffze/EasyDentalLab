import { useState, useEffect, useMemo } from 'react';
import type { Estimate, AppData, LineItem } from '../../types';
import { Input, Select, SearchSelect, MedicalAidSelect } from '../ui';
import { LineItemEditor } from './LineItemEditor';
import { genId, fmt, descForLang, today } from '../../utils/helpers';

interface EstimateFormProps {
  estimate: Estimate | null;
  data: AppData;
  onSave: (formData: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function EstimateForm({ estimate, data, onSave, onCancel, onDirtyChange }: EstimateFormProps) {
  const getInitialItems = (): LineItem[] => {
    if (estimate) return Array.isArray(estimate.items) ? estimate.items : [];
    return [{ id: genId(), code: "", description: "", qty: 1, price: 0 }];
  };

  const initialFormData: any = estimate
    ? { ...estimate, items: getInitialItems() }
    : {
        clientId: "",
        patientTitle: "",
        patientSurname: "",
        patientName: "",
        memberName: "",
        medicalAidName: "",
        medicalAidNumber: "",
        date: today(),
        notes: "",
        items: getInitialItems(),
        lang: "en",
        discountEnabled: false,
        discountPercent: 15
      };

  const [f, setF] = useState<any>(initialFormData);
  const [lang, setLang] = useState<'en' | 'af'>(estimate?.lang || "en");
  const [discountEnabled, setDiscountEnabled] = useState(estimate?.discountEnabled || false);
  const [discountPercent, setDiscountPercent] = useState(estimate?.discountPercent || 15);

  const s = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  // Track if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!estimate) {
      // New estimate - check if any data entered
      return f.clientId !== "" ||
        f.patientSurname?.trim() !== "" ||
        f.patientName?.trim() !== "" ||
        f.memberName?.trim() !== "" ||
        f.medicalAidName?.trim() !== "" ||
        f.medicalAidNumber?.trim() !== "" ||
        f.notes?.trim() !== "" ||
        (f.items?.length > 1) ||
        (f.items?.length === 1 && f.items[0].code !== "");
    } else {
      // Editing - check if anything changed
      return JSON.stringify({ ...f, lang, discountEnabled, discountPercent }) !==
        JSON.stringify({
          ...initialFormData,
          lang: estimate.lang,
          discountEnabled: estimate.discountEnabled,
          discountPercent: estimate.discountPercent
        });
    }
  }, [f, lang, discountEnabled, discountPercent, estimate, initialFormData]);

  // Notify parent when dirty state changes
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const switchLang = (newLang: 'en' | 'af') => {
    setLang(newLang);
    setF((prev: any) => ({
      ...prev,
      lang: newLang,
      items: (Array.isArray(prev.items) ? prev.items : []).map((item: LineItem) => {
        const t = data.tariffs.find(t => t.code === item.code);
        return t ? { ...item, description: descForLang(t, newLang) } : item;
      })
    }));
  };

  const clients = data.clients.filter(c => !c.archived);
  const subtotal = (Array.isArray(f.items) ? f.items : []).reduce(
    (s: number, i: LineItem) => s + (parseFloat(String(i.qty)) || 0) * (parseFloat(String(i.price)) || 0),
    0
  );
  const discountAmount = discountEnabled
    ? subtotal * (Math.min(100, Math.max(0, parseFloat(String(discountPercent)) || 0)) / 100)
    : 0;
  const afterDiscount = subtotal - discountAmount;
  const vatRate = parseFloat(String(data.profile.vatPercent)) || 0;
  const vatAmount = vatRate > 0 ? afterDiscount * (vatRate / 100) / (1 + vatRate / 100) : 0;
  const total = afterDiscount;

  // Auto-focus first code input when form opens
  useEffect(() => {
    setTimeout(() => {
      const firstCodeInput = document.querySelector('input[data-field="code"]') as HTMLInputElement;
      if (firstCodeInput) firstCodeInput.focus();
    }, 100);
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <SearchSelect
          label="Dentist Name"
          value={f.clientId}
          onChange={v => s("clientId", v)}
          options={clients.map(c => ({ value: c.id, label: c.name + (c.practice ? " — " + c.practice : "") }))}
          placeholder="Type to search dentists..."
        />
        <Input
          label="Estimate Date"
          value={f.date}
          onChange={v => s("date", v)}
          type="date"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 2fr 2fr', gap: 12, marginBottom: 16 }}>
        <Select
          label="Title"
          value={f.patientTitle}
          onChange={v => s("patientTitle", v)}
          options={[
            { value: "Mr", label: "Mr" },
            { value: "Mrs", label: "Mrs" },
            { value: "Miss", label: "Miss" },
            { value: "Dr", label: "Dr" },
            { value: "Prof", label: "Prof" }
          ]}
          placeholder="Select..."
          title="Patient title — optional"
        />
        <Input
          label="Surname"
          value={f.patientSurname}
          onChange={v => s("patientSurname", v)}
          required
          placeholder="e.g. Smith"
          title="Patient surname — required"
        />
        <Input
          label="Name"
          value={f.patientName}
          onChange={v => s("patientName", v)}
          placeholder="e.g. John"
          title="Patient first/given name — optional"
        />
        <Input
          label="Member Name"
          value={f.memberName}
          onChange={v => s("memberName", v)}
          placeholder="e.g. Main member"
          title="Medical aid member name — optional"
        />
        <MedicalAidSelect
          label="Medical Aid"
          value={f.medicalAidName}
          onChange={v => s("medicalAidName", v)}
          options={(data.medicalAids || []).map((n: any) => ({ value: n.name || n, label: n.name || n }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 16 }}>
        <Input
          label="Medical Aid Number"
          value={f.medicalAidNumber}
          onChange={v => s("medicalAidNumber", v)}
          placeholder="e.g. 123456789"
          title="Medical aid member number — optional"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Estimate Language:</label>
        <label style={{ fontSize: 12, cursor: 'pointer' }}>
          <input
            type="radio"
            name="invLang"
            value="en"
            checked={lang === "en"}
            onChange={() => switchLang("en")}
          /> English
        </label>
        <label style={{ fontSize: 12, cursor: 'pointer' }}>
          <input
            type="radio"
            name="invLang"
            value="af"
            checked={lang === "af"}
            onChange={() => switchLang("af")}
          /> Afrikaans
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <LineItemEditor
          items={Array.isArray(f.items) ? f.items : []}
          setItems={updater =>
            setF((prev: any) => ({
              ...prev,
              items: typeof updater === 'function' ? updater(prev.items) : updater
            }))
          }
          tariffs={data.tariffs}
          macros={data.macros}
          lang={lang}
        />
      </div>

      <Input
        label="Client Notes"
        value={f.notes}
        onChange={v => s("notes", v)}
        textarea
        rows={2}
        style={{ marginBottom: 16 }}
      />

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={discountEnabled}
              onChange={e => {
                setDiscountEnabled(e.target.checked);
                if (e.target.checked && !discountPercent) setDiscountPercent(15);
              }}
            />
            <span>Discount</span>
          </label>
          {discountEnabled && (
            <>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountPercent}
                onChange={e => setDiscountPercent(parseFloat(e.target.value) || 0)}
                style={{
                  width: 70,
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  fontSize: 13
                }}
                placeholder="%"
                title="Discount percentage (max 100%)"
              />
              <span style={{ fontSize: 13, color: '#6b7280' }}>%</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 250 }}>
            <span>Subtotal:</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discountEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 250, color: '#dc2626' }}>
              <span>Discount ({Math.min(100, Math.max(0, parseFloat(String(discountPercent)) || 0)).toFixed(1)}%):</span>
              <span>- {fmt(discountAmount)}</span>
            </div>
          )}
          {vatRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 250, fontSize: 12, color: '#6b7280' }}>
              <span>VAT at {vatRate}% included:</span>
              <span>{fmt(vatAmount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: 250,
            fontSize: 18,
            fontWeight: 700,
            borderTop: '1px solid #e5e7eb',
            paddingTop: 4
          }}>
            <span>Estimate Total:</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          className="btn btn-secondary"
          title="Discard changes and close"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          title="Save this estimate"
          onClick={() => onSave({ ...f, lang, total, discountEnabled, discountPercent: parseFloat(String(discountPercent)) || 15 })}
          disabled={!f.clientId || !f.patientSurname?.trim() || f.items.length === 0}
        >
          Save Estimate
        </button>
      </div>
    </div>
  );
}
