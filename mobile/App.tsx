import React, { useState, useCallback } from 'react';
import { StatusBar, View, StyleSheet, LogBox } from 'react-native';
LogBox.ignoreAllLogs();
import ConnectionScreen from './src/screens/ConnectionScreen';
import ControlScreen from './src/screens/ControlScreen';
import { useWebSocket } from './src/ws/useWebSocket';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({ ip: '', port: 8321 });
  const ws = useWebSocket();

  const handleConnect = useCallback(async (ip: string, port: number) => {
    await ws.connect(ip, port);
    setConnectionInfo({ ip, port });
    setConnected(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    ws.disconnect();
    setConnected(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      {connected ? (
        <ControlScreen send={ws.send} onDisconnect={handleDisconnect} wsStatus={ws.status} />
      ) : (
        <ConnectionScreen onConnected={handleConnect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
});
