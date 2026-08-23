import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Radio } from '../../../components/ui/Radio';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

const RESULTS = ['İşlem yapılmadı', 'Uyarı', 'Tutanak', 'Ceza', 'İdari işlem', 'Takip gerektiren işlem', 'Diğer'];

export default function Step7Result() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();

  if (!currentDraft) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">İşlem Sonucu</h2>
        <p className="text-gray-500">Denetimin nasıl sonlandığını ve onay sürecini kaydedin.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Sonuç</label>
        <div className="flex flex-wrap gap-2">
          {RESULTS.map(result => (
            <Radio
              key={result}
              label={result}
              name="result"
              checked={currentDraft.result === result}
              onChange={() => updateField('result', result)}
            />
          ))}
        </div>
        {currentDraft.result === 'Diğer' && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.result || ''}
            onChange={(e) => updateOtherField('result', e.target.value)}
          />
        )}
      </div>

      <Input
        label="Sonucu kim onaylıyor?"
        placeholder="Örn: Nöbetçi Amir"
        value={currentDraft.whoApproves || ''}
        onChange={(e) => updateField('whoApproves', e.target.value)}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 ml-1">Başka bir birime aktarılıyor mu?</label>
        <div className="flex flex-wrap gap-2">
          <Radio
            label="Hayır"
            name="transferredToOtherDept"
            checked={currentDraft.transferredToOtherDept === false}
            onChange={() => updateField('transferredToOtherDept', false)}
          />
          <Radio
            label="Evet"
            name="transferredToOtherDept"
            checked={currentDraft.transferredToOtherDept === true}
            onChange={() => updateField('transferredToOtherDept', true)}
          />
        </div>
      </div>

      {currentDraft.transferredToOtherDept && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <Input
            label="Hangi Birim?"
            placeholder="Örn: Fen İşleri, Çevre Koruma..."
            value={currentDraft.otherDeptName || ''}
            onChange={(e) => updateField('otherDeptName', e.target.value)}
          />
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 ml-1">Vatandaşa / işletmeye bilgi verildi mi?</label>
        <div className="flex flex-wrap gap-2">
          <Radio
            label="Hayır"
            name="citizenInformed"
            checked={currentDraft.citizenInformed === false}
            onChange={() => updateField('citizenInformed', false)}
          />
          <Radio
            label="Evet"
            name="citizenInformed"
            checked={currentDraft.citizenInformed === true}
            onChange={() => updateField('citizenInformed', true)}
          />
        </div>
      </div>

      {currentDraft.citizenInformed && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <Textarea
            label="Nasıl bilgi verildi?"
            placeholder="Örn: SMS gönderildi, sözlü olarak söylendi..."
            value={currentDraft.howCitizenInformed || ''}
            onChange={(e) => updateField('howCitizenInformed', e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
