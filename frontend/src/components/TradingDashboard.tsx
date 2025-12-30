import { Heading, HStack, Text, Button, Badge, VStack, Box } from '@chakra-ui/react';
import { useTradingData } from '../hooks/useTradingData';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Settings } from 'lucide-react';

export const TradingDashboard = () => {
  const { tokens, trades, settings } = useTradingData();

  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const activePositions = trades.filter(trade => trade.status === 'confirmed').length;

  return (
    <VStack gap={6} align="stretch" p={4}>
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Heading size="lg" color="#fbbf24" fontFamily="monospace">
          Trading Dashboard
        </Heading>
        <Button variant="outline" borderColor="#22c031" color="#22c031">
          <Settings size={16} style={{ marginRight: '8px' }} />
          Settings
        </Button>
      </HStack>

      {/* Stats Overview */}
      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "2fr 2fr", lg: "1fr 1fr 1fr 1fr" }} gap={4}>
        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={4}>
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="#22c031">Total Profit</Text>
              <Text fontSize="2xl" fontWeight="bold" color="#fbbf24">
                ${totalProfit.toFixed(2)}
              </Text>
            </VStack>
            <DollarSign color="#22c031" size={24} />
          </HStack>
        </Box>

        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={4}>
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="#22c031">Active Positions</Text>
              <Text fontSize="2xl" fontWeight="bold" color="#fbbf24">
                {activePositions}
              </Text>
            </VStack>
            <Activity color="#22c031" size={24} />
          </HStack>
        </Box>

        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={4}>
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="#22c031">Total Trades</Text>
              <Text fontSize="2xl" fontWeight="bold" color="#fbbf24">
                {trades.length}
              </Text>
            </VStack>
            <BarChart3 color="#22c031" size={24} />
          </HStack>
        </Box>

        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={4}>
          <HStack justify="space-between">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="#22c031">Bot Status</Text>
              <Badge colorScheme={settings.enabled ? 'green' : 'red'}>
                {settings.enabled ? 'Active' : 'Inactive'}
              </Badge>
            </VStack>
            <Activity color="#22c031" size={24} />
          </HStack>
        </Box>
      </Box>

      {/* Market Overview */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Market Overview
        </Heading>
        <VStack gap={3} align="stretch">
          {tokens.map((token) => (
            <HStack key={token.address} justify="space-between" p={3} bg="rgba(0,0,0,0.5)" borderRadius="md">
              <VStack align="start" gap={1}>
                <Text fontWeight="bold" color="#fbbf24">{token.symbol}</Text>
                <Text fontSize="sm" color="#22c031">{token.name}</Text>
              </VStack>
              <VStack align="end" gap={1}>
                <HStack>
                  <Text fontWeight="bold" color="#fbbf24">${token.price.toFixed(2)}</Text>
                  {token.change24h >= 0 ? (
                    <TrendingUp color="#22c031" size={16} />
                  ) : (
                    <TrendingDown color="#ff4444" size={16} />
                  )}
                </HStack>
                <Text fontSize="sm" color={token.change24h >= 0 ? '#22c031' : '#ff4444'}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Recent Trades */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Recent Trades
        </Heading>
        <VStack gap={3} align="stretch">
          {trades.slice(0, 5).map((trade) => (
            <HStack key={trade.id} justify="space-between" p={3} bg="rgba(0,0,0,0.5)" borderRadius="md">
              <VStack align="start" gap={1}>
                <Badge colorScheme={trade.type === 'buy' ? 'green' : 'red'}>
                  {trade.type.toUpperCase()}
                </Badge>
                <Text fontSize="sm" color="#22c031">{trade.token.slice(0, 8)}...</Text>
              </VStack>
              <VStack align="center" gap={1}>
                <Text fontWeight="bold" color="#fbbf24">{trade.amount} SOL</Text>
                <Text fontSize="sm" color="#22c031">${trade.price.toFixed(2)}</Text>
              </VStack>
              <VStack align="end" gap={1}>
                <Badge colorScheme={trade.status === 'confirmed' ? 'green' : 'yellow'}>
                  {trade.status}
                </Badge>
                {trade.profit && (
                  <Text fontSize="sm" color="#22c031">
                    P&L: ${trade.profit.toFixed(2)}
                  </Text>
                )}
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};