import { useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { canPromptInstall, isInAppBrowser, isInstalled, isIOSDevice, isIOSSafari, onInstallChange, promptInstall } from '@/services/install';
import { colors, radius } from '@/theme/theme';
import { Bunny } from './illustrations';
import { Button, Card, css, IconButton, Row, T } from './ui/primitives';
import { Icon } from './ui/Icon';

const LS_DISMISS = 'mlp-install-dismissed';

/** iOS Share icon (square with an arrow up), drawn inline in the steps. */
function ShareGlyph() {
  return (
    <Svg width={16} height={18} viewBox="0 0 16 20" aria-hidden>
      <Path d="M8 1 V12 M4 5 L8 1 L12 5" stroke="#2F7BF6" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 8 H2 V19 H14 V8 H11" stroke="#2F7BF6" strokeWidth={1.8} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusSquare() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <Rect x={1} y={1} width={14} height={14} rx={3} stroke="#4A3B52" strokeWidth={1.5} fill="none" />
      <Path d="M8 4.5 V11.5 M4.5 8 H11.5" stroke="#4A3B52" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Row gap={10} style={{ alignItems: 'flex-start' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <T v="chip" style={{ color: colors.accent }}>{n}</T>
      </View>
      <View style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>{children}</View>
    </Row>
  );
}

/** Step-by-step instructions for the current device; the Android/desktop case gets a real install button. */
export function InstallInstructions() {
  const promptable = useSyncExternalStore(onInstallChange, canPromptInstall, () => false);
  if (isInAppBrowser()) {
    return (
      <View style={{ gap: 8 }}>
        <T>Kamu sedang membuka lewat browser di dalam aplikasi lain (mis. Instagram/WhatsApp). Pasang dari browser utama:</T>
        <Step n={1}><T>Ketuk menu <T v="small">⋯</T> lalu pilih <T v="small">Buka di Safari / Open in browser</T>.</T></Step>
        <Step n={2}><T>Ikuti langkah pasang aplikasi di sana.</T></Step>
      </View>
    );
  }
  if (isIOSDevice()) {
    return (
      <View style={{ gap: 8 }}>
        {!isIOSSafari() && <T v="muted">Di iPhone, cara paling mudah lewat Safari. Di Chrome iPhone (iOS 16.4+) tombol Share ada di kanan atas.</T>}
        <Step n={1}><Row gap={6} wrap><T>Ketuk tombol</T><ShareGlyph /><T v="small">Share / Bagikan</T><T>{isIOSSafari() ? 'di bawah layar' : ''}</T></Row></Step>
        <Step n={2}><Row gap={6} wrap><T>Gulir lalu pilih</T><PlusSquare /><T v="small">Add to Home Screen / Tambah ke Layar Utama</T></Row></Step>
        <Step n={3}><T>Ketuk <T v="small">Add / Tambah</T>, lalu buka <T v="small">Little Planner</T> dari Home Screen.</T></Step>
        <T v="muted">Pengingat notifikasi di iPhone hanya jalan kalau dibuka dari ikon Home Screen (iOS 16.4+).</T>
      </View>
    );
  }
  if (promptable) {
    return (
      <View style={{ gap: 8 }}>
        <T>Pasang Little Planner supaya bisa dibuka langsung dari layar utama, seperti aplikasi biasa.</T>
        <Button label="Pasang aplikasi" icon={<Icon name="plus" size={16} color="#fff" />} onPress={() => promptInstall()} />
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <Step n={1}><T>Buka menu browser <T v="small">⋮</T> (Chrome/Edge).</T></Step>
      <Step n={2}><T>Pilih <T v="small">Install app / Tambahkan ke layar utama</T>.</T></Step>
    </View>
  );
}

/** Settings card: always available while not installed. */
export function InstallSettingsCard() {
  // On iPhone the Notifications card already shows these steps (installing is what enables them there).
  if (isInstalled() || isIOSDevice()) return null;
  return (
    <Card title="Pasang aplikasi">
      <InstallInstructions />
    </Card>
  );
}

/** Home banner: shown once until dismissed, only when not installed. */
export function InstallBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = !!localStorage.getItem(LS_DISMISS); } catch { /* storage unavailable */ }
    setShow(!isInstalled() && !dismissed);
  }, []);
  if (!show) return null;
  const dismiss = () => { try { localStorage.setItem(LS_DISMISS, '1'); } catch { /* ignore */ } setShow(false); };
  return (
    <View style={[{ borderRadius: radius.card, borderWidth: 1, borderColor: '#FFC1D6', padding: 14, gap: 10 }, css({ backgroundImage: 'linear-gradient(135deg,#FFF3F7,#F6F1FF)' })]}>
      <Row gap={10}>
        <Bunny size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T v="cardTitle">Pasang Little Planner di HP-mu</T>
          <T v="muted">Biar bisa dibuka dari layar utama dan dapat pengingat.</T>
        </View>
        <IconButton label="Tutup" size={36} onPress={dismiss}><Icon name="close" size={16} /></IconButton>
      </Row>
      <InstallInstructions />
      <Pressable onPress={dismiss} accessibilityRole="button" style={css({ cursor: 'pointer' })}>
        <T v="muted" style={{ textAlign: 'right' }}>Nanti saja</T>
      </Pressable>
    </View>
  );
}
