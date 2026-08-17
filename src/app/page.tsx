export default function Home() { return <main><h1>CyberJob Member</h1><p>Frontend พร้อมเชื่อมต่อ REST API ที่ {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003/api/v1"}</p></main>; }
