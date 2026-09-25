import { useState } from 'react';
import type { AppData, Profile } from '../../types';
import { Input, Button } from '../ui';

interface SettingsProps {
  data: AppData;
  onSave: (profile: Profile) => void;
}

export function Settings({ data, onSave }: SettingsProps) {
  const [profile, setProfile] = useState(data.profile);

  const handleSave = () => {
    onSave(profile);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 800 }}>
      <h1 style={{ 
        fontSize: 32, 
        fontWeight: 700, 
        marginBottom: 32,
        color: 'var(--c-text1)'
      }}>
        Settings
      </h1>

      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        padding: 24,
        border: '1px solid var(--c-border)',
        marginBottom: 24
      }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 600, 
          marginBottom: 20,
          color: 'var(--c-text1)'
        }}>
          Business Information
        </h2>

        <Input
          label="Business Name"
          value={profile.businessName}
          onChange={(value) => setProfile({ ...profile, businessName: value })}
        />

        <Input
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(value) => setProfile({ ...profile, phone: value })}
        />

        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(value) => setProfile({ ...profile, email: value })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input
            label="VAT Number"
            value={profile.vatNumber}
            onChange={(value) => setProfile({ ...profile, vatNumber: value })}
          />
          <Input
            label="VAT %"
            type="number"
            value={profile.vatPercent.toString()}
            onChange={(value) => setProfile({ ...profile, vatPercent: parseFloat(value) || 0 })}
          />
        </div>

        <Input
          label="Laboratory Number"
          value={profile.labNumber}
          onChange={(value) => setProfile({ ...profile, labNumber: value })}
        />

        <Input
          label="PCNS"
          value={profile.pcns}
          onChange={(value) => setProfile({ ...profile, pcns: value })}
        />
      </div>

      <div style={{
        background: 'var(--c-surface)',
        borderRadius: 12,
        padding: 24,
        border: '1px solid var(--c-border)',
        marginBottom: 24
      }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: 600, 
          marginBottom: 20,
          color: 'var(--c-text1)'
        }}>
          Bank Details
        </h2>

        <Input
          label="Bank Name"
          value={profile.bankName}
          onChange={(value) => setProfile({ ...profile, bankName: value })}
        />

        <Input
          label="Account Number"
          value={profile.bankAccount}
          onChange={(value) => setProfile({ ...profile, bankAccount: value })}
        />

        <Input
          label="Branch Code"
          value={profile.bankBranch}
          onChange={(value) => setProfile({ ...profile, bankBranch: value })}
        />
      </div>

      <Button onClick={handleSave} fullWidth>
        Save Settings
      </Button>
    </div>
  );
}
