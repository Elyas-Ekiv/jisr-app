const axios = require('axios');
const crypto = require('crypto');
const config = require('./env');

class ThawaniService {
  constructor() {
    this.apiKey = config.thawaniApiKey;
    this.secretKey = config.thawaniSecretKey;
    this.publishableKey = config.thawaniPublishableKey;
    this.baseUrl = config.thawaniBaseUrl;
    this.mode = config.thawaniMode;
  }

  _headers() {
    return {
      'thawani-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a payment checkout session.
   * amount must be in OMR (Float); this method converts to Baisa internally.
   */
  async createSession(sessionData) {
    try {
      const { amount, currency = 'OMR', orderReference, customerInfo, metadata = {} } = sessionData;

      const payload = {
        client_reference_id: orderReference,
        mode: 'payment',
        products: [
          {
            name: metadata.productName || 'Jisr Subscription',
            quantity: 1,
            unit_amount: Math.round(amount * 1000), // OMR → Baisa
          },
        ],
        success_url: `${config.frontendUrl}/payment/success?session_id={session_id}&order_ref=${orderReference}`,
        cancel_url: `${config.frontendUrl}/payment/cancel`,
        metadata: { orderReference, ...metadata },
        ...(customerInfo && {
          customer: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        }),
      };

      const response = await axios.post(
        `${this.baseUrl}/api/v1/checkout/session`,
        payload,
        { headers: this._headers() }
      );

      console.log('Thawani createSession response:', JSON.stringify(response.data, null, 2));

      const responseData = response.data?.data || response.data;
      const sessionId = responseData?.session_id;

      if (!sessionId) {
        console.error('Thawani response missing session_id:', response.data);
        return {
          success: false,
          error: 'Invalid response from Thawani API - missing session_id',
          details: response.data,
        };
      }

      if (!this.publishableKey) {
        console.error('THAWANI_PUBLISHABLE_KEY is not set');
        return {
          success: false,
          error: 'Publishable key is required for checkout URL',
          details: 'Set THAWANI_PUBLISHABLE_KEY in your .env file',
        };
      }

      // Checkout URL: https://uatcheckout.thawani.om/pay/{session_id}?key=publishable_key
      const checkoutBaseUrl = this.baseUrl.replace('/api/v1', '').replace('/api', '');
      const sessionUrl = `${checkoutBaseUrl}/pay/${sessionId}?key=${this.publishableKey}`;
      console.log(`Thawani checkout URL: ${sessionUrl}`);

      return { success: true, sessionId, sessionUrl, data: responseData };
    } catch (error) {
      console.error('Thawani createSession error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }

  /**
   * Retrieve a checkout session by its ID.
   */
  async getSession(sessionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/checkout/session/${sessionId}`,
        { headers: this._headers() }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Thawani getSession error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify whether a session's payment is complete.
   */
  async verifyPayment(sessionId) {
    try {
      const sessionResponse = await this.getSession(sessionId);
      if (!sessionResponse.success) return sessionResponse;

      const session = sessionResponse.data;
      const paymentStatus = session.payment_status;

      return {
        success: paymentStatus === 'paid',
        status: paymentStatus,
        session,
        paymentId: session.payment_id,
        amount: session.total_amount ? session.total_amount / 1000 : null, // Baisa → OMR
      };
    } catch (error) {
      console.error('Thawani verifyPayment error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a checkout session.
   */
  async cancelSession(sessionId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/checkout/session/${sessionId}/cancel`,
        {},
        { headers: this._headers() }
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Thawani cancelSession error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Issue a refund for a completed charge.
   * @param {string} chargeId  - Thawani payment/charge ID (thawaniPaymentId)
   * @param {number} amountOmr - Amount to refund in OMR; pass null for full refund
   */
  async createRefund(chargeId, amountOmr = null) {
    try {
      const payload = {
        charge_id: chargeId,
        reason: 'requested_by_customer',
        ...(amountOmr !== null && { amount: Math.round(amountOmr * 1000) }), // OMR → Baisa
      };

      const response = await axios.post(
        `${this.baseUrl}/api/v1/refunds`,
        payload,
        { headers: this._headers() }
      );

      console.log('Thawani createRefund response:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data?.data || response.data };
    } catch (error) {
      console.error('Thawani createRefund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data,
      };
    }
  }

  /**
   * Verify the HMAC-SHA256 signature from a Thawani webhook.
   *
   * Thawani signs webhooks as:
   *   HMAC-SHA256( rawBody + '-' + timestamp, webhookSecretKey )
   *
   * Headers:
   *   thawani-timestamp  – Unix timestamp string
   *   thawani-signature  – Hex-encoded HMAC digest
   *
   * @param {string} rawBody   - Raw request body string (req.rawBody)
   * @param {string} timestamp - Value of the thawani-timestamp header
   * @param {string} signature - Value of the thawani-signature header
   */
  verifyWebhookSignature(rawBody, timestamp, signature) {
    try {
      if (!rawBody || !timestamp || !signature) return false;

      const secret = config.thawaniWebhookSecret;
      if (!secret) {
        console.error('THAWANI_WEBHOOK_SECRET is not configured');
        return false;
      }

      const textBytes = Buffer.from(rawBody + '-' + timestamp, 'ascii');
      const keyBytes = Buffer.from(secret, 'ascii');

      const hmac = crypto.createHmac('sha256', keyBytes);
      hmac.update(textBytes);
      const expected = hmac.digest('hex');

      // Constant-time comparison to prevent timing attacks
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);

      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch (error) {
      console.error('Webhook signature verification error:', error.message);
      return false;
    }
  }
}

module.exports = new ThawaniService();
