import { useState } from 'react';
import { View } from 'react-native';
import { addDays, isValidDate, toDateStr } from '@/domain';
import { Button, Chip, Label, Row } from '@/components/ui/primitives';
import { WebDateTimeInput } from '@/components/task/WebDateTimeInput';
import { Sheet } from '@/components/ui/Overlays';

export function RescheduleSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (date: string) => void }) {
  const today = toDateStr(new Date());
  const [date, setDate] = useState(addDays(today, 1));
  const [err, setErr] = useState<string>();
  return (
    <Sheet visible={visible} onClose={onClose} title="Jadwalkan ulang"
      footer={<Button label="Simpan" onPress={() => (isValidDate(date) ? onPick(date) : setErr('Pilih tanggal dulu'))} />}>
      <Row wrap>
        <Chip label="Besok" selected={date === addDays(today, 1)} onPress={() => setDate(addDays(today, 1))} />
        <Chip label="Lusa" selected={date === addDays(today, 2)} onPress={() => setDate(addDays(today, 2))} />
        <Chip label="Minggu depan" selected={date === addDays(today, 7)} onPress={() => setDate(addDays(today, 7))} />
      </Row>
      <View>
        <Label>Tanggal</Label>
        <WebDateTimeInput type="date" label="Tanggal baru" value={date} min={today} onChange={(d) => { setDate(d); setErr(undefined); }} error={err} />
      </View>
    </Sheet>
  );
}
