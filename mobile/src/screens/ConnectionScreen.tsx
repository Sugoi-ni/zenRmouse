import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Platform, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width: SCREEN_W } = Dimensions.get('window');

const C = {
  bg: '#0d0a1a',
  surface: '#1a1030',
  surface2: '#231540',
  border: '#3d2060',
  accent: '#a855f7',
  danger: '#f43f5e',
  text: '#e2d9f3',
  textDim: '#8b7aa8',
};

interface Props {
  onConnected: (ip: string, port: number) => void;
}

export default function ConnectionScreen({ onConnected }: Props) {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8321');
  const [mode, setMode] = useState<'manual' | 'qr'>('manual');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  const connect = async (targetIp: string, targetPort: string) => {
    setStatus('connecting');
    setErrorMsg('');
    try {
      onConnected(targetIp, parseInt(targetPort, 10));
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'connection failed');
    }
  };

  const handleBarcode = ({ data }: { data: string }) => {
    try {
      const parsed = JSON.parse(data);
      // New format: { url: "ws://..." }
      if (parsed.url) {
        const url = parsed.url.replace(/^ws:\/\//, '');
        const lastColon = url.lastIndexOf(':');
        if (lastColon > 0) {
          const host = url.substring(0, lastColon);
          const port = url.substring(lastColon + 1);
          setIp(host);
          setPort(port);
          connect(host, port);
        }
      }
      // Old format: { ip, port }
      else if (parsed.ip && parsed.port) {
        setIp(parsed.ip);
        setPort(String(parsed.port));
        connect(parsed.ip, String(parsed.port));
      }
    } catch {}
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo-icon.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>ZenRmouse</Text>
      <Text style={styles.subtitle}>PC Remote Control</Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'manual' && styles.modeBtnActive]}
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.modeBtnText, mode === 'manual' && styles.modeBtnTextActive]}>
            Manual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'qr' && styles.modeBtnActive]}
          onPress={() => {
            setMode('qr');
            if (!permission?.granted) requestPermission();
          }}
        >
          <Text style={[styles.modeBtnText, mode === 'qr' && styles.modeBtnTextActive]}>
            QR Code
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'manual' ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="PC IP address (e.g. 192.168.1.8)"
            placeholderTextColor={C.textDim}
            value={ip}
            onChangeText={setIp}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Port (default: 8321)"
            placeholderTextColor={C.textDim}
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => connect(ip, port)}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectBtnText}>Connect</Text>
            )}
          </TouchableOpacity>
          {status === 'error' && (
            <Text style={styles.error}>{errorMsg}</Text>
          )}
        </View>
      ) : (
        <View style={styles.qrContainer}>
          {permission?.granted ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={status !== 'connecting' ? handleBarcode : undefined}
            >
              <View style={styles.overlay}>
                <View style={styles.qrFrame} />
                <Text style={styles.qrHint}>Scan QR code</Text>
              </View>
            </CameraView>
          ) : (
            <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
              <Text style={styles.permBtnText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  logo: { width: 120, height: 120, marginBottom: 16 },
  title: { fontSize: 42, fontWeight: '900', color: C.accent, marginBottom: 4 },
  subtitle: { fontSize: 16, color: C.textDim, marginBottom: 32 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  modeBtnActive: { backgroundColor: '#a855f722', borderColor: C.accent },
  modeBtnText: { color: C.textDim, fontSize: 14, fontWeight: '600' },
  modeBtnTextActive: { color: C.accent },
  form: { width: '100%', maxWidth: 360, gap: 12 },
  input: {
    backgroundColor: C.surface2, color: C.text, borderRadius: 12, padding: 16,
    fontSize: 16, borderWidth: 1, borderColor: C.border,
  },
  connectBtn: {
    backgroundColor: C.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8,
  },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: C.danger, textAlign: 'center', marginTop: 8 },
  qrContainer: { width: SCREEN_W * 0.8, aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  qrFrame: {
    width: 200, height: 200, borderWidth: 2, borderColor: C.accent, borderRadius: 12,
  },
  qrHint: { color: '#fff', marginTop: 16, fontSize: 14 },
  permBtn: {
    flex: 1, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border, borderRadius: 12,
  },
  permBtnText: { color: C.accent, fontSize: 16 },
});
