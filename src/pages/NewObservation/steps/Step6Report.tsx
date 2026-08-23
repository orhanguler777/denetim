import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Radio } from '../../../components/ui/Radio';
import { Textarea } from '../../../components/ui/Textarea';
import { Checkbox } from '../../../components/ui/Checkbox';

const PREPARATION_METHODS = ['Kağıt', 'Bilgisayar', 'Mobil cihaz', 'Hazır şablon', 'Elle yazılıyor', 'Diğer'];
const SIGNERS = ['Personel', 'Vatandaş', 'İşletme sahibi', 'Amir', 'Diğer'];
const SIGNATURE_METHODS = ['Kağıt', 'Dijital', 'Diğer'];

export default function Step6Report() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();

  if (!currentDraft) return null;

  const handleSignerToggle = (signer: string) => {
    // We'll store it as comma separated in `whoSigns` for simplicity or array if we update type. 
    // Type is string for whoSigns, so let's handle it as comma separated.
    let current = currentDraft.whoSigns ? currentDraft.whoSigns.split(', ') : [];
    if (current.includes(signer)) {
      current = current.filter(s => s !== signer);
    } else {
      current.push(signer);
    }
    updateField('whoSigns', current.join(', '));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Tutanak ve Belgeler</h2>
        <p className="text-gray-500">İşlem sonucunda hazırlanan resmi belgeleri analiz edin.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 ml-1">Tutanak gerekiyor mu?</label>
        <div className="flex flex-wrap gap-2">
          <Radio
            label="Hayır"
            name="reportRequired"
            checked={currentDraft.reportRequired === false}
            onChange={() => updateField('reportRequired', false)}
          />
          <Radio
            label="Evet"
            name="reportRequired"
            checked={currentDraft.reportRequired === true}
            onChange={() => updateField('reportRequired', true)}
          />
        </div>
      </div>

      {currentDraft.reportRequired && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Tutanak nasıl hazırlanıyor?</label>
            <div className="flex flex-wrap gap-2">
              {PREPARATION_METHODS.map(method => (
                <Radio
                  key={method}
                  label={method}
                  name="reportPreparation"
                  checked={currentDraft.reportPreparation === method}
                  onChange={() => updateField('reportPreparation', method)}
                />
              ))}
            </div>
            {currentDraft.reportPreparation === 'Diğer' && (
              <Input
                placeholder="Lütfen belirtin..."
                value={currentDraft.otherFields?.reportPreparation || ''}
                onChange={(e) => updateOtherField('reportPreparation', e.target.value)}
              />
            )}
          </div>

          <Textarea
            label="Tutanakta hangi bilgiler bulunuyor?"
            placeholder="Örn: TC Kimlik, Adres, Ceza Maddesi..."
            value={currentDraft.reportContent || ''}
            onChange={(e) => updateField('reportContent', e.target.value)}
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 ml-1">İmza gerekiyor mu?</label>
            <div className="flex flex-wrap gap-2">
              <Radio
                label="Hayır"
                name="signatureRequired"
                checked={currentDraft.signatureRequired === false}
                onChange={() => updateField('signatureRequired', false)}
              />
              <Radio
                label="Evet"
                name="signatureRequired"
                checked={currentDraft.signatureRequired === true}
                onChange={() => updateField('signatureRequired', true)}
              />
            </div>
          </div>

          {currentDraft.signatureRequired && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 ml-1">Kim imzalıyor?</label>
                <div className="flex flex-wrap gap-2">
                  {SIGNERS.map(signer => (
                    <Checkbox
                      key={signer}
                      label={signer}
                      checked={(currentDraft.whoSigns || '').includes(signer)}
                      onChange={() => handleSignerToggle(signer)}
                    />
                  ))}
                </div>
                {(currentDraft.whoSigns || '').includes('Diğer') && (
                  <Input
                    placeholder="Lütfen belirtin..."
                    value={currentDraft.otherFields?.whoSigns || ''}
                    onChange={(e) => updateOtherField('whoSigns', e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 ml-1">İmza nasıl alınıyor?</label>
                <div className="flex flex-wrap gap-2">
                  {SIGNATURE_METHODS.map(method => (
                    <Radio
                      key={method}
                      label={method}
                      name="howSigned"
                      checked={currentDraft.howSigned === method}
                      onChange={() => updateField('howSigned', method)}
                    />
                  ))}
                </div>
                {currentDraft.howSigned === 'Diğer' && (
                  <Input
                    placeholder="Lütfen belirtin..."
                    value={currentDraft.otherFields?.howSigned || ''}
                    onChange={(e) => updateOtherField('howSigned', e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          <Textarea
            label="Tutanak sonrasında nereye gidiyor?"
            placeholder="Örn: Merkez arşive fiziksel teslim ediliyor."
            value={currentDraft.reportDestination || ''}
            onChange={(e) => updateField('reportDestination', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
