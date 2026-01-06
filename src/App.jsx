import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ExternalLink, Loader2, Bookmark, Share2, Palette, Sparkles, Crown, X } from 'lucide-react';

const COLOR_THEMES = [
  { name: "Warm Cream", bg: ["#F5F1E8", "#F7F3EA", "#F3EFE6", "#F8F4EB", "#F6F2E9"], text: ["#3E3E3E", "#424242", "#404040", "#3C3C3C", "#3A3A3A"], accent: "#8B5C4A", gradient: ["#EDE7DC", "#E3DCD0"], isDefault: true },
  { name: "MIT Whisper", bg: ["#F1F8F6", "#F3FAF8", "#F0F7F5", "#F4FBF9", "#F2F9F7"], text: ["#2D3F38", "#2F4139", "#2E4038", "#2C3E37", "#2B3D36"], accent: "#4A8B7F", gradient: ["#E5F1ED", "#D9E8E3"], isPopular: true },
  { name: "Soft Sage", bg: ["#F0F4F0", "#EEF2EE", "#EDF1ED", "#F1F5F1", "#EFF3EF"], text: ["#2C3E2C", "#2E402E", "#2D3F2D", "#2B3D2B", "#2A3C2A"], accent: "#5A7A5A", gradient: ["#E4EBE4", "#D8E3D8"] },
  { name: "Gentle Lavender", bg: ["#F5F3F8", "#F7F5FA", "#F4F2F7", "#F8F6FB", "#F6F4F9"], text: ["#3E3542", "#403744", "#3F3643", "#3D3441", "#3C3340"], accent: "#7B5E7B", gradient: ["#EBE7F0", "#DFD9E8"] },
  { name: "Peachy Blush", bg: ["#FFF5F0", "#FFF7F2", "#FFF4EF", "#FFF8F3", "#FFF6F1"], text: ["#4A3835", "#4C3A37", "#4B3936", "#493734", "#483633"], accent: "#C97A63", gradient: ["#FFEBE3", "#FFE0D4"] },
  { name: "Misty Blue", bg: ["#F0F5F8", "#F2F7FA", "#EFF4F7", "#F3F8FB", "#F1F6F9"], text: ["#2C3942", "#2E3B44", "#2D3A43", "#2B3841", "#2A3740"], accent: "#5B7C8E", gradient: ["#E4EDF2", "#D8E5EC"] },
  { name: "Ivory Linen", bg: ["#FAF8F3", "#FCFAF5", "#F9F7F2", "#FDFBF6", "#FBF9F4"], text: ["#3F3D35", "#413F37", "#403E36", "#3E3C34", "#3D3B33"], accent: "#8E7A5F", gradient: ["#F1EDE5", "#E8E2D7"] },
  { name: "Rose Quartz", bg: ["#F8F2F4", "#FAF4F6", "#F7F1F3", "#FBF5F7", "#F9F3F5"], text: ["#42363A", "#44383C", "#43373B", "#413539", "#403438"], accent: "#9E6B7B", gradient: ["#EFE6EA", "#E6DAE0"] },
  { name: "Warm Sand", bg: ["#F8F5F0", "#FAF7F2", "#F7F4EF", "#FBF8F3", "#F9F6F1"], text: ["#3E3933", "#403B35", "#3F3A34", "#3D3832", "#3C3731"], accent: "#A68A6E", gradient: ["#EFEAE3", "#E5DED4"] },
  { name: "Cool Concrete", bg: ["#F3F4F5", "#F5F6F7", "#F2F3F4", "#F6F7F8", "#F4F5F6"], text: ["#353739", "#373941", "#363840", "#34363E", "#33353D"], accent: "#6B7280", gradient: ["#E7E9EA", "#DDE0E2"] },
  { name: "Dusty Rose", bg: ["#F9F4F6", "#FBF6F8", "#F8F3F5", "#FCF7F9", "#FAF5F7"], text: ["#453A3E", "#473C40", "#463B3F", "#44393D", "#43383C"], accent: "#B88A9A", gradient: ["#F0E9ED", "#E7DFE5"] },
  { name: "Seafoam Dream", bg: ["#F0F9F7", "#F2FBF9", "#EFF8F6", "#F3FCF9", "#F1FAF8"], text: ["#2E3F3A", "#30413C", "#2F403B", "#2D3E39", "#2C3D38"], accent: "#6BA39C", gradient: ["#E4F1EE", "#D8E8E4"] },
  { name: "Amber Glow", bg: ["#FBF7F0", "#FDFAF2", "#FCF8F1", "#FEF9F3", "#FDF8F1"], text: ["#4B4033", "#4D4235", "#4C4134", "#4A3F32", "#493E31"], accent: "#C9A557", gradient: ["#F4EDDF", "#EBDFD0"] },
  { name: "Slate Mist", bg: ["#F2F3F5", "#F4F5F7", "#F1F2F4", "#F5F6F8", "#F3F4F6"], text: ["#343638", "#363840", "#35373F", "#33353D", "#32343C"], accent: "#6B7A8A", gradient: ["#E6E8EB", "#DCDFE4"] },
  { name: "Blush Pearl", bg: ["#FCF6F7", "#FEF8F9", "#FBF5F6", "#FFF9FA", "#FDF7F8"], text: ["#4E3A3D", "#503C3F", "#4F3B3E", "#4D393C", "#4C383B"], accent: "#D4909F", gradient: ["#F5ECEF", "#ECE2E7"] },
];

const generateSummary = (text, minWords = 300, maxWords = 400) => {
  if (!text) return "";
  const cleanText = text.replace(/<[^>]*>/g, "");
  const words = cleanText.split(/\s+/);
  if (words.length <= minWords) return cleanText.trim();
  const limitedWords = words.slice(0, maxWords);
  return limitedWords.join(" ").trim() + "...";
};

const NICHE_QUERIES = [
  "forgotten medieval weapons", "ww2 experimental aircraft", "abandoned cold war projects",
  "strange historical punishments", "bizarre scientific experiments", "lost ancient technologies",
  "failed military inventions", "mysterious archaeological finds", "obscure psychological syndromes",
  "unusual medical conditions", "rare natural phenomena", "extinct languages", "forgotten inventions",
  "mysterious disappearances", "ancient mysteries", "strange cultural practices", "obsolete professions",
];

let queryIndex = 0;

const fetchWikipediaArticles = async (usedTitles) => {
  const results = [];
  let attempts = 0;
  const MAX_ATTEMPTS = 6;

  while (results.length < 10 && attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      const query = NICHE_QUERIES[queryIndex % NICHE_QUERIES.length];
      queryIndex++;

      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=50&format=json&origin=*`
      );

      const searchData = await searchRes.json();
      const pages = (searchData.query?.search || []).sort(() => Math.random() - 0.5);

      for (const p of pages) {
        if (usedTitles.has(p.title)) continue;
        usedTitles.add(p.title);

        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`
        );

        if (!summaryRes.ok) continue;

        const page = await summaryRes.json();
        if (!page.extract || page.extract.length < 120) continue;

        results.push({
          id: page.pageid ?? page.title,
          title: page.title,
          summary: generateSummary(page.extract, 300, 400),
          url: page.content_urls?.desktop?.page,
          imageUrl: page.thumbnail?.source || page.originalimage?.source || null
        });

        if (results.length >= 10) break;
      }
    } catch (e) {
      console.error("Wiki fetch error:", e);
    }
  }
  return results;
};

const AnimatedButton = ({ onClick, icon: Icon, isFilled = false, label, className = "", style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      className={`relative p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl shadow-lg transition-all overflow-hidden pointer-events-auto ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0"
        animate={isHovered ? { opacity: 0.3 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: 'white', borderRadius: 'inherit' }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <motion.div
          animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill={isFilled ? "currentColor" : "none"} />
        </motion.div>
        {label && <span className="font-bold text-sm sm:text-base">{label}</span>}
      </div>
    </motion.button>
  );
};

const StackedCard = ({ article, index, onSave, isSaved, colorTheme, scrollProgress }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const contentScrollRef = useRef(null);

  const colorIndex = Math.abs(article.title.length) % 5;
  const bgColor = colorTheme.bg[colorIndex];
  const textColor = colorTheme.text[colorIndex];
  const accentColor = colorTheme.accent;

  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setVh(window.innerHeight);
      const handleResize = () => setVh(window.innerHeight);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const start = index * vh;
  const end = (index + 1) * vh;

  const y = useTransform(scrollProgress, [start - vh, start, end, end + vh], [vh, 0, 0, -vh]);
  const scale = useTransform(scrollProgress, [start - vh, start, end, end + vh], [0.93, 1, 1, 0.93]);
  const opacity = useTransform(scrollProgress, [start - vh, start, end, end + vh], [0, 1, 1, 0]);

  // Handle scroll overflow - let scroll pass through when content is fully scrolled
  useEffect(() => {
    const contentEl = contentScrollRef.current;
    if (!contentEl) return;

    let lastTouchY = 0;
    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const isAtBottom = contentEl.scrollHeight - contentEl.scrollTop - contentEl.clientHeight < 5;
      const isAtTop = contentEl.scrollTop < 5;
      const direction = touchY > lastTouchY ? 'down' : 'up';
      
      lastTouchY = touchY;
    };

    contentEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      contentEl.removeEventListener('touchstart', handleTouchStart);
      contentEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleShare = async (method) => {
    const shareData = { title: article.title, text: `Check out: ${article.title}`, url: article.url };
    if (method === 'native' && navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share cancelled'); }
    } else if (method === 'copy') {
      try { await navigator.clipboard.writeText(article.url); alert('Link copied!'); } catch (err) { console.error('Failed'); }
    }
    setShowShareMenu(false);
  };

  return (
    <motion.div
      style={{ y, scale, opacity, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, fontFamily: "'Inter', sans-serif", pointerEvents: "none", willChange: "transform, opacity" }}
      className="flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8"
    >
      <div className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl h-[80vh] sm:h-[85vh] md:h-[90vh] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -10 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full rounded-2xl sm:rounded-3xl sm:rounded-[2.5rem] flex flex-col relative overflow-hidden pointer-events-none"
          style={{ backgroundColor: bgColor, boxShadow: `0 25px 50px -12px rgba(0,0,0,0.2), 0 0 0 1px ${accentColor}15`, WebkitUserSelect: 'none' }}
        >
          <div className="absolute 
          inset-0 
          pointer-events-none 
          overflow-hidden">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-1/4 -right-1/4 w-full h-full rounded-full blur-3xl" style={{ backgroundColor: accentColor }} />
            <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90], opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-1/4 -left-1/4 w-full h-full rounded-full blur-3xl" style={{ backgroundColor: accentColor }} />
          </div>

          <div className="relative z-20 flex-shrink-0 p-3 sm:p-4 md:p-6 lg:p-8 pb-1.5 sm:pb-2 md:pb-3">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-3" style={{ backgroundColor: `${accentColor}12`, color: accentColor }}>
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></motion.div>
                  Wikipedia Discovery
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight tracking-tight" style={{ color: textColor }}>{article.title}</motion.h2>
              </div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                <AnimatedButton onClick={() => onSave(article.id)} icon={Bookmark} isFilled={isSaved} style={{ backgroundColor: isSaved ? accentColor : `${accentColor}12`, color: isSaved ? '#FFFFFF' : accentColor }} />
                <div className="relative">
                  <AnimatedButton onClick={() => setShowShareMenu(!showShareMenu)} icon={Share2} style={{ backgroundColor: `${accentColor}12`, color: accentColor }} />
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div initial={{ opacity: 0, scale: 0.85, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 5 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="absolute right-0 mt-2 w-44 sm:w-48 rounded-2xl shadow-2xl overflow-hidden z-50 border" style={{ backgroundColor: bgColor, borderColor: `${accentColor}15` }}>
                        <button onClick={() => handleShare('native')} className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-black/5 flex items-center gap-2.5 transition-colors" style={{ color: textColor }}><Share2 className="w-4 h-4" /> Share</button>
                        <button onClick={() => handleShare('copy')} className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-black/5 flex items-center gap-2.5 transition-colors" style={{ color: textColor }}><ExternalLink className="w-4 h-4" /> Copy Link</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>

          <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 custom-scrollbar relative z-10 pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pb-6">
              {article.imageUrl && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="w-1/3 sm:w-2/5 md:w-2/5 lg:w-1/3 float-right ml-2 sm:ml-4 md:ml-5 mb-2 sm:mb-3 md:mb-4">
                  <div className="relative aspect-[4/3] rounded-lg sm:rounded-2xl overflow-hidden shadow-lg border select-none" style={{ borderColor: `${accentColor}10` }}>
                    {!imageLoaded && <div className="absolute inset-0 bg-black/5 animate-pulse flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>}
                    <img src={article.imageUrl} alt={article.title} onLoad={() => setImageLoaded(true)} className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} draggable="false" />
                  </div>
                </motion.div>
              )}
              <div className="select-text">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-normal opacity-90" style={{ color: textColor }}>{article.summary}</motion.p>
              </div>
              <div className="clear-both"></div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="relative z-20 flex-shrink-0 p-3 sm:p-4 md:p-6 lg:p-8 pt-1.5 sm:pt-2 md:pt-3 border-t pointer-events-auto" style={{ borderColor: `${accentColor}10` }}>
            <motion.a href={article.url} target="_blank" rel="noopener noreferrer" whileHover={{ x: 8, scale: 1.02 }} className="inline-flex items-center gap-2 text-xs sm:text-sm md:text-base font-bold group" style={{ color: accentColor }}>
              Read full article on Wikipedia
              <motion.div whileHover={{ x: 3, y: -3 }} transition={{ type: "spring", stiffness: 400 }}><ExternalLink className="w-4.5 h-4.5 sm:w-5 sm:h-5" /></motion.div>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ReelFeed = () => {
  const [articles, setArticles] = useState([]);
  const [usedTitles] = useState(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [showThemes, setShowThemes] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedArticles, setSavedArticles] = useState(new Set());
  const containerRef = useRef(null);

  const theme = COLOR_THEMES[currentTheme];
  const { scrollY } = useScroll({ container: containerRef });

  const loadArticles = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const newArticles = await fetchWikipediaArticles(usedTitles);
    setArticles(prev => [...prev, ...newArticles]);
    setLoadingMore(false);
  };

  useEffect(() => { loadArticles(); }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 1000 && !loadingMore) loadArticles();
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadingMore, articles.length]);

  const handleSave = (id) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToArticle = (id) => {
    const index = articles.findIndex(a => a.id === id);
    if (index !== -1 && containerRef.current) {
      const vh = window.innerHeight;
      containerRef.current.scrollTo({
        top: index * vh,
        behavior: 'smooth'
      });
      setShowSaved(false);
    }
  };

  const savedArticlesList = useMemo(() => articles.filter(a => savedArticles.has(a.id)), [articles, savedArticles]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: theme.gradient[0], fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');.custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.2)}.custom-scrollbar{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.12) transparent}.select-text{user-select:text;-webkit-user-select:text}.select-none{user-select:none;-webkit-user-select:none}*{-webkit-tap-highlight-color:transparent}.snap-container{scroll-snap-type:y mandatory;scroll-behavior:smooth}.snap-item{scroll-snap-align:start;scroll-snap-stop:always}` }} />

      <AnimatePresence>
        {showThemes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setShowThemes(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: theme.bg[0] }}>
              <div className="flex-shrink-0 p-6 sm:p-8 border-b" style={{ borderColor: `${theme.accent}10` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: theme.text[0] }}>Color Themes</motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm opacity-60" style={{ color: theme.text[0] }}>Default: Warm Cream</motion.p>
                  </div>
                  <motion.button onClick={() => setShowThemes(false)} whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-full hover:bg-black/5 transition-colors" style={{ color: theme.accent }}><X className="w-6 h-6" /></motion.button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {COLOR_THEMES.map((t, idx) => (
                    <motion.button key={t.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => { setCurrentTheme(idx); setTimeout(() => setShowThemes(false), 200); }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} className="p-5 rounded-2xl text-left transition-all relative overflow-hidden group" style={{ backgroundColor: t.bg[0], border: currentTheme === idx ? `2px solid ${t.accent}` : '2px solid transparent', boxShadow: currentTheme === idx ? `0 8px 24px ${t.accent}25` : '0 2px 8px rgba(0,0,0,0.05)' }}>
                      {t.isPopular && <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15 }} className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md"><Crown className="w-3 h-3" />Popular</motion.div>}
                      {t.isDefault && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2.5 right-2.5 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md" style={{ backgroundColor: t.accent }}>Default</motion.div>}
                      <div className="flex gap-2 mb-3">{t.bg.slice(0, 4).map((c, i) => <motion.div key={i} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: idx * 0.05 + i * 0.05, type: "spring" }} className="w-6 h-6 rounded-lg shadow-sm" style={{ backgroundColor: c }} />)}</div>
                      <p className="font-bold text-base mb-0.5" style={{ color: t.text[0] }}>{t.name}</p>
                      {currentTheme === idx && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs opacity-60 mt-1" style={{ color: t.text[0] }}>✓ Active</motion.p>}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" onClick={() => setShowSaved(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ backgroundColor: theme.bg[0] }}>
              <div className="flex-shrink-0 p-6 sm:p-8 border-b" style={{ borderColor: `${theme.accent}10` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: theme.text[0] }}>Saved Articles</motion.h2>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm opacity-60" style={{ color: theme.text[0] }}>{savedArticlesList.length} {savedArticlesList.length === 1 ? 'article' : 'articles'} saved</motion.p>
                  </div>
                  <motion.button onClick={() => setShowSaved(false)} whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-full hover:bg-black/5 transition-colors" style={{ color: theme.accent }}><X className="w-6 h-6" /></motion.button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                {savedArticlesList.length === 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} className="inline-flex p-6 rounded-full mb-4" style={{ backgroundColor: `${theme.accent}12` }}><Bookmark className="w-12 h-12 opacity-30" style={{ color: theme.accent }} /></motion.div>
                    <p className="text-lg font-semibold mb-2" style={{ color: theme.text[0] }}>No saved articles yet</p>
                    <p className="text-sm opacity-60" style={{ color: theme.text[0] }}>Bookmark articles to read them later</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {savedArticlesList.map((article, idx) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 rounded-2xl hover:shadow-lg transition-all group cursor-pointer"
                        style={{ backgroundColor: theme.bg[1], border: `1px solid ${theme.accent}10` }}
                        onClick={() => scrollToArticle(article.id)}
                      >
                        <div className="flex items-start gap-4">
                          {article.imageUrl && (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.accent}10` }}>
                              <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-1" style={{ color: theme.text[0] }}>{article.title}</h3>
                            <p className="text-xs sm:text-sm opacity-60 line-clamp-2 mb-3" style={{ color: theme.text[0] }}>{article.summary}</p>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: theme.accent }}>
                                View in Feed
                              </span>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave(article.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                                style={{ color: theme.accent }}
                              >
                                <Bookmark className="w-4 h-4" fill="currentColor" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Hidden on mobile, shown on sm+ */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-xl pointer-events-auto" style={{ backgroundColor: theme.bg[0], border: `1px solid ${theme.accent}15` }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: theme.accent }} /></motion.div>
            <span className="font-bold text-base sm:text-lg tracking-tight" style={{ color: theme.text[0] }}>WikiScroll</span>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
            <AnimatedButton onClick={() => setShowSaved(true)} icon={Bookmark} isFilled={savedArticlesList.length > 0} label={savedArticlesList.length > 0 ? `${savedArticlesList.length}` : undefined} style={{ backgroundColor: savedArticlesList.length > 0 ? theme.accent : `${theme.accent}12`, color: savedArticlesList.length > 0 ? '#FFFFFF' : theme.accent }} />
            <AnimatedButton onClick={() => setShowThemes(true)} icon={Palette} style={{ backgroundColor: `${theme.accent}12`, color: theme.accent }} />
          </div>
        </div>
      </motion.div>

      {/* Mobile-only floating buttons */}
      <div className="sm:hidden fixed bottom-6 left-6 right-6 z-[60] flex justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatedButton
            onClick={() => setShowThemes(true)}
            icon={Palette}
            style={{ backgroundColor: theme.bg[0], color: theme.accent, border: `1px solid ${theme.accent}20` }}
          />
        </div>
        <div className="pointer-events-auto">
          <AnimatedButton
            onClick={() => setShowSaved(true)}
            icon={Bookmark}
            isFilled={savedArticlesList.length > 0}
            label={savedArticlesList.length > 0 ? `${savedArticlesList.length}` : undefined}
            style={{ backgroundColor: theme.bg[0], color: theme.accent, border: `1px solid ${theme.accent}20` }}
          />
        </div>
      </div>

      <div ref={containerRef} className="h-full overflow-y-scroll snap-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `div[ref="containerRef"]::-webkit-scrollbar{display:none}` }} />
        {articles.map((article, index) => (
          <div key={article.id} className="h-screen snap-item">
            <StackedCard article={article} index={index} onSave={handleSave} isSaved={savedArticles.has(article.id)} colorTheme={theme} scrollProgress={scrollY} />
          </div>
        ))}
        {loadingMore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 className="w-12 h-12" style={{ color: theme.accent }} /></motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReelFeed;
