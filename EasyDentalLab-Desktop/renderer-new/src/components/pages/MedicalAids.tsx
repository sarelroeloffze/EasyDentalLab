import { useState } from 'react';
import type { AppData } from '../../types';
import { Button, Modal, Input, ConfirmModal } from '../ui';
import { genId } from '../../utils/helpers';

interface MedicalAidsProps {
  data: AppData;
  setData?: (data: AppData | ((prev: AppData) => AppData)) => void;
}

interface MedicalAid {
  id: string;
  name: string;
}

export function MedicalAids({ data, setData }: MedicalAidsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MedicalAid | null>(null);
  const [formName, setFormName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MedicalAid | null>(null);
  const [search, setSearch] = useState('');

  if (!setData) {
    return <div style={{ padding: 32 }}>Error: setData not provided</div>;
  }

  // Convert medicalAids array to objects with id
  const medicalAids: MedicalAid[] = (data.medicalAids || []).map((item: any) => {
    if (typeof item === 'string') {
      return { id: genId(), name: item };
    }
    return item.id ? item : { id: genId(), name: item.name || item };
  });

  const filteredAids = search
    ? medicalAids.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    : medicalAids;

  const sortedAids = [...filteredAids].sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = () => {
    setEditing(null);
    setFormName('');
    setShowForm(true);
  };

  const handleEdit = (aid: MedicalAid) => {
    setEditing(aid);
    setFormName(aid.name);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    setData(prev => {
      let updated: MedicalAid[];
      if (editing) {
        // Update existing
        updated = medicalAids.map(m =>
          m.id === editing.id ? { ...m, name: formName.trim() } : m
        );
      } else {
        // Add new
        updated = [...medicalAids, { id: genId(), name: formName.trim() }];
      }
      return { ...prev, medicalAids: updated };
    });

    setShowForm(false);
    setEditing(null);
    setFormName('');
  };

  const handleDeleteClick = (aid: MedicalAid) => {
    setDeleteTarget(aid);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      setData(prev => ({
        ...prev,
        medicalAids: medicalAids.filter(m => m.id !== deleteTarget.id)
      }));
    }
    setDeleteTarget(null);
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setConfirmDelete(false);
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
          placeholder="Search medical aids..."
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
              <th style={tableHeaderStyle}>Medical Aid Name</th>
              <th style={{ ...tableHeaderStyle, width: 150, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAids.map(aid => (
              <tr key={aid.id}>
                <td style={tableCellStyle}>{aid.name}</td>
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
          <div style={{ padding: 24, minWidth: 400 }}>
            <Input
              label="Medical Aid Name"
              value={formName}
              onChange={setFormName}
              placeholder="e.g. Discovery Health"
              required
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setFormName('');
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
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          danger={true}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
