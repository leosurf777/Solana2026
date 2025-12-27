import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('Telegram bot token or chat ID not set. Telegram notifications will be disabled.');
}

export class TelegramService {
  private static instance: TelegramService;
  private bot: TelegramBot | null = null;
  private chatId: string | null = null;
  private enabled: boolean = false;

  private constructor() {
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
        this.chatId = TELEGRAM_CHAT_ID;
        this.enabled = true;
        console.log('✅ Telegram notifications enabled');
      } catch (error) {
        console.error('Failed to initialize Telegram bot:', error);
        this.enabled = false;
      }
    } else {
      console.warn('Telegram credentials not found in .env file');
      this.enabled = false;
    }
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  public async sendMessage(message: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<boolean> {
    if (!this.enabled || !this.bot || !this.chatId) {
      console.log(`[Telegram] ${message}`);
      return false;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: parseMode });
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  public async notifyLargeBuy(buyer: string, amount: number, tokenSymbol: string = 'TOKEN'): Promise<void> {
    const message = `🚀 *Large Buy Detected!*\n` +
      `• Amount: *${amount} SOL*\n` +
      `• Buyer: \`${buyer}\`\n` +
      `• Token: ${tokenSymbol}\n` +
      `• Time: ${new Date().toLocaleTimeString()}`;
    
    await this.sendMessage(message);
  }

  public async notifyBundleExecuted(amount: number, tokenSymbol: string = 'TOKEN'): Promise<void> {
    const message = `⚡ *Bundle Executed!*\n` +
      `• Amount: *${amount} SOL*\n` +
      `• Token: ${tokenSymbol}\n` +
      `• Time: ${new Date().toLocaleTimeString()}`;
    
    await this.sendMessage(message);
  }

  public async notifyError(error: string): Promise<void> {
    const message = `❌ *Error*\n` +
      `\`\`\`\n${error}\n\`\`\``;
    
    await this.sendMessage(message);
  }
}

export const telegram = TelegramService.getInstance();
