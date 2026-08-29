import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, PanResponder, TextInput, ScrollView,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  send: (msg: any) => Promise<any>;
  onDisconnect: () => void;
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

type Tab = 'touch' | 'motion' | 'keys' | 'media';

// Mor tema renkleri
const C = {
  bg: '#0d0a1a',
  surface: '#1a1030',
  surface2: '#231540',
  border: '#3d2060',
  accent: '#a855f7',
  accentLight: '#c084fc',
  accentDim: '#7c3aed',
  danger: '#f43f5e',
  warning: '#facc15',
  success: '#22c55e',
  text: '#e2d9f3',
  textDim: '#8b7aa8',
};

export default function ControlScreen({ send, onDisconnect, wsStatus }: Props) {
  const [tab, setTab] = useState<Tab>('touch');
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(2);
  const [keyText, setKeyText] = useState('');

  const cursorRef = useRef({ x: 960, y: 540 });
  const lastTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const tapRef = useRef<{ count: number; timer: any }>({ count: 0, timer: null });
  const subRef = useRef<any>(null);
  const gyroRef = useRef({ x: 0, y: 0, calibrated: false });
  const [isDragging, setIsDragging] = useState(false);

  const doAction = useCallback((action: string, params: any = {}) => {
    send({ action, ...params }).catch(() => {});
  }, [send]);

  // --- TOUCH: cift tikla-surukle (laptop gibi) ---
  const handleTouchStart = useCallback((e: any) => {
    const now = Date.now();
    const px = e.nativeEvent.pageX;
    const py = e.nativeEvent.pageY;
    lastTouchRef.current = { x: px, y: py, time: now };

    // Cift tiklama kontrolu
    tapRef.current.count++;
    if (tapRef.current.count === 1) {
      tapRef.current.timer = setTimeout(() => {
        tapRef.current.count = 0;
      }, 300);
    } else if (tapRef.current.count === 2) {
      clearTimeout(tapRef.current.timer);
      tapRef.current.count = 0;
      // Cift tikla + basili tut = surukleme baslat
      setIsDragging(true);
      doAction('down', { button: 'left' });
    }
  }, [doAction]);

  const handleTouchMove = useCallback((e: any) => {
    if (!lastTouchRef.current) return;

    const px = e.nativeEvent.pageX;
    const py = e.nativeEvent.pageY;

    // Hareket edildiyse tek tik sayacini sifirla
    const dist = Math.sqrt(Math.pow(px - lastTouchRef.current.x, 2) + Math.pow(py - lastTouchRef.current.y, 2));
    if (dist > 10) {
      tapRef.current.count = 0;
      clearTimeout(tapRef.current.timer);
    }

    const dx = px - lastTouchRef.current.x;
    const dy = py - lastTouchRef.current.y;
    lastTouchRef.current = { x: px, y: py, time: Date.now() };

    const scaleX = 1920 / SCREEN_W;
    const scaleY = 1080 / SCREEN_H;
    const pcDx = Math.round(dx * scaleX * 2.5);
    const pcDy = Math.round(dy * scaleY * 2.5);

    const cur = cursorRef.current;
    cur.x = Math.max(0, Math.min(1920, cur.x + pcDx));
    cur.y = Math.max(0, Math.min(1080, cur.y + pcDy));

    doAction('move', { x: cur.x, y: cur.y });
  }, [doAction]);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    // Surukleme modundaysa birak
    if (isDragging) {
      setIsDragging(false);
      doAction('up', { button: 'left' });
    }
  }, [isDragging, doAction]);

  // --- MOTION ---
  const startMotion = useCallback(() => {
    Accelerometer.setUpdateInterval(32);
    const sub = Accelerometer.addListener((data) => {
      const cur = cursorRef.current;
      const rx = data.x || 0;
      const ry = data.y || 0;

      if (!gyroRef.current.calibrated) {
        gyroRef.current.x = rx;
        gyroRef.current.y = ry;
        gyroRef.current.calibrated = true;
      }

      const dx = rx - gyroRef.current.x;
      const dy = ry - gyroRef.current.y;
      if (Math.abs(dx) < 0.03 && Math.abs(dy) < 0.03) return;

      const moveX = dx * sensitivity * 50;
      const moveY = -dy * sensitivity * 50;

      cur.x = Math.max(0, Math.min(1920, cur.x + moveX));
      cur.y = Math.max(0, Math.min(1080, cur.y + moveY));
      send({ action: 'move', x: Math.round(cur.x), y: Math.round(cur.y) }).catch(() => {});
    });
    subRef.current = sub;
    setMotionEnabled(true);
  }, [sensitivity, send]);

  const calibrateMotion = useCallback(() => {
    gyroRef.current.calibrated = false;
  }, []);

  const stopMotion = useCallback(() => {
    if (subRef.current) { subRef.current.remove(); subRef.current = null; }
    Accelerometer.removeAllListeners();
    setMotionEnabled(false);
    gyroRef.current.calibrated = false;
  }, []);

  useEffect(() => () => stopMotion(), []);
  useEffect(() => { if (motionEnabled) { stopMotion(); startMotion(); } }, [sensitivity]);

  return (
    <View style={s.container}>
      {/* Ust bar */}
      <View style={s.topBar}>
        <View style={[s.statusDot, { backgroundColor: wsStatus === 'connected' ? C.success : wsStatus === 'connecting' ? C.warning : C.danger }]} />
        <Text style={s.statusText}>
          {wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onDisconnect}>
          <Text style={s.disconnectBtn}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {(['touch', 'motion', 'keys', 'media'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'touch' ? 'Touch' : t === 'motion' ? 'Motion' : t === 'keys' ? 'Keys' : 'Media'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.content}>
        {/* ===== DOKUNMATIK ===== */}
        {tab === 'touch' && (
          <View style={s.touchContainer}>
            {/* Ust: Kisayol butonlari */}
            <View style={s.buttonArea}>
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.hotkeyBtn, { borderColor: C.accent }]} onPress={() => doAction('hotkey', { mods: 'ALT', key: 'LEFT' })}>
                  <Text style={[s.btnLabel, { color: C.accent }]}>{'<< BACK'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.hotkeyBtn, { borderColor: C.accent }]} onPress={() => doAction('hotkey', { mods: 'ALT', key: 'RIGHT' })}>
                  <Text style={[s.btnLabel, { color: C.accent }]}>{'FORWARD >>'}</Text>
                </TouchableOpacity>
              </View>
              <View style={s.btnRow}>
                {[
                  { label: 'Ctrl+C', action: { action: 'hotkey', mods: 'CTRL', key: 'c' } },
                  { label: 'Ctrl+V', action: { action: 'hotkey', mods: 'CTRL', key: 'v' } },
                  { label: 'Ctrl+Z', action: { action: 'hotkey', mods: 'CTRL', key: 'z' } },
                  { label: 'ESC', action: { action: 'tap', key: 'ESC' } },
                  { label: 'TAB', action: { action: 'tap', key: 'TAB' } },
                  { label: 'DEL', action: { action: 'tap', key: 'DELETE' } },
                ].map(({ label, action }) => (
                  <TouchableOpacity key={label} style={s.hotkeyBtn} onPress={() => doAction(action.action, action)}>
                    <Text style={s.btnLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.btnRow}>
                <TouchableOpacity style={[s.actionBtn, s.scrollBtn]} onPress={() => doAction('scroll', { amount: 3 })}>
                  <Text style={s.btnLabel}>SCROLL UP</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, s.scrollBtn]} onPress={() => doAction('scroll', { amount: -3 })}>
                  <Text style={s.btnLabel}>SCROLL DOWN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { borderColor: C.warning }]} onPress={() => doAction('click', { button: 'middle' })}>
                  <Text style={s.btnLabel}>MIDDLE</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Orta: Touchpad */}
            <View
              style={[s.touchpadArea, isDragging && s.touchpadDragging]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleTouchStart}
              onResponderMove={handleTouchMove}
              onResponderRelease={handleTouchEnd}
            >
              {isDragging ? (
                <Text style={s.touchpadDraggingText}>DRAGGING</Text>
              ) : (
                <>
                  <Text style={s.touchpadHint}>TOUCHPAD</Text>
                  <Text style={s.touchpadSubtext}>Swipe = move cursor | Double-tap+hold = drag</Text>
                </>
              )}
            </View>

            {/* Bottom: Drag + Left Click / Right Click */}
            <View style={s.bottomButtons}>
              <TouchableOpacity
                style={[s.bottomBtn, isDragging ? s.dragActive : { backgroundColor: '#1e40af' }]}
                onPress={() => {
                  if (isDragging) {
                    doAction('up', { button: 'left' });
                    setIsDragging(false);
                  } else {
                    setIsDragging(true);
                    doAction('down', { button: 'left' });
                  }
                }}
              >
                <Text style={s.bottomBtnText}>{isDragging ? 'RELEASE' : 'DRAG'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.bottomBtn, { backgroundColor: '#1e40af' }]}
                onPress={() => doAction('click', { button: 'left' })}
              >
                <Text style={s.bottomBtnText}>LEFT CLICK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.bottomBtn, { backgroundColor: '#991b1b' }]}
                onPress={() => doAction('click', { button: 'right' })}
              >
                <Text style={s.bottomBtnText}>RIGHT CLICK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===== MOTION ===== */}
        {tab === 'motion' && (
          <View style={s.motionArea}>
            <TouchableOpacity
              style={[s.motionToggle, motionEnabled && s.motionToggleActive]}
              onPress={() => motionEnabled ? stopMotion() : startMotion()}
            >
              <Text style={[s.motionToggleText, motionEnabled && s.motionToggleTextActive]}>
                {motionEnabled ? 'MOTION ACTIVE - Stop' : 'Start Motion'}
              </Text>
            </TouchableOpacity>

            <Text style={s.motionHint}>Hold phone upright, tap Start, then tilt to move cursor</Text>

            {motionEnabled && (
              <TouchableOpacity style={s.calibrateBtn} onPress={calibrateMotion}>
                <Text style={s.calibrateBtnText}>Calibrate (reset center)</Text>
              </TouchableOpacity>
            )}

            <View style={s.sensitivityRow}>
              <Text style={s.sensLabel}>Sensitivity: {sensitivity}</Text>
              <View style={s.sensBtns}>
                {[1, 2, 3, 4, 5].map((sv) => (
                  <TouchableOpacity key={sv} style={[s.sensBtn, sv === sensitivity && s.sensBtnActive]} onPress={() => setSensitivity(sv)}>
                    <Text style={[s.sensBtnText, sv === sensitivity && s.sensBtnTextActive]}>{sv}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity style={[s.bottomBtn, { backgroundColor: '#1e40af' }]} onPress={() => doAction('click', { button: 'left' })}>
                <Text style={s.bottomBtnText}>LEFT CLICK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.bottomBtn, { backgroundColor: '#991b1b' }]} onPress={() => doAction('click', { button: 'right' })}>
                <Text style={s.bottomBtnText}>RIGHT CLICK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===== KEYS ===== */}
        {tab === 'keys' && (
          <ScrollView style={s.keysArea}>
            <TextInput
              style={s.keyInput}
              placeholder="Type text..."
              placeholderTextColor={C.textDim}
              value={keyText}
              onChangeText={setKeyText}
              onSubmitEditing={() => { if (keyText) { doAction('type', { text: keyText }); setKeyText(''); } }}
              returnKeyType="send"
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.sendBtn} onPress={() => { if (keyText) { doAction('type', { text: keyText }); setKeyText(''); } }}>
              <Text style={s.sendBtnText}>Send</Text>
            </TouchableOpacity>

            {/* Control keys */}
            <Text style={s.sectionLabel}>Control Keys</Text>
            <View style={s.keyGrid}>
              {[
                ['ENTER', 'TAB', 'BACKSPACE', 'DELETE'],
                ['UP', 'DOWN', 'LEFT', 'RIGHT'],
                ['HOME', 'END', 'PAGEUP', 'PAGEDOWN'],
                ['F1', 'F2', 'F3', 'F4'],
                ['F5', 'F6', 'F7', 'F8'],
                ['F9', 'F10', 'F11', 'F12'],
              ].map((row, i) => (
                <View key={i} style={s.keyRow}>
                  {row.map((k) => (
                    <TouchableOpacity key={k} style={s.keyBtn} onPress={() => doAction('tap', { key: k })}>
                      <Text style={s.keyBtnText}>{k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ===== MEDIA ===== */}
        {tab === 'media' && (
          <View style={s.mediaArea}>
            {[
              { label: 'Volume Up', key: 'volumeup', color: C.success },
              { label: 'Volume Down', key: 'volumedown', color: C.danger },
              { label: 'Mute', key: 'mute', color: C.warning },
              { label: 'Play / Pause', key: 'playpause', color: C.accent },
              { label: 'Next', key: 'next', color: C.accentLight },
              { label: 'Previous', key: 'prev', color: C.accentLight },
              { label: 'Stop', key: 'stop', color: C.danger },
            ].map(({ label, key, color }) => (
              <TouchableOpacity key={key} style={[s.mediaBtn, { borderColor: color }]} onPress={() => doAction('media', { key })}>
                <Text style={[s.mediaLabel, { color }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 48,
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: C.textDim, fontSize: 13 },
  disconnectBtn: { color: C.danger, fontSize: 13, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabText: { color: C.textDim, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: C.accent },
  content: { flex: 1 },

  // Touch
  touchContainer: { flex: 1 },
  buttonArea: { padding: 10, gap: 6 },
  btnRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  actionBtn: {
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10,
    backgroundColor: C.surface2, borderWidth: 1.5, minWidth: 68, alignItems: 'center',
  },
  scrollBtn: { borderColor: C.textDim },
  hotkeyBtn: {
    paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
  },
  btnLabel: { color: C.text, fontSize: 11, fontWeight: '700' },

  // Touchpad
  touchpadArea: {
    flex: 1, backgroundColor: '#0f0820', borderTopWidth: 1, borderTopColor: C.border,
    borderBottomWidth: 1, borderBottomColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  touchpadHint: { color: C.accent, fontSize: 20, fontWeight: '900', letterSpacing: 4 },
  touchpadSubtext: { color: C.textDim, fontSize: 12, marginTop: 8 },
  touchpadDragging: { backgroundColor: '#7c3aed44' },
  touchpadDraggingText: { color: C.accent, fontSize: 18, fontWeight: '900', letterSpacing: 3 },

  // Bottom click buttons
  bottomButtons: {
    flexDirection: 'row', gap: 0, padding: 0,
  },
  bottomBtn: {
    flex: 1, paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
  },
  bottomBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  dragActive: { backgroundColor: '#7c3aed' },

  // Motion
  motionArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  motionToggle: {
    paddingVertical: 20, paddingHorizontal: 40, borderRadius: 20,
    backgroundColor: C.surface2, borderWidth: 2, borderColor: C.border, marginBottom: 24,
  },
  motionToggleActive: { backgroundColor: '#a855f722', borderColor: C.accent },
  motionToggleText: { color: C.textDim, fontSize: 16, fontWeight: '700' },
  motionToggleTextActive: { color: C.accent },
  motionHint: { color: C.textDim, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  calibrateBtn: {
    marginBottom: 20, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    backgroundColor: '#facc1522', borderWidth: 1, borderColor: C.warning,
  },
  calibrateBtnText: { color: C.warning, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sensitivityRow: { alignItems: 'center', marginBottom: 24 },
  sensLabel: { color: C.textDim, fontSize: 14, marginBottom: 8 },
  sensBtns: { flexDirection: 'row', gap: 8 },
  sensBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  sensBtnActive: { backgroundColor: '#a855f722', borderColor: C.accent },
  sensBtnText: { color: C.textDim, fontSize: 14, fontWeight: '700' },
  sensBtnTextActive: { color: C.accent },

  // Keys
  keysArea: { flex: 1, padding: 16 },
  keyInput: {
    backgroundColor: C.surface2, color: C.text, borderRadius: 12, padding: 16,
    fontSize: 16, borderWidth: 1, borderColor: C.border, marginBottom: 8,
  },
  sendBtn: { backgroundColor: C.accent, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16 },
  sendBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  keyGrid: { gap: 8, marginBottom: 12 },
  sectionLabel: { color: C.textDim, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  keyRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  keyBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
  },
  keyBtnText: { color: C.text, fontSize: 12, fontWeight: '600' },

  // Media
  mediaArea: { flex: 1, padding: 24, gap: 12 },
  mediaBtn: {
    padding: 18, backgroundColor: C.surface2, borderRadius: 12, borderWidth: 1.5, alignItems: 'center',
  },
  mediaLabel: { fontSize: 16, fontWeight: '700' },
});
