import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { articles } from "../article-data";
import "../articles.css";

const extraImages = [
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=85",
];

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 4);
  return <div className="articles-shell"><Header /><main className="article-detail-page">
    <div className="article-detail-layout">
      <article className="article-detail">
        <span className="article-badge">High quality professional</span>
        <h1>{article.title}</h1>
        <div className="article-author"><span className="author-avatar">JC</span><span><strong>Jennifer Chen</strong><small>Career Coach and HR Expert</small></span><div className="article-stats"><span>♡ 52 ถูกใจ</span><span>◷ 256 ความคิดเห็น</span><span>◉ 158 เข้าชม</span></div></div>
        <p className="article-detail-intro">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <img className="article-detail-image" src={article.image} alt={article.title} />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <div className="article-image-pair">{extraImages.map((image) => <img src={image} alt="ภาพประกอบบทความ" key={image} />)}</div>
        <h2>สร้างโอกาสให้ตัวเองด้วยการเตรียมตัวที่ดี</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <div className="article-tags"><span>#CareerTips</span><span>#ResumeWriting</span><span>#InterviewPrep</span><span>#JobSearch</span><span>#Networking</span></div>
        <div className="article-share"><span>แชร์</span><button type="button">f</button><button type="button">X</button><button type="button">●</button></div>
      </article>
      <aside className="article-sidebar"><div className="sidebar-ad"><strong>UNLOCK YOUR NEXT CAREER MOVE</strong><b>ACCESS EXCLUSIVE OPPORTUNITIES</b><button type="button">CLAIM NOW</button></div><div className="sidebar-panel"><h2>บทความล่าสุด</h2>{related.slice(0, 3).map((item) => <Link href={`/articles/${item.slug}`} key={item.slug}><img src={item.image} alt="" /><span>{item.title}<small>ทีมงาน CyberJob · {item.date}</small></span></Link>)}</div><div className="sidebar-panel"><h2>หมวดหมู่</h2>{["เรซูเม่", "การสมัครงาน", "การพัฒนาตัวเอง", "สายงานไอที"].map((item, index) => <p key={item}>{item}<span>({110 - index * 15})</span></p>)}</div><div className="sidebar-panel"><h2>แท็กที่เกี่ยวข้อง</h2><div className="sidebar-tags"><span>#CareerTips</span><span>#ResumeWriting</span><span>#InterviewPrep</span><span>#JobSearch</span></div></div></aside>
  </div>
    <div className="article-author-card"><span className="large-author-avatar">JC</span><small>ผู้เขียน</small><strong>Jennifer Chen</strong><span className="author-contact">●</span><button type="button">ดูโปรไฟล์</button></div>
    <section className="comments-section"><h2>ความคิดเห็น (3)</h2>{["เป็นบทความที่มีประโยชน์มากครับ ขอบคุณสำหรับการแบ่งปัน", "ขอบคุณมากค่ะ ทักษะการเขียนเรซูเม่ดีขึ้นมาก", "เนื้อหาดีและอ่านเข้าใจง่ายมาก"].map((comment, index) => <div className="comment" key={comment}><span className="comment-avatar">{index + 1}</span><span><strong>{["Jane Westerness", "May Mavick", "Gracia Viktum"][index]}</strong><small>{20 - index * 5} มิ.ย. 2024</small><p>{comment}</p></span></div>)}<textarea placeholder="เขียนความคิดเห็นของคุณ..."></textarea><button className="comment-button" type="button">ส่งความคิดเห็น</button></section>
    <section className="related-section"><h2>โพสต์ใกล้เคียง</h2><div className="related-grid">{related.map((item) => <Link className="related-card" href={`/articles/${item.slug}`} key={item.slug}><img src={item.image} alt="" /><span className="article-category">{item.category}</span><strong>{item.title}</strong><small>ทีมงาน CyberJob · {item.date}</small></Link>)}</div><Link className="all-articles-button" href="/articles">ดูบทความทั้งหมด</Link></section>
  </main><Footer /></div>;
}
