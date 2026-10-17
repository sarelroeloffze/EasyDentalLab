import React, { useState } from 'react';
import type { AppData } from '../../types';
import { Button, Modal, Input, ConfirmModal } from '../ui';
import { genId } from '../../utils/helpers';

interface MedicalAidsProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

interface MedicalAidPlan {
  id: string;
  name: string;
}

interface MedicalAid {
  id: string;
  name: string;
  plans: MedicalAidPlan[];
}

export function MedicalAids({ data, setData }: MedicalAidsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MedicalAid | null>(null);
  const [formName, setFormName] = useState('');
  const [formPlans, setFormPlans] = useState<MedicalAidPlan[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MedicalAid | null>(null);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  // Normalize medicalAids data structure
  const medicalAids: MedicalAid[] = (data.medicalAids || []).map((item: any) => {
    // If it's already the correct structure, use it
    if (item.id && item.name && Array.isArray(item.plans)) {
      return item;
    }
    // Legacy format: string or {id, name} - convert to new format
    const name = typeof item === 'string' ? item : (item.name || item);
    const id = (typeof item === 'object' && item.id) ? item.id : genId();
    return { id, name, plans: [] };
  });

  const filteredAids = search
    ? medicalAids.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.plans.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
      )
    : medicalAids;

  const sortedAids = [...filteredAids].sort((a, b) => a.name.localeCompare(b.name));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    setEditing(null);
    setFormName('');
    setFormPlans([]);
    setShowForm(true);
  };

  const handleEdit = (aid: MedicalAid) => {
    setEditing(aid);
    setFormName(aid.name);
    setFormPlans([...aid.plans]);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    setData(prev => {
      // Normalize prev.medicalAids to the correct structure
      const prevMedicalAids: MedicalAid[] = (prev.medicalAids || []).map((item: any) => {
        if (item.id && item.name && Array.isArray(item.plans)) {
          return item;
        }
        const name = typeof item === 'string' ? item : (item.name || item);
        const id = (typeof item === 'object' && item.id) ? item.id : genId();
        return { id, name, plans: [] };
      });

      let updated: MedicalAid[];
      if (editing) {
        // Update existing
        updated = prevMedicalAids.map(m =>
          m.id === editing.id
            ? { ...m, name: formName.trim(), plans: formPlans }
            : m
        );
      } else {
        // Add new
        updated = [...prevMedicalAids, {
          id: genId(),
          name: formName.trim(),
          plans: formPlans
        }];
      }
      return { ...prev, medicalAids: updated };
    });

    setShowForm(false);
    setEditing(null);
    setFormName('');
    setFormPlans([]);
  };

  const handleDeleteClick = (aid: MedicalAid) => {
    setDeleteTarget(aid);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData(prev => {
        // Normalize prev.medicalAids to the correct structure
        const prevMedicalAids: MedicalAid[] = (prev.medicalAids || []).map((item: any) => {
          if (item.id && item.name && Array.isArray(item.plans)) {
            return item;
          }
          const name = typeof item === 'string' ? item : (item.name || item);
          const id = (typeof item === 'object' && item.id) ? item.id : genId();
          return { id, name, plans: [] };
        });

        return {
          ...prev,
          medicalAids: prevMedicalAids.filter(m => m.id !== deleteTarget.id)
        };
      });
    }
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  const addPlan = () => {
    setFormPlans(prev => [...prev, { id: genId(), name: '' }]);
  };

  const updatePlan = (id: string, name: string) => {
    setFormPlans(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const removePlan = (id: string) => {
    setFormPlans(prev => prev.filter(p => p.id !== id));
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    fontSize: 13,
    color: '#374151',
    backgroundColor: '#f9fafb'
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6'
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>💊 Medical Aids</h1>
        <Button onClick={handleAdd}>+ Add Medical Aid</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search medical aids or plans..."
          style={{ maxWidth: 400 }}
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Medical Aid / Plans</th>
              <th style={{ ...tableHeaderStyle, width: 150, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAids.map(aid => (
              <React.Fragment key={aid.id}>
                <tr>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {aid.plans.length > 0 && (
                        <button
                          onClick={() => toggleExpand(aid.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            fontSize: 14,
                            color: '#6b7280'
                          }}
                        >
                          {expandedIds.has(aid.id) ? '▼' : '▶'}
                        </button>
                      )}
                      <span style={{ fontWeight: 600 }}>{aid.name}</span>
                      {aid.plans.length > 0 && (
                        <span style={{
                          fontSize: 11,
                          color: '#6b7280',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {aid.plans.length} plan{aid.plans.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(aid)}
                      style={{
                        padding: '6px 12px',
                        marginRight: 8,
                        border: '1px solid #d1d5db',
                        borderRadius: 4,
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(aid)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #fca5a5',
                        borderRadius: 4,
                        backgroundColor: 'white',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedIds.has(aid.id) && aid.plans.map(plan => (
                  <tr key={plan.id}>
                    <td style={{ ...tableCellStyle, paddingLeft: 64, color: '#6b7280' }}>
                      └─ {plan.name}
                    </td>
                    <td style={tableCellStyle}></td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {sortedAids.length === 0 && (
              <tr>
                <td colSpan={2} style={{ ...tableCellStyle, textAlign: 'center', color: '#9ca3af', padding: 32 }}>
                  No medical aids found. Click "+ Add Medical Aid" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal
          title={editing ? 'Edit Medical Aid' : 'Add Medical Aid'}
          onClose={() => setShowForm(false)}
        >
          <div style={{ padding: 24, minWidth: 500 }}>
            <Input
              label="Medical Aid Name"
              value={formName}
              onChange={setFormName}
              placeholder="e.g. Discovery Health"
              required
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Plans (Optional)
                </label>
                <button
                  onClick={addPlan}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: 11
                  }}
                >
                  + Add Plan
                </button>
              </div>

              {formPlans.length === 0 && (
                <div style={{
                  padding: 16,
                  backgroundColor: '#f9fafb',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  No plans added. Click "+ Add Plan" to add plan options.
                </div>
              )}

              {formPlans.map(plan => (
                <div key={plan.id} style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 8,
                  alignItems: 'center'
                }}>
                  <Input
                    value={plan.name}
                    onChange={v => updatePlan(plan.id, v)}
                    placeholder="e.g. KeyCare Plus"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removePlan(plan.id)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #fca5a5',
                      borderRadius: 4,
                      backgroundColor: 'white',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormName('');
                  setFormPlans([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formName.trim()}>
                {editing ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmModal
          open={confirmDelete}
          title="Delete Medical Aid?"
          message={`Are you sure you want to delete "${deleteTarget?.name}"${deleteTarget?.plans && deleteTarget.plans.length > 0 ? ` and its ${deleteTarget.plans.length} plan(s)` : ''}? This action cannot be undone.`}
          confirmText="Delete"
          danger={true}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
