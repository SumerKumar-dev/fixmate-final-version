FixMate - Find Local Helpers (Pure HTML5, CSS3 & Vanilla JavaScript)
========================================================================

Included Files:
- index.html               (Homepage)
- services.html            (Explore Local Services & Filters)
- provider.html            (Service Provider Profile, Reviews & Provider Desk Demo)
- booking.html             (Service Booking System)
- login.html               (Login Page)
- register.html            (Registration Page)
- customer-dashboard.html  (Customer Dashboard & Booking Management)
- css/style.css            (Complete Stylesheet)
- js/*.js                  (Vanilla JS Modules)
- assets/images/*          (Website & Provider Images)

How to Run Locally:
Because the JavaScript files use standard browser ES Modules (<script type="module">),
opening HTML files directly via file:// may be blocked by browser CORS rules.
Serve the extracted folder over any local static HTTP server, for example:

  1) Python:   python3 -m http.server 8000
     Then open http://localhost:8000/index.html

  2) Node.js:  npx serve .

  3) VS Code:  Right-click index.html -> "Open with Live Server"
