# CryptoGuard: Next-Gen Firewall Simulator

![CryptoGuard Cover](public/cryptoguard-cover.png)

CryptoGuard is an educational, fully-interactive Next-Generation Firewall (NGFW) simulator built with Next.js, React, and Framer Motion. It visually demonstrates how modern stateful firewalls handle network packets, enforce access control policies, and manage sessions in real-time.

## 🚀 Features

- **Live Simulation Engine**: Inject customized packets (TCP, UDP, ICMP) and watch the firewall evaluate them in real-time.
- **Stateful Packet Inspection**: Demonstrates how the firewall tracks active connections and allows legitimate return traffic.
- **Interactive Rule Base**: Drag-and-drop to reorder firewall rules, just like an enterprise firewall.
- **Real-time Topology**: A 3D WebGL-based network canvas visualizing packet flows across WAN, LAN, and DMZ zones.
- **Automated Policy Auditing**: Detects security conflicts (e.g., overly permissive rules allowing WAN to LAN access).

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **3D Graphics**: Three.js (via React Three Fiber)

## 📦 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/khushiii81/CryptoGuard.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚠️ Disclaimer

This is a **simulator for educational purposes only**. It does not perform actual network filtering or secure a real network environment. Do not deploy this as a security tool in production networks.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
