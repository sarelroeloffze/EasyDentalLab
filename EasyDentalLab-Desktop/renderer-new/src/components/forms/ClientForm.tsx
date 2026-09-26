import { useState, useEffect, useMemo } from 'react';
import type { Client } from '../../types';
import { Input } from '../ui';

interface ClientFormProps {
  client: Client | null;
  clients: Client[];
  onSave: (formData: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  prefillName?: string;
}

export function ClientForm({ client, clients: _clients, onSave, onCancel, onDirtyChange, prefillName }: ClientFormProps) {
  const initialFormData = client || {
    name: prefillName || "",
    practice: "",
    phone: "",
    email: "",
    pcns: "",
    address: "",
    city: "",
    postalCode: ""
  };

  const [f, setF] = useState(initialFormData);
  const s = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  // Track if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!client) {
      // New client - check if any data entered
      return f.name.trim() !== "" ||
        f.practice.trim() !== "" ||
        f.phone.trim() !== "" ||
        f.email.trim() !== "";
    } else {
      // Editing - check if anything changed
      return JSON.stringify(f) !== JSON.stringify(initialFormData);
    }
  }, [f, client, initialFormData]);

  // Notify parent when dirty state changes
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Input
          label="Dentist Name"
          value={f.name}
          onChange={v => s("name", v)}
          required
          placeholder="e.g. Dr. Smith"
          autoFocus={!client}
        />
        <Input
          label="Practice Name"
          value={f.practice}
          onChange={v => s("practice", v)}
          placeholder="e.g. Smith Dental"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <Input
          label="Phone"
          value={f.phone}
          onChange={v => s("phone", v)}
          type="tel"
          placeholder="e.g. 021 123 4567"
        />
        <Input
          label="Email"
          value={f.email}
          onChange={v => s("email", v)}
          type="email"
          placeholder="e.g. info@smithdental.co.za"
        />
      </div>

      <Input
        label="PCNS"
        value={f.pcns}
        onChange={v => s("pcns", v)}
        placeholder="Practice code number"
        style={{ marginBottom: 16 }}
      />

      <Input
        label="Address"
        value={f.address}
        onChange={v => s("address", v)}
        placeholder="Street address"
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <Input
          label="City"
          value={f.city}
          onChange={v => s("city", v)}
          placeholder="e.g. Cape Town"
        />
        <Input
          label="Postal Code"
          value={f.postalCode}
          onChange={v => s("postalCode", v)}
          placeholder="e.g. 8001"
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
          disabled={!f.name.trim()}
        >
          Save Client
        </button>
      </div>
    </div>
  );
}
