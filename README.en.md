# AI Digital Portrait Studio

AI Digital Portrait Studio is a React + Vite web application that blends Google Gemini models with Firebase services to help brands generate multi-angle portrait product shots in seconds. The project is open source—feel free to adapt or self-host.

## Key Features

- **Multi-angle image generation** – Produce full-body, half-body, and close-up portraits in a single request while respecting the selected aspect ratio.
- **Optional reference inputs** – Upload a reference face or object to improve consistency between generations.
- **Persistent history** – Each authenticated user can keep the latest five generations and restore them instantly.
- **Motion clip extension** – Promote any still image to Gemini Veo for a 720p motion clip (supports 16:9 and 9:16).
- **Account experience** – Firebase Authentication backs registration, sign-in, password recovery, and displays remaining credits.
- **Credit management** – New accounts start with three free generations; sharing on Facebook can reward an additional credit (configurable).

## Tech Stack

- React 19, TypeScript, Vite 6
- Firebase Authentication, Firestore, Storage
- Google Gemini `gemini-2.5-flash-image` & Veo `veo-3.1-fast-generate-preview`
- Tailwind-style utility classes written directly via `className`

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkhsu2002/AI_Digital_Portrait_Studio.git
   cd AI_Digital_Portrait_Studio
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables** – create a `.env.local` file in the project root:
   ```dotenv
   VITE_API_KEY=YOUR_GEMINI_OR_VEO_API_KEY
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_APP_ID
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app is available at `http://localhost:5173`.
5. **Build and preview production output**
   ```bash
   npm run build
   npm run preview
   ```

## Recommended Deployment

- **Vercel** – First-class support for Vite deployments with simple environment variable management.
- **Google Cloud (Cloud Run / Firebase Hosting)** – Ideal if you want tighter integration with existing Firebase resources. Build locally with `npm run build`, then deploy the generated `dist` output (or SSR target).

For managed deployment or custom feature requests (e.g., additional scenes or poses), contact FlyPig AI: `flypig@icareu.tw` / LINE ID `icareuec`.

## License

This project is released under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. You may use, modify, and self-host the code, but you may not offer the resulting service as a paid commercial product. Full license text: <https://creativecommons.org/licenses/by-nc/4.0/>.
