# MediConnect - Complete Project Guide 🚀

Namaste! Ye file isliye banayi gayi hai taaki aapko pura **MediConnect** project aasani se samajh aa jaye. Isme humne saari files ko acche se explain kiya hai ki kaunsi file kya kaam karti hai aur kahan rakhi hui hai. 

Project ko 2 main hisso me baanta gaya hai: **Frontend** (Jo user ko dikhta hai) aur **Backend** (Jo background me data handle karta hai).

---

## 🛠 Backend (Node.js + Express + MongoDB)
*Folder: `/backend/`*

Backend aapke platform ka engine hai. Ye database se connect hota hai, authentication (login/signup) handle karta hai aur real-time features (chat/notifications) chalata hai.

### Important Folders & Files:

- **`.env`**: Yahan par humari secret keys hoti hain jaise MongoDB URI, JWT Secret aur ports. (Kabhi bhi isko GitHub par push nahi karte).
- **`package.json`**: Backend me kaun-kaun se packages install hue hain (jaise mongoose, express, socket.io) unki list yahan hoti hai.
- **`src/index.js`**: Ye aapke backend ka **Main Entry Point** hai. Server yahin se start hota hai aur saare routes/middleware yahin connect hote hain.

**Inside `/backend/src/` :**

- 📂 **`config/`**
  - `db.js`: Ye file aapke application ko MongoDB database se connect karti hai.
- 📂 **`models/`** (Data ka Structure / Schema)
  - `User.js`: Isme users (Patient, Doctor, Admin, Assistant) ka structure hai (Name, Email, Password).
  - `Doctor.js`: Doctor ki extra details (Specialization, fee, timing slots).
  - `Appointment.js`: Appointment book hone ki saari details yahan save hoti hain.
  - `Message.js`: Chat messages ko database me save karne ka structure.
- 📂 **`controllers/`** (Asli Logic yahin likha jata hai)
  - Example: `appointmentController.js` me appointment book karne, cancel karne, ya approve karne ka logic (code) likha hua hai. Route par request aati hai aur controller usko process karta hai.
- 📂 **`routes/`** (API Endpoints)
  - `appointments.js`, `auth.js`, `chat.js`: Ye files URLs define karti hain jaise `/api/auth/login`. Jab koi is URL ko hit karta hai to corresponding controller function call ho jata hai.
- 📂 **`middleware/`** (Check karne ke liye)
  - `auth.js`: Ye check karta hai ki user logged in hai ya nahi, aur uski role kya hai (Sirf admin hi admin panel access kar paye).
- 📂 **`socket/`** (Real-Time kaam)
  - `socketHandler.js`: Ye file Socket.IO events handle karti hai, jaise live notifications bhejna aur real-time Doctor-Patient chat chalana.

---

## 💻 Frontend (React + Vite + TypeScript)
*Folder: `/frontend/`*

Frontend wo hissa hai jo users apne browser par dekhte hain. Ise React aur Vite ka use karke banaya gaya hai jisse ye bahut fast hai.

### Important Folders & Files:

- **`package.json`**: Frontend ki libraries (react, axios, react-router-dom) ki list.
- **`index.html`**: Main HTML file jisme poora React app inject hota hai.
- **`src/main.tsx`**: React application ka starting point. Ye `App.tsx` ko DOM me render karta hai.
- **`src/App.tsx`**: Ye file aapke website ki saari **Routing (Navigation)** handle karti hai. Jaise konsa URL konsa page dikhayega.

**Inside `/frontend/src/` :**

- 📂 **`api/`**
  - `axios.js`: Backend se data lane/bhejne ke liye Axios ka configuration yahan hota hai (Base URL aur Tokens attach karne ka logic).
- 📂 **`context/`** (Global State)
  - `AuthContext.tsx`: User logged in hai ya nahi, uski details aur login/logout functions poore app me yahan se milte hain.
  - `SocketContext.tsx`: Live connection (Socket.IO) ko poore app me access dene ke liye.
- 📂 **`components/`** (Chhote, Reusable UI hisse)
  - `common/Navbar.tsx`: Upar ka navigation bar.
  - `chat/ChatModal.tsx`: Jo live chat karne ke liye popup (modal) open hota hai, uska code yahan hai.
  - `common/LoadingSpinner.tsx`: Loading animation jab data fetch ho raha ho.
- 📂 **`pages/`** (Main Screens)
  - `Home.tsx`: Main landing page jahan website start hoti hai.
  - `Login.tsx` / `Register.tsx`: Accounts banane aur login karne ke pages.
  - `Appointments.tsx`: Patient ka dashboard jahan wo apni appointments dekhta hai aur chat start kar sakta hai.
  - `DoctorDashboard.tsx`: Doctor ka apna personal dashboard (appointments approve karna, prescription dena).
  - `AssistantDashboard.tsx`: Staff/Assistant ke liye ek screen jahan wo clinic ki saari appointments approve ya deny kar sakte hain.
- 📂 **`styles/`** (Design aur Colors)
  - `globals.css`: Website ka naya, premium aur sundar design. Isme Glassmorphism (Sheeshe jaisa effect) aur saare animations likhe gaye hain.

---

## 🧹 Faltu Files Ka Kya Hua?

Aapke project root me kuchh useless aur galti se bani files thi jaise:
- `MediConnect/` (Khali folder)
- `{backend/` (Galti se bana folder jisme typos the)
- `frontend/MediConnect/`

In sabhi useless folders ko maine **delete (remove)** kar diya hai taaki project bilkul clean aur professional dikhe. Ab folder structure bilkul point-to-point set hai!
