import { Box, Container, Heading, VStack } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletContextProvider } from "./contexts/WalletContext";
import { useEffect, useRef } from "react";
import { TradingDashboard } from "./components/TradingDashboard";
import { TradingPanel } from "./components/TradingPanel";
import { PumpFunScanner } from "./components/PumpFunScanner";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");

    const fontSize = 10;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#22c031';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0.8
      }}
    />
  );
};

export function App() {
  return (
    <WalletContextProvider>
      <MatrixRain />
      <Box 
        p={4} 
        bg="rgba(0, 0, 0, 0.6)" 
        border="1px solid #22c031" 
        borderRadius="md"
        minH="100vh"
        position="relative"
        zIndex={1}
      >
        <Container 
          maxW="container.xl"
          bg="rgba(0, 0, 0, 0.8)"
          border="1px solid #fbbf24"
          borderRadius="md"
          boxShadow="0 0 20px rgba(251, 191, 36, 0.3)"
          p={6}
        >
          <VStack gap={6} align="stretch">
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
            >
              <Heading 
                as="h1" 
                size="xl"
                fontFamily='"Courier New", monospace'
                color="#fbbf24"
                textShadow="0 0 10px #fbbf24, 0 0 20px #fbbf24"
              >
                LK Trading In House Bot
              </Heading>
              <Box
                css={{
                  '& button': {
                    fontFamily: '"Courier New", monospace',
                    bg: '#000000',
                    color: '#22c031',
                    border: '2px solid #22c031',
                    boxShadow: '0 0 10px #22c031',
                    '&:hover': {
                      bg: '#22c031',
                      color: '#000000',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 15px #22c031',
                    },
                    '&:active': {
                      bg: '#005a0f',
                    },
                  }
                }}
              >
                <WalletMultiButton />
              </Box>
            </Box>
            
            <Box 
              display="grid" 
              gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }}
              gap={6}
            >
              <TradingDashboard />
              <TradingPanel />
              <PumpFunScanner />
            </Box>
          </VStack>
        </Container>
      </Box>
    </WalletContextProvider>
  );
}