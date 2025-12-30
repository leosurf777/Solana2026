import { Heading, HStack, Text, Button, VStack, Box } from '@chakra-ui/react';
import { usePumpFunMarket } from '../hooks/usePumpFunMarket';
import { Play, Pause, Target, TrendingUp, Clock, DollarSign, Users, Zap } from 'lucide-react';

export const PumpFunScanner = () => {
  const { marketData, selectedToken, loading, startScanning, stopScanning, executeSnipe, setSelectedToken } = usePumpFunMarket();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(8)}`;
  };

  const getTokenAge = (createdAt: Date) => {
    const minutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <VStack gap={6} align="stretch" p={4}>
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Heading size="lg" color="#fbbf24" fontFamily="monospace">
          Pump.fun Scanner
        </Heading>
        <Button
          onClick={marketData.scanning ? stopScanning : startScanning}
          colorScheme={marketData.scanning ? 'red' : 'green'}
          disabled={loading}
        >
          {marketData.scanning ? (
            <>
              <Pause size={16} style={{ marginRight: '8px' }} />
              Stop Scanning
            </>
          ) : (
            <>
              <Play size={16} style={{ marginRight: '8px' }} />
              Start Scanning
            </>
          )}
        </Button>
      </HStack>

      {/* Market Stats */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Market Overview
        </Heading>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "2fr 2fr", lg: "1fr 1fr 1fr 1fr" }} gap={4}>
          <Box bg="rgba(0,0,0,0.5)" p={4} borderRadius="md">
            <HStack>
              <Target color="#22c031" size={20} />
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="#22c031">Total Tokens</Text>
                <Text fontSize="xl" fontWeight="bold" color="#fbbf24">
                  {marketData.stats.totalTokens}
                </Text>
              </VStack>
            </HStack>
          </Box>
          
          <Box bg="rgba(0,0,0,0.5)" p={4} borderRadius="md">
            <HStack>
              <Clock color="#fbbf24" size={20} />
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="#22c031">New Tokens</Text>
                <Text fontSize="xl" fontWeight="bold" color="#fbbf24">
                  {marketData.stats.newTokens}
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box bg="rgba(0,0,0,0.5)" p={4} borderRadius="md">
            <HStack>
              <DollarSign color="#22c031" size={20} />
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="#22c031">Avg Liquidity</Text>
                <Text fontSize="xl" fontWeight="bold" color="#fbbf24">
                  {formatNumber(marketData.stats.avgLiquidity)}
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box bg="rgba(0,0,0,0.5)" p={4} borderRadius="md">
            <HStack>
              <TrendingUp color="#22c031" size={20} />
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="#22c031">Total Volume</Text>
                <Text fontSize="xl" fontWeight="bold" color="#fbbf24">
                  {formatNumber(marketData.stats.totalVolume)}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </Box>

      {/* Token List */}
      <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
        <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
          Live Tokens
        </Heading>
        
        <VStack gap={3} align="stretch">
          {marketData.tokens.map((token) => (
            <Box
              key={token.address}
              bg={selectedToken?.address === token.address ? "rgba(34, 193, 49, 0.2)" : "rgba(0,0,0,0.5)"}
              border={selectedToken?.address === token.address ? "1px solid #22c031" : "1px solid transparent"}
              borderRadius="md"
              p={4}
              cursor="pointer"
              onClick={() => setSelectedToken(token)}
            >
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <Text fontWeight="bold" color="#fbbf24">{token.symbol}</Text>
                  <Text fontSize="sm" color="#22c031">{token.name}</Text>
                  <Text fontSize="xs" color={Date.now() - token.createdAt.getTime() < 600000 ? "#fbbf24" : "#666"}>
                    {getTokenAge(token.createdAt)}
                  </Text>
                </VStack>
                
                <VStack align="center" gap={1}>
                  <Text color="#fbbf24" fontFamily="monospace">
                    {formatPrice(token.price)}
                  </Text>
                  <Text fontSize="sm" color="#22c031">
                    MC: {formatNumber(token.marketCap)}
                  </Text>
                </VStack>

                <VStack align="end" gap={1}>
                  <Text color="#22c031" fontSize="sm">
                    Vol: {formatNumber(token.volume24h)}
                  </Text>
                  <HStack>
                    <Users color="#22c031" size={14} />
                    <Text color="#22c031" fontSize="sm">{token.holders}</Text>
                  </HStack>
                </VStack>

                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    executeSnipe(token, 0.01);
                  }}
                  disabled={loading}
                >
                  <Zap size={14} style={{ marginRight: '4px' }} />
                  Snipe
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Selected Token Details */}
      {selectedToken && (
        <Box bg="rgba(0, 0, 0, 0.8)" border="1px solid #22c031" borderRadius="md" p={6}>
          <Heading size="md" color="#fbbf24" fontFamily="monospace" mb={4}>
            Token Details: {selectedToken.symbol}
          </Heading>
          
          <VStack gap={4} align="stretch">
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <Box>
                <Text color="#22c031" fontSize="sm" mb={2}>Description</Text>
                <Text color="#fbbf24">{selectedToken.description || 'No description available'}</Text>
              </Box>
              
              <Box>
                <Text color="#22c031" fontSize="sm" mb={2}>Social Links</Text>
                <VStack align="start" gap={1}>
                  {selectedToken.twitter && (
                    <Text color="#22c031">Twitter: {selectedToken.twitter}</Text>
                  )}
                  {selectedToken.telegram && (
                    <Text color="#22c031">Telegram: {selectedToken.telegram}</Text>
                  )}
                  {selectedToken.website && (
                    <Text color="#22c031">Website: {selectedToken.website}</Text>
                  )}
                </VStack>
              </Box>
            </Box>

            <Box>
              <Text color="#22c031" fontSize="sm" mb={2}>Creator</Text>
              <Text color="#fbbf24" fontFamily="monospace" fontSize="sm">
                {selectedToken.creator.slice(0, 8)}...{selectedToken.creator.slice(-8)}
              </Text>
            </Box>

            <Box>
              <Text color="#22c031" fontSize="sm" mb={2}>Bonding Curve Progress</Text>
              <Box bg="rgba(0,0,0,0.5)" borderRadius="md" p={2}>
                <Box 
                  bg={selectedToken.bondingCurve > 80 ? "#fbbf24" : "#22c031"}
                  h="8px"
                  borderRadius="md"
                  width={`${selectedToken.bondingCurve}%`}
                />
              </Box>
              <Text color="#fbbf24" fontSize="sm" mt={1}>
                {selectedToken.bondingCurve}% Complete
              </Text>
            </Box>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
