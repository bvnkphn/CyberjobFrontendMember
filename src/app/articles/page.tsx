"use client";

import { useState } from "react";
import Link from "next/link";
import { articles } from "./article-data";
import "./articles.css";

const categories = ["ทั้งหมด", "เรซูเม่", "การทำงาน", "สมัครงาน", "อาชีพ"];

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const filteredArticles = activeCategory === "ทั้งหมด" ? articles : articles.filter((article) => article.category === activeCategory);

  return <div className="articles-shell"><main className="articles-page">
    <header className="articles-list-heading"><h1>บทความ</h1><p>เคล็ดลับและความรู้เพื่อการทำงานและพัฒนาตัวเอง</p></header>
    <nav className="article-filters" aria-label="หมวดหมู่บทความ">{categories.map((category) => <button className={activeCategory === category ? "active" : ""} type="button" key={category} onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category}>{category}</button>)}</nav>
    <section className="article-grid" aria-label="รายการบทความ">{filteredArticles.map((article) => <article className="article-card" key={article.slug}>
      <Link href={`/articles/${article.slug}`}><img src={article.image} alt="" /><div className="article-card-body"><span className="article-category">{article.category}</span><h2>{article.title}</h2><p>{article.excerpt}</p><span className="read-more">อ่านต่อ <span aria-hidden="true">→</span></span></div></Link>
    </article>)}</section>
    {filteredArticles.length > 0 ? <nav className="article-pagination" aria-label="หน้าบทความ"><button type="button" aria-label="ย้อนกลับ">‹</button><button className="active" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button><span>...</span><button type="button">40</button><button type="button" aria-label="ถัดไป">›</button></nav> : <p className="article-empty">ยังไม่มีบทความในหมวดนี้</p>}
  </main></div>;
}
