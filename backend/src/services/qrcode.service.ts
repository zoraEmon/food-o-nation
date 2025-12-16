import QRCode from 'qrcode';

export class QRCodeService {
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code.');
    }
  }

  async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#004225',
          light: '#FFFFFF'
        }
      });
      return qrCodeBuffer;
    } catch (error) {
      console.error('Error generating QR code buffer:', error);
      throw new Error('Failed to generate QR code buffer.');
    }
  }
}