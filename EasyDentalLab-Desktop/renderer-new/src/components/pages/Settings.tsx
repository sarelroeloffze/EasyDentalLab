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
          onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
        />

        <Input
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input
            label="VAT Number"
            value={profile.vatNumber}
            onChange={(e) => setProfile({ ...profile, vatNumber: e.target.value })}
          />
          <Input
            label="VAT %"
            type="number"
            value={profile.vatPercent.toString()}
            onChange={(e) => setProfile({ ...profile, vatPercent: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <Input
          label="Laboratory Number"
          value={profile.labNumber}
          onChange={(e) => setProfile({ ...profile, labNumber: e.target.value })}
        />

        <Input
          label="PCNS"
          value={profile.pcns}
          onChange={(e) => setProfile({ ...profile, pcns: e.target.value })}
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
          onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
        />

        <Input
          label="Account Number"
          value={profile.bankAccount}
          onChange={(e) => setProfile({ ...profile, bankAccount: e.target.value })}
        />

        <Input
          label="Branch Code"
          value={profile.bankBranch}
          onChange={(e) => setProfile({ ...profile, bankBranch: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} fullWidth>
        Save Settings
      </Button>
    </div>
  );
}
