export const VERIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Account - Yanhal</title>
<style>
body { margin:0; background:#0a0a0a; font-family:Arial,sans-serif; }
.container { padding:40px 10px; }
.card { max-width:600px; margin:auto; background:#111; border-radius:24px; overflow:hidden; border: 1px solid rgba(255,215,0,0.1); }
.header { background:linear-gradient(135deg,#FFD700,#000); padding:40px; text-align:center; }
.logo-container { 
    width: 80px; 
    height: 80px; 
    margin: 0 auto; 
    background: #000; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    border: 2px solid rgba(255,215,0,0.3);
}
.logo-container img { width:50px; border-radius:50%; }
.brand { color:#fff; font-weight:bold; margin-top:15px; letter-spacing: 2px; }
.content { padding:40px 30px; text-align:center; }
.illustration { margin-bottom: 30px; }
.heading { color:#FFD700; font-size:28px; font-weight:bold; margin-bottom: 20px; }
.text { color:#ccc; margin:20px 0; line-height: 1.6; }
.button-container { margin-top: 30px; }
.button { 
    background: linear-gradient(135deg,#FFD700,#000); 
    padding:16px 40px; 
    border-radius:40px; 
    color:#fff !important; 
    text-decoration:none; 
    font-weight:bold; 
    display: inline-block;
    box-shadow: 0 5px 15px rgba(255,215,0,0.2);
}
.footer { text-align:center; color:#555; padding:20px; font-size:12px; border-top: 1px solid #222; }
</style>
</head>
<body>

<div class="container">
<div class="card">

<div class="header">
  <div class="logo-container">
    <img src="https://drive.google.com/uc?id=1FPJeLDpbqU634Yi8bbe2n7BsJrxNXMd4">
  </div>
  <div class="brand">YANHAL HOLDINGS</div>
</div>

<div class="content">

  <div class="illustration">
    <!-- Using a high-quality relevant business/coffee illustration as requested -->
    <img src="https://img.freepik.com/free-vector/shared-workspace-concept-illustration_114360-3112.jpg" width="220" style="border-radius: 12px;">
  </div>

  <div class="heading">Verify Your Account</div>

  <div class="text">
    Confirm your email to activate your account and access Yanhal proprietary services.
  </div>

  <div class="button-container">
    <a href="{{confirmation_url}}" class="button">Verify Email</a>
  </div>

</div>

<div class="footer">
© 2026 Yanhal Holdings Ltd — Nairobi, Kenya
</div>

</div>
</div>

</body>
</html>
`;

export const CONTACT_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin:0; background:#0a0a0a; font-family:Arial,sans-serif; }
.container { padding:40px 10px; }
.card { max-width:600px; margin:auto; background:#111; border-radius:24px; overflow:hidden; border: 1px solid rgba(255,215,0,0.1); }
.header { background:linear-gradient(135deg,#FFD700,#000); padding:30px; text-align:center; color:#fff; }
.content { padding:30px; }
.label { color:#FFD700; font-weight:bold; margin-top:20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.value { color:#eee; margin-top:5px; background: #000; padding: 12px; border-radius: 8px; border: 1px solid #222; }
.footer { text-align:center; color:#555; padding:20px; font-size:12px; border-top: 1px solid #222; }
</style>
</head>

<body>
<div class="container">
<div class="card">

<div class="header">
  <h2 style="margin:0; letter-spacing: 2px;">New Contact Submission</h2>
</div>

<div class="content">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #FFD700; overflow: hidden; margin: 0 auto; background: #000;">
      <img src="{{profile_url}}" style="width: 100%; height: 100%; object-fit: cover;" alt="User Identity">
    </div>
    <div style="color: #FFD700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">Verified Identity</div>
  </div>

  <div class="label">Name</div>
  <div class="value">{{name}}</div>

  <div class="label">Email</div>
  <div class="value">{{email}}</div>

  <div class="label">Project Type</div>
  <div class="value">{{projectType}}</div>

  <div class="label">Message</div>
  <div class="value" style="white-space: pre-wrap;">{{message}}</div>

</div>

<div class="footer">
Submitted via Yanhal Holdings Official Website
</div>

</div>
</div>
</body>
</html>
`;

export const ESTIMATE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin:0; background:#0a0a0a; font-family:Arial,sans-serif; }
.container { padding:40px 10px; }
.card { max-width:600px; margin:auto; background:#111; border-radius:24px; overflow:hidden; border: 1px solid rgba(255,215,0,0.1); }
.header { background:linear-gradient(135deg,#FFD700,#000); padding:30px; text-align:center; color:#fff; }
.content { padding:30px; }
.section { margin-bottom:20px; }
.label { color:#FFD700; font-weight:bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.value { color:#eee; margin-top:5px; background: #000; padding: 12px; border-radius: 8px; border: 1px solid #222; }
.link { color:#FFD700; text-decoration:none; font-weight: bold; border-bottom: 1px solid #FFD700; }
.footer { text-align:center; color:#555; padding:20px; font-size:12px; border-top: 1px solid #222; }
</style>
</head>

<body>
<div class="container">
<div class="card">

<div class="header">
  <h2 style="margin:0; letter-spacing: 2px;">New Project Estimate Request</h2>
</div>

<div class="content">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #FFD700; overflow: hidden; margin: 0 auto; background: #000;">
      <img src="{{profile_url}}" style="width: 100%; height: 100%; object-fit: cover;" alt="User Identity">
    </div>
    <div style="color: #FFD700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px;">Verified Identity</div>
  </div>

  <div class="section">
    <div class="label">Client Name</div>
    <div class="value">{{name}}</div>
  </div>

  <div class="section">
    <div class="label">Phone</div>
    <div class="value">{{phone}}</div>
  </div>

  <div class="section">
    <div class="label">Location</div>
    <div class="value">{{location}}</div>
  </div>

  <div class="section">
    <div class="label">Service Type</div>
    <div class="value">{{service}}</div>
  </div>

  <div class="section">
    <div class="label">Project Scope</div>
    <div class="value">{{scope}}</div>
  </div>

  <div class="section">
    <div class="label">Scale (SQM)</div>
    <div class="value">{{size}}</div>
  </div>

  <div class="section">
    <div class="label">Budget Range</div>
    <div class="value">{{budget}}</div>
  </div>

  <div class="section">
    <div class="label">Client Message</div>
    <div class="value" style="white-space: pre-wrap;">{{message}}</div>
  </div>

  <div class="section">
    <div class="label">Uploaded Context Image</div>
    <div class="value">
      {{image_link}}
    </div>
  </div>

</div>

<div class="footer">
Yanhal Holdings — Project Intake System
</div>

</div>
</div>
</body>
</html>
`;
