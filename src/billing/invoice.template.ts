export interface InvoiceData {
    billing_id: string;
    payment_id: string;
    transaction_date: string;
    billing_cycle: string;
    valid_till: string;
    billing_status: string;
    currency: string;
    amount_paise: number;
    base_amount_paise: number;
    gst_amount_paise: number;
    gst_percent: number;
    courseName: string;
    enroll_type: string;
    planName: string;
    userName: string;
    userEmail?: string;
}

export function generateInvoiceHtml(data: InvoiceData): string {
    const fmt = (paise: number) =>
        (paise / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: data.currency || 'INR',
            minimumFractionDigits: 2,
        });

    const statusColor =
        data.billing_status === 'paid'
            ? { bg: '#EAF3DE', color: '#27500A' }
            : { bg: '#FCEBEB', color: '#791F1F' };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice - ${data.billing_id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a1a;
      background: #fff;
      font-size: 14px;
      line-height: 1.6;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      padding: 48px 48px 64px;
    }
    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 32px;
      border-bottom: 2px solid #1A3FAB;
      margin-bottom: 36px;
    }
    .brand-name {
      font-size: 26px;
      font-weight: 800;
      color: #1A3FAB;
      letter-spacing: -0.5px;
    }
    .brand-tag {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
    .invoice-meta { text-align: right; }
    .invoice-title {
      font-size: 22px;
      font-weight: 700;
      color: #111;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-num { font-size: 13px; color: #555; margin-top: 4px; }
    .status-badge {
      display: inline-block;
      padding: 3px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: ${statusColor.bg};
      color: ${statusColor.color};
      margin-top: 8px;
    }
    /* ── Bill To / From ── */
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 36px;
    }
    .party { flex: 1; }
    .party + .party { text-align: right; }
    .party-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 6px;
    }
    .party-name { font-size: 16px; font-weight: 700; color: #111; }
    .party-detail { font-size: 13px; color: #555; margin-top: 2px; }
    /* ── Table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table thead tr {
      background: #1A3FAB;
      color: #fff;
    }
    .items-table thead th {
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody td {
      padding: 12px 14px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
      color: #333;
      vertical-align: top;
    }
    .items-table tbody td:last-child { text-align: right; font-weight: 600; }
    .item-title { font-weight: 600; color: #111; font-size: 14px; }
    .item-sub { font-size: 12px; color: #777; margin-top: 3px; }
    /* ── Totals ── */
    .totals {
      margin-left: auto;
      width: 260px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 0;
      font-size: 13px;
      color: #555;
      border-bottom: 1px solid #f0f0f0;
    }
    .totals-row.grand {
      background: #1A3FAB;
      color: #fff;
      border-radius: 8px;
      padding: 12px 14px;
      margin-top: 8px;
      font-size: 16px;
      font-weight: 700;
      border-bottom: none;
    }
    /* ── Transaction Details ── */
    .txn-box {
      margin-top: 36px;
      background: #f8f9ff;
      border-left: 4px solid #1A3FAB;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
    }
    .txn-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1A3FAB;
      margin-bottom: 12px;
    }
    .txn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
    }
    .txn-item-label { font-size: 11px; color: #888; }
    .txn-item-val { font-size: 13px; font-weight: 600; color: #111; margin-top: 1px; }
    /* ── Footer ── */
    .footer {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 11px;
      color: #aaa;
      line-height: 1.8;
    }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">LawEdge</div>
      <div class="brand-tag">E-Learning Platform</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-num">${data.billing_id}</div>
      <div class="invoice-num">Date: ${data.transaction_date}</div>
      <span class="status-badge">${data.billing_status}</span>
    </div>
  </div>

  <!-- Bill To / From -->
  <div class="parties">
    <div class="party">
      <div class="party-label">Bill To</div>
      <div class="party-name">${data.userName}</div>
      ${data.userEmail ? `<div class="party-detail">${data.userEmail}</div>` : ''}
    </div>
    <div class="party">
      <div class="party-label">Issued By</div>
      <div class="party-name">LawEdge Technologies Pvt. Ltd.</div>
      <div class="party-detail">GSTIN: 29AABCT1332L1ZD</div>
    </div>
  </div>

  <!-- Line items -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:60%">Description</th>
        <th>Billing cycle</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="item-title">${data.courseName}</div>
          <div class="item-sub">${data.enroll_type} · ${data.planName}</div>
          <div class="item-sub">Valid till: ${data.valid_till}</div>
        </td>
        <td>${data.billing_cycle}</td>
        <td>${fmt(data.base_amount_paise)}</td>
      </tr>
      <tr>
        <td><div class="item-sub">GST @ ${data.gst_percent}%</div></td>
        <td></td>
        <td>${fmt(data.gst_amount_paise)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${fmt(data.base_amount_paise)}</span>
    </div>
    <div class="totals-row">
      <span>GST (${data.gst_percent}%)</span>
      <span>${fmt(data.gst_amount_paise)}</span>
    </div>
    <div class="totals-row grand">
      <span>Total Paid</span>
      <span>${fmt(data.amount_paise)}</span>
    </div>
  </div>

  <!-- Transaction details -->
  <div class="txn-box">
    <div class="txn-title">Transaction Details</div>
    <div class="txn-grid">
      <div>
        <div class="txn-item-label">Payment ID</div>
        <div class="txn-item-val">${data.payment_id}</div>
      </div>
      <div>
        <div class="txn-item-label">Transaction Date</div>
        <div class="txn-item-val">${data.transaction_date}</div>
      </div>
      <div>
        <div class="txn-item-label">Billing Cycle</div>
        <div class="txn-item-val">${data.billing_cycle}</div>
      </div>
      <div>
        <div class="txn-item-label">Payment Status</div>
        <div class="txn-item-val" style="text-transform:capitalize">${data.billing_status}</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>This is a computer-generated invoice and does not require a signature.</p>
    <p>LawEdge Technologies Pvt. Ltd. · support@lawedge.in · www.lawedge.in</p>
    <p style="margin-top:4px">For queries, contact support within 30 days of the transaction date.</p>
  </div>
</div>
</body>
</html>`;
}
