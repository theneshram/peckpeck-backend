# 🍔 Peck Peck Backend

**Official Node.js + Express backend for Peck Peck – a modern food ordering platform.**  
Built to handle secure APIs, dynamic menu control, file uploads, location handling, and more — all powered by Azure.

---

## 🚀 Features

- ⚙️ Built with **Express.js**
- 🛠 RESTful API endpoints for menu, banners, offers, feedback, and contact
- ☁️ Integrated with **Azure Blob Storage** for image upload
- 📊 Uses **Azure Cosmos DB (MongoDB API)** for storing data
- 🧠 Smart fallback between primary and secondary DB URIs
- 🔐 Supports admin panel integration for multi-restaurant management
- 🖼 Uploads are now cloud-native (no local folders)

---

## 📁 Project Structure

backend/
├── models/                    # Mongoose schema files
│   ├── Menu.js
│   ├── Feedback.js
│   ├── Contact.js
│   ├── Location.js
│   └── Offer.js
│
├── routes/                    # API route handlers
│   ├── menu.js
│   ├── banner.js
│   ├── contact.js
│   ├── feedback.js
│   ├── admin.js
│   ├── location.js
│   ├── offer.js
│   └── subscribe.js
│
├── uploads/                   # [DEPRECATED] Used earlier for local image storage (no longer needed with Azure Blob)
│
├── utils/                     # (Optional) Utility functions/helpers (e.g., Azure upload logic)
│
├── .env                       # Environment variables (not committed)
├── .gitignore                 # Ignore node_modules, .env, uploads, etc.
├── package.json               # Project dependencies and scripts
├── server.js                  # Main entry point for the backend
└── README.md                  # Project overview and usage guide



---

## 🔧 Environment Variables (`.env`)

```env
PRIMARY_MONGO_URI=your_cosmos_primary_uri
SECONDARY_MONGO_URI=your_cosmos_secondary_uri
AZURE_STORAGE_CONNECTION_STRING=your_blob_connection_string
AZURE_BLOB_CONTAINER=uploads
AZURE_BLOB_CUSTOM_DOMAIN=https://storage.aathithgroup.in
PORT=5000

🏁 Local Development
npm install
npm run dev  # or nodemon server.js


🌐 Azure Deployment
Hosted on: Azure App Service

✅ Add your .env values in:
App Service → Configuration → Application settings

Auto-deploy can be configured using GitHub Actions or manual ZIP deployment.


📦 API Endpoints (Sample)
Route	Method	Description
/api/menu	GET	Fetch all menu items
/api/menu	POST	Add new menu item
/api/banner	POST	Upload banner image
/api/contact	POST	Contact form submission
/api/locations	GET	List all restaurant locations
/api/feedback	POST	Submit customer feedback

👨‍💻 Author
Made with ❤️ by the Peck Peck Team
https://peckpeck.in

