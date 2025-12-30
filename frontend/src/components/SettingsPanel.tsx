import { Heading, HStack, Text, Button, VStack, Box, Input } from '@chakra-ui/react';
import { useTradingData } from '../hooks/useTradingData';
import { Save, RotateCcw, Play, Pause } from 'lucide-react';

export const SettingsPanel = () => {
  const { settings, updateSettings } = useTradingData();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const resetSettings = () => {
    updateSettings({
      enabled: true,
      minBuyAmount: 0.1,
      maxBuyAmount: 5.0,
      slippage: 1.0,
      autoSell: true,
      takeProfit: 50.0,
      stopLoss: 10.0,
      maxPositions: 5,
      cooldownPeriod: 10000,
      monitorTokens: ['So11111111111111111111111111111111111111112'],
      telegramNotifications: true,
      tradingMode: 'hybrid'
    });
  };

  return (
    <VStack gap={6} align="stretch" p={4}>
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Heading size="lg" color="#fbbf24" fontFamily="monospace">
          Bot Settings
        </Heading>
        <HStack gap={2}>
          <Button 
            onClick={resetSettings}
            variant="outline" 
            borderColor="#22c031" 
            color="#22c031"
          >
            <RotateCcw size={16} style={{ marginRight: '8px' }} />
            Reset
          </Button>
          <Button 
            variant="outline" 
            borderColor="#22c031" 
            color="#22c031"
          >
            <Save size={16} style={{ marginRight: '8px' }} />
            Save
          </Button>
        </HStack>
      </HStack>

      {/* Bot Status */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Bot Status
        </Heading>
        <HStack justify="space-between" align="center">
          <Text color="#22c031">Trading Bot</Text>
          <Button
            onClick={() => handleSettingChange('enabled', !settings.enabled)}
            colorScheme={settings.enabled ? 'green' : 'red'}
          >
            {settings.enabled ? (
              <>
                <Pause size={16} style={{ marginRight: '8px' }} />
                Stop
              </>
            ) : (
              <>
                <Play size={16} style={{ marginRight: '8px' }} />
                Start
              </>
            )}
          </Button>
        </HStack>
      </Box>

      {/* Trading Parameters */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Trading Parameters
        </Heading>
        <VStack gap={4} align="stretch">
          <Box>
            <Text color="#22c031" mb={2}>Min Buy Amount (SOL)</Text>
            <Input
              type="number"
              value={settings.minBuyAmount}
              onChange={(e) => handleSettingChange('minBuyAmount', parseFloat(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>
          
          <Box>
            <Text color="#22c031" mb={2}>Max Buy Amount (SOL)</Text>
            <Input
              type="number"
              value={settings.maxBuyAmount}
              onChange={(e) => handleSettingChange('maxBuyAmount', parseFloat(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>

          <Box>
            <Text color="#22c031" mb={2}>Slippage (%)</Text>
            <Input
              type="number"
              value={settings.slippage}
              onChange={(e) => handleSettingChange('slippage', parseFloat(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>

          <Box>
            <Text color="#22c031" mb={2}>Max Positions</Text>
            <Input
              type="number"
              value={settings.maxPositions}
              onChange={(e) => handleSettingChange('maxPositions', parseInt(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>
        </VStack>
      </Box>

      {/* Risk Management */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Risk Management
        </Heading>
        <VStack gap={4} align="stretch">
          <Box>
            <Text color="#22c031" mb={2}>Take Profit (%)</Text>
            <Input
              type="number"
              value={settings.takeProfit}
              onChange={(e) => handleSettingChange('takeProfit', parseFloat(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>

          <Box>
            <Text color="#22c031" mb={2}>Stop Loss (%)</Text>
            <Input
              type="number"
              value={settings.stopLoss}
              onChange={(e) => handleSettingChange('stopLoss', parseFloat(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>

          <Box>
            <Text color="#22c031" mb={2}>Cooldown Period (ms)</Text>
            <Input
              type="number"
              value={settings.cooldownPeriod}
              onChange={(e) => handleSettingChange('cooldownPeriod', parseInt(e.target.value))}
              borderColor="#22c031"
              color="#fbbf24"
              _placeholder={{ color: "#666" }}
            />
          </Box>
        </VStack>
      </Box>

      {/* Notifications */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Notifications
        </Heading>
        <HStack justify="space-between" align="center">
          <Text color="#22c031">Telegram Notifications</Text>
          <Button
            onClick={() => handleSettingChange('telegramNotifications', !settings.telegramNotifications)}
            colorScheme={settings.telegramNotifications ? 'green' : 'gray'}
          >
            {settings.telegramNotifications ? 'Enabled' : 'Disabled'}
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
};
