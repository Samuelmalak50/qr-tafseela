let currentQRDataURL = '';

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  document.querySelector('.theme-toggle').textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
}

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  document.querySelector('.theme-toggle').textContent = '☀️';
}

function handleTypeChange() {
  const type = document.getElementById('qrType').value;
  const dynamicFields = document.getElementById('dynamicFields');
  dynamicFields.innerHTML = '';

  if (type === 'url' || type === 'text') {
    dynamicFields.innerHTML = `<label>المحتوى:</label><input type="text" id="urlInput">`;
  } else if (type === 'wifi') {
    dynamicFields.innerHTML = `
      <label>SSID اسم الشبكة:</label><input type="text" id="wifiSSID">
      <label>Password كلمة المرور:</label><input type="text" id="wifiPassword">
      <label>نوع التشفير:</label>
      <select id="wifiType">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">بدون كلمة مرور</option>
      </select>
    `;
  } else if (type === 'vcard') {
    dynamicFields.innerHTML = `
      <label>الاسم:</label><input type="text" id="vcardName">
      <label>الهاتف:</label><input type="text" id="vcardPhone">
      <label>البريد:</label><input type="email" id="vcardEmail">
    `;
  } else if (type === 'email') {
    dynamicFields.innerHTML = `
      <label>إلى:</label><input type="email" id="emailTo">
      <label>الموضوع:</label><input type="text" id="emailSubject">
      <label>النص:</label><input type="text" id="emailBody">
    `;
  } else if (type === 'sms') {
    dynamicFields.innerHTML = `
      <label>الرقم:</label><input type="text" id="smsNumber">
      <label>النص:</label><input type="text" id="smsText">
    `;
  }
}

function generateQR() {
  const type = document.getElementById('qrType').value;
  const qrCodeDiv = document.getElementById('qrcode');
  const qrContainer = document.getElementById('qrContainer');
  const errorMessage = document.getElementById('errorMessage');
  qrCodeDiv.innerHTML = '';
  errorMessage.textContent = '';

  let data = '';
  if (type === 'url' || type === 'text') {
    data = document.getElementById('urlInput').value.trim();
    if (type === 'text') data = `TEXT:${data}`;
  } else if (type === 'wifi') {
    const ssid = document.getElementById('wifiSSID').value.trim();
    const pwd = document.getElementById('wifiPassword').value.trim();
    const enc = document.getElementById('wifiType').value;
    data = `WIFI:T:${enc};S:${ssid};P:${pwd};;`;
  } else if (type === 'vcard') {
    const name = document.getElementById('vcardName').value.trim();
    const phone = document.getElementById('vcardPhone').value.trim();
    const email = document.getElementById('vcardEmail').value.trim();
    data = `BEGIN:VCARD\\nVERSION:3.0\\nFN:${name}\\nTEL:${phone}\\nEMAIL:${email}\\nEND:VCARD`;
  } else if (type === 'email') {
    const to = document.getElementById('emailTo').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();
    data = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  } else if (type === 'sms') {
    const number = document.getElementById('smsNumber').value.trim();
    const text = document.getElementById('smsText').value.trim();
    data = `SMSTO:${number}:${text}`;
  }

  const size = parseInt(document.getElementById('sizeRange').value);
  const fgColor = document.getElementById('foregroundColor').value;
  const bgColor = document.getElementById('backgroundColor').value;

  const qr = qrcode(0, 'M');
  qr.addData(data);
  qr.make();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const moduleCount = qr.getModuleCount();
  const cellSize = Math.floor(size / moduleCount);
  const margin = Math.floor(cellSize * 2);
  canvas.width = size + margin * 2;
  canvas.height = size + margin * 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fgColor;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);
      }
    }
  }

  const logoFile = document.getElementById('logoInput').files[0];
  if (logoFile) {
    const img = new Image();
    img.onload = function () {
      const imgSize = canvas.width * 0.2;
      const x = (canvas.width - imgSize) / 2;
      const y = (canvas.height - imgSize) / 2;
      ctx.drawImage(img, x, y, imgSize, imgSize);
      qrCodeDiv.appendChild(canvas);
      qrContainer.classList.add('show');
      currentQRDataURL = canvas.toDataURL('image/png');
    };
    img.src = URL.createObjectURL(logoFile);
  } else {
    qrCodeDiv.appendChild(canvas);
    qrContainer.classList.add('show');
    currentQRDataURL = canvas.toDataURL('image/png');
  }
}

function downloadQR() {
  if (!currentQRDataURL) return;

  const fileType = document.getElementById('fileType').value;

  if (fileType === 'png') {
    const link = document.createElement('a');
    link.href = currentQRDataURL;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  } else if (fileType === 'pdf') {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.addImage(currentQRDataURL, 'PNG', 20, 20, 160, 160);
    pdf.save(`qrcode-${Date.now()}.pdf`);
  }
}

document.getElementById('sizeRange').addEventListener('input', function () {
  document.getElementById('sizeValue').textContent = `${this.value}x${this.value}`;
});

window.onload = handleTypeChange;
