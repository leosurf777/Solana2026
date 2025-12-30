import { useState } from 'react';
import { Heading, HStack, Text, Button, VStack, Box, Input } from '@chakra-ui/react';
import { useTradingData } from '../hooks/useTradingData';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const TradingPanel = () => {
  const { tokens, trades, executeTrade, loading } = useTradingData();
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState('0.1');

  const handleTrade = (type: 'buy' | 'sell') => {
    if (selectedToken && amount) {
      executeTrade(type, selectedToken, parseFloat(amount));
    }
  };

  return (
    <VStack gap={6} align="stretch" p={4}>
      {/* Header */}
      <Heading size="lg" color="#fbbf24" fontFamily="monospace">
        Trading Panel
      </Heading>

      {/* Token Selection */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Select Token
        </Heading>
        <VStack gap={3} align="stretch">
          {tokens.map((token) => (
            <HStack
              key={token.address}
              justify="space-between"
              p={3}
              bg={selectedToken?.address === token.address ? "rgba(34, 193, 49, 0.2)" : "rgba(0,0,0,0.5)"}
              borderRadius="md"
              cursor="pointer"
              border={selectedToken?.address === token.address ? "1px solid #22c031" : "1px solid transparent"}
              onClick={() => setSelectedToken(token)}
            >
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

      {/* Trading Interface */}
      {selectedToken && (
        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
          <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
            Trade {selectedToken.symbol}
          </Heading>
          <VStack gap={4} align="stretch">
            <Box>
              <Text color="#22c031" fontSize="sm" mb={2}>Amount (SOL)</Text>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                bg="rgba(0,0,0,0.5)"
                borderColor="#22c031"
                color="#fbbf24"
                step="0.01"
                min="0.01"
              />
            </Box>

            <Box bg="rgba(0,0,0,0.3)" p={3} borderRadius="md">
              <HStack justify="space-between">
                <Text color="#22c031" fontSize="sm">Estimated Cost</Text>
                <Text color="#fbbf24" fontWeight="bold">
                  ${(parseFloat(amount || '0') * selectedToken.price).toFixed(2)}
                </Text>
              </HStack>
            </Box>

            <HStack gap={3}>
              <Button
                flex={1}
                colorScheme="green"
                onClick={() => handleTrade('buy')}
                disabled={loading}
              >
                <ArrowUpRight size={16} style={{ marginRight: '8px' }} />
                Buy
              </Button>
              <Button
                flex={1}
                colorScheme="red"
                onClick={() => handleTrade('sell')}
                disabled={loading}
              >
                <ArrowDownRight size={16} style={{ marginRight: '8px' }} />
                Sell
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Quick Stats */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Quick Stats
        </Heading>
        <VStack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text color="#22c031" fontSize="sm">Total Trades</Text>
            <Text color="#fbbf24" fontWeight="bold">{trades.length}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="#22c031" fontSize="sm">Buy Trades</Text>
            <Text color="#22c031" fontWeight="bold">
              {trades.filter(t => t.type === 'buy').length}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="#22c031" fontSize="sm">Sell Trades</Text>
            <Text color="#ff4444" fontWeight="bold">
              {trades.filter(t => t.type === 'sell').length}
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="#22c031" fontSize="sm">Total P&L</Text>
            <Text 
              color={trades.reduce((sum, t) => sum + (t.profit || 0), 0) >= 0 ? '#22c031' : '#ff4444'} 
              fontWeight="bold"
            >
              ${trades.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
