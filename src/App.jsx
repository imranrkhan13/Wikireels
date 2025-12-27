import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, Bookmark, Share2, Palette } from 'lucide-react';

const COLOR_THEMES = [
  { name: "Warm Cream", bg: ["#F5F1E8", "#F7F3EA", "#F3EFE6", "#F8F4EB", "#F6F2E9"], text: ["#3E3E3E", "#424242", "#404040", "#3C3C3C", "#3A3A3A"], accent: "#8B5C4A", gradient: ["#EDE7DC", "#E3DCD0"] },
  { name: "Soft Sage", bg: ["#F0F4F0", "#EEF2EE", "#EDF1ED", "#F1F5F1", "#EFF3EF"], text: ["#2C3E2C", "#2E402E", "#2D3F2D", "#2B3D2B", "#2A3C2A"], accent: "#5A7A5A", gradient: ["#E4EBE4", "#D8E3D8"] },
  { name: "Gentle Lavender", bg: ["#F5F3F8", "#F7F5FA", "#F4F2F7", "#F8F6FB", "#F6F4F9"], text: ["#3E3542", "#403744", "#3F3643", "#3D3441", "#3C3340"], accent: "#7B5E7B", gradient: ["#EBE7F0", "#DFD9E8"] },
  { name: "Peachy Blush", bg: ["#FFF5F0", "#FFF7F2", "#FFF4EF", "#FFF8F3", "#FFF6F1"], text: ["#4A3835", "#4C3A37", "#4B3936", "#493734", "#483633"], accent: "#C97A63", gradient: ["#FFEBE3", "#FFE0D4"] },
  { name: "Misty Blue", bg: ["#F0F5F8", "#F2F7FA", "#EFF4F7", "#F3F8FB", "#F1F6F9"], text: ["#2C3942", "#2E3B44", "#2D3A43", "#2B3841", "#2A3740"], accent: "#5B7C8E", gradient: ["#E4EDF2", "#D8E5EC"] },
  { name: "Ivory Linen", bg: ["#FAF8F3", "#FCFAF5", "#F9F7F2", "#FDFBF6", "#FBF9F4"], text: ["#3F3D35", "#413F37", "#403E36", "#3E3C34", "#3D3B33"], accent: "#8E7A5F", gradient: ["#F1EDE5", "#E8E2D7"] },
  { name: "Rose Quartz", bg: ["#F8F2F4", "#FAF4F6", "#F7F1F3", "#FBF5F7", "#F9F3F5"], text: ["#42363A", "#44383C", "#43373B", "#413539", "#403438"], accent: "#9E6B7B", gradient: ["#EFE6EA", "#E6DAE0"] },
  { name: "Mint Whisper", bg: ["#F2F8F5", "#F4FAF7", "#F1F7F4", "#F5FBF8", "#F3F9F6"], text: ["#2E3F38", "#30413A", "#2F4039", "#2D3E37", "#2C3D36"], accent: "#5F8C7A", gradient: ["#E6F0EB", "#DAE8E0"] },
  { name: "Warm Sand", bg: ["#F8F5F0", "#FAF7F2", "#F7F4EF", "#FBF8F3", "#F9F6F1"], text: ["#3E3933", "#403B35", "#3F3A34", "#3D3832", "#3C3731"], accent: "#A68A6E", gradient: ["#EFEAE3", "#E5DED4"] },
  { name: "Cool Concrete", bg: ["#F3F4F5", "#F5F6F7", "#F2F3F4", "#F6F7F8", "#F4F5F6"], text: ["#353739", "#373941", "#363840", "#34363E", "#33353D"], accent: "#6B7280", gradient: ["#E7E9EA", "#DDE0E2"] },
  { name: "Dusty Rose", bg: ["#F6F1F3", "#F8F3F5", "#F5F0F2", "#F9F4F6", "#F7F2F4"], text: ["#3F3739", "#41393B", "#40383A", "#3E3638", "#3D3537"], accent: "#9D7783", gradient: ["#EDE5E9", "#E4D9DE"] },
  { name: "Soft Wheat", bg: ["#F9F6F0", "#FBF8F2", "#F8F5EF", "#FCF9F3", "#FAF7F1"], text: ["#403C33", "#423E35", "#413D34", "#3F3B32", "#3E3A31"], accent: "#B09876", gradient: ["#F0EBE3", "#E7E0D4"] },
  { name: "Pearl Grey", bg: ["#F5F5F6", "#F7F7F8", "#F4F4F5", "#F8F8F9", "#F6F6F7"], text: ["#3A3A3C", "#3C3C3E", "#3B3B3D", "#393B3B", "#38383A"], accent: "#7A7A7E", gradient: ["#EBEBEC", "#E0E0E2"] },
  { name: "Apricot Cream", bg: ["#FFF7F2", "#FFF9F4", "#FFF6F1", "#FFFAF5", "#FFF8F3"], text: ["#4A3C37", "#4C3E39", "#4B3D38", "#493B36", "#483A35"], accent: "#D4886B", gradient: ["#FFEDE3", "#FFE3D4"] },
  { name: "Slate Mist", bg: ["#F1F3F5", "#F3F5F7", "#F0F2F4", "#F4F6F8", "#F2F4F6"], text: ["#333740", "#353942", "#343841", "#32363F", "#31353E"], accent: "#5E6A7A", gradient: ["#E5E8EB", "#DAE0E4"] },
  { name: "Champagne", bg: ["#FAF8F5", "#FCFAF7", "#F9F7F4", "#FDFBF8", "#FBF9F6"], text: ["#3F3D38", "#413F3A", "#403E39", "#3E3C37", "#3D3B36"], accent: "#9C8A70", gradient: ["#F1EDE7", "#E8E2D9"] },
  { name: "Powder Blue", bg: ["#F2F6F9", "#F4F8FB", "#F1F5F8", "#F5F9FC", "#F3F7FA"], text: ["#2E3944", "#303B46", "#2F3A45", "#2D3843", "#2C3742"], accent: "#6485A0", gradient: ["#E6ECF1", "#D9E3EB"] },
  { name: "Almond Milk", bg: ["#F8F6F2", "#FAF8F4", "#F7F5F1", "#FBF9F5", "#F9F7F3"], text: ["#3D3B35", "#3F3D37", "#3E3C36", "#3C3A34", "#3B3933"], accent: "#9B8B75", gradient: ["#EFEAE3", "#E6DFD4"] },
  { name: "Lilac Haze", bg: ["#F6F4F8", "#F8F6FA", "#F5F3F7", "#F9F7FB", "#F7F5F9"], text: ["#3D3742", "#3F3944", "#3E3843", "#3C3641", "#3B3540"], accent: "#8470A0", gradient: ["#ECE8F0", "#E0DAE8"] },
  { name: "Soft Terracotta", bg: ["#F7F3F0", "#F9F5F2", "#F6F2EF", "#FAF6F3", "#F8F4F1"], text: ["#3E3833", "#403A35", "#3F3934", "#3D3732", "#3C3631"], accent: "#A67C68", gradient: ["#EEE7E3", "#E5DCD4"] }
];

const generateSummary = (text, minWords = 300, maxWords = 400) => {
  if (!text) return "";
  const cleanText = text.replace(/<[^>]*>/g, "");
  const words = cleanText.split(/\s+/);
  if (words.length <= minWords) {
    return cleanText.trim();
  }
  const limitedWords = words.slice(0, maxWords);
  return limitedWords.join(" ").trim() + "...";
};

const NICHE_QUERIES = [
  "forgotten medieval weapons",
  "ww2 experimental aircraft",
  "abandoned cold war projects",
  "strange historical punishments",
  "bizarre scientific experiments",
  "lost ancient technologies",
  "failed military inventions",
  "mysterious archaeological finds",
  "obscure psychological syndromes",
  "unusual medical conditions",
  "rare natural phenomena",
  "extinct languages",
  "forgotten inventions",
  "mysterious disappearances",
  "ancient mysteries",
  "strange cultural practices",
  "obsolete professions",
  "unusual animals",
  "rare diseases",
  "historical hoaxes",
  "unexplained phenomena",
  "ancient civilizations",
  "lost cities",
  "cryptic manuscripts",
  "bizarre laws",
  "unusual sports",
  "strange architecture",
  "forgotten battles",
  "obscure philosophers",
  "rare minerals",
  "unusual plants",
  "historical oddities",
  "ancient artifacts",
  "mysterious symbols",
  "forgotten rulers",
  "unusual festivals",
  "rare books",
  "historical mysteries",
  "ancient rituals",
  "unusual traditions",
  "forgotten languages",
  "rare creatures",
  "historical enigmas",
  "ancient wonders",
  "mysterious places",
  "unusual inventions",
  "forgotten heroes",
  "rare phenomena",
  "historical curiosities",
  "ancient scripts"
];

let usedTitles = new Set();
let queryIndex = 0;

const fetchWikipediaArticles = async () => {
  const results = [];
  let attempts = 0;
  const MAX_ATTEMPTS = 6;

  while (results.length < 10 && attempts < MAX_ATTEMPTS) {
    attempts++;

    try {
      const query = NICHE_QUERIES[queryIndex % NICHE_QUERIES.length];
      queryIndex++;

      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          query
        )}&srlimit=50&format=json&origin=*`
      );

      const searchData = await searchRes.json();
      const pages = (searchData.query?.search || []).sort(
        () => Math.random() - 0.5
      );

      for (const p of pages) {
        if (usedTitles.has(p.title)) continue;

        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            p.title
          )}`
        );

        if (!summaryRes.ok) continue;

        const page = await summaryRes.json();
        if (!page.extract || page.extract.length < 120) continue;

        usedTitles.add(p.title);

        results.push({
          id: crypto.randomUUID(),
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

const ReelCard = ({ article, isActive, totalCards, currentIndex, onSave, isSaved, colorTheme }) => {
  const [showMessage, setShowMessage] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const colorIndex = Math.abs(article.title.length) % 5;
  const bgColor = colorTheme.bg[colorIndex];
  const textColor = colorTheme.text[colorIndex];
  const accentColor = colorTheme.accent;

  const handleShare = async (method) => {
    const shareData = {
      title: article.title,
      text: `Check out this article: ${article.title}`,
      url: article.url
    };

    if (method === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(article.url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy');
      }
    }
    setShowShareMenu(false);
  };

  const sensitiveKeywords = ['israel', 'palestine', 'genocide'];
  const hasSensitiveContent = sensitiveKeywords.some(keyword =>
    article.title.toLowerCase().includes(keyword) ||
    article.summary.toLowerCase().includes(keyword)
  );

  useEffect(() => {
    if (hasSensitiveContent && isActive) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasSensitiveContent, isActive]);

  return (
    <div className="h-screen w-screen snap-start snap-always flex items-center justify-center p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: isActive ? 1 : 0.7,
          scale: isActive ? 1 : 0.98,
        }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[95%] sm:max-w-3xl h-full max-h-[92vh] sm:max-h-[88vh] relative">

        <motion.div
          className="w-full h-full rounded-2xl sm:rounded-3xl flex flex-col cursor-default relative"
          style={{
            backgroundColor: bgColor,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 sm:gap-3 z-20">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave(article.id)}
              className="backdrop-blur-sm p-2 sm:p-3 rounded-full transition-colors"
              style={{
                backgroundColor: isSaved ? `${accentColor}33` : `${accentColor}1A`,
              }}>
              <Bookmark
                className="w-4 h-4 sm:w-5 sm:h-5 transition-all"
                style={{
                  color: accentColor,
                  fill: isSaved ? accentColor : 'none'
                }}
              />
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 sm:p-3 rounded-full transition-colors"
                style={{ backgroundColor: `${accentColor}1A` }}>
                <Share2
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: accentColor }}
                />
              </motion.button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 mt-2 rounded-xl overflow-hidden shadow-lg z-30"
                    style={{ backgroundColor: bgColor }}>
                    {navigator.share && (
                      <button
                        onClick={() => handleShare('native')}
                        className="block w-full px-4 py-2.5 text-left text-sm transition-opacity hover:opacity-70 whitespace-nowrap"
                        style={{ color: textColor }}>
                        Share via...
                      </button>
                    )}
                    <button
                      onClick={() => handleShare('copy')}
                      className="block w-full px-4 py-2.5 text-left text-sm transition-opacity hover:opacity-70 whitespace-nowrap border-t"
                      style={{ color: textColor, borderColor: 'rgba(0,0,0,0.1)' }}>
                      Copy link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col p-6 sm:p-10 md:p-12 lg:p-16 min-h-0">
            <div className="flex flex-col gap-6 flex-1 min-h-0">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-2xl sm:text-4xl md:text-5xl leading-tight break-words pr-16 sm:pr-20"
                style={{
                  color: textColor,
                  fontWeight: 650,
                  letterSpacing: '-0.02em',
                  fontFamily: 'poppins, serif'
                }}>
                {article.title}
              </motion.h2>

              <div className="flex-1 min-h-0 overflow-y-auto pr-3">
                {article.imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, duration: 0.8 }}
                    className="float-right ml-4 mb-4 rounded-xl overflow-hidden shadow-lg"
                    style={{ width: '200px', maxWidth: '45%' }}>
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-auto object-cover"
                    />
                  </motion.div>
                )}

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-base sm:text-lg md:text-xl leading-relaxed"
                  style={{
                    color: textColor,
                    opacity: 0.8,
                    fontWeight: 400,
                    lineHeight: 1.8,
                    fontFamily: 'poppins, serif'
                  }}>
                  {article.summary}
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-8 sm:mt-10">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: accentColor,
                    color: bgColor
                  }}>
                  <span>Continue reading</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </motion.button>
              </a>
            </motion.div>
          </div>

          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-xl"
                  style={{ backgroundColor: 'rgba(34, 139, 34, 0.9)' }}>
                  <p className="text-sm sm:text-lg font-medium whitespace-nowrap"
                    style={{ color: '#F5F1E8' }}>
                    Free Palestine 🇵🇸
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.03, 0.05, 0.03],
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
              style={{ backgroundColor: accentColor }}
            />
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.03, 0.04, 0.03],
              }}
              transition={{ duration: 15, repeat: Infinity, delay: 2 }}
              className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full blur-3xl"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const ReelFeed = () => {
  const loadingRef = useRef(false);
  const [articles, setArticles] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [savedArticles, setSavedArticles] = useState(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const containerRef = useRef(null);

  const theme = COLOR_THEMES[currentTheme];

  const handleSave = (articleId) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const savedArticlesList = articles.filter(a => savedArticles.has(a.id));

  const loadMore = async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoadingMore(true);

    const newArticles = await fetchWikipediaArticles();

    if (newArticles.length > 0) {
      setArticles(prev => [...prev, ...newArticles]);
    }

    setLoadingMore(false);
    loadingRef.current = false;
  };

  useEffect(() => {
    const init = async () => {
      setInitialized(true);
      loadMore();
    };
    init();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !initialized) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setActiveIndex(Math.round(scrollTop / clientHeight));

      if (scrollTop + clientHeight >= scrollHeight - clientHeight * 5) {
        loadMore();
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadingMore, initialized]);

  return (
    <>
      {/* Theme Selector Modal */}
      <AnimatePresence>
        {showThemes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setShowThemes(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.bg[0] }}>

              <div className="p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold" style={{ color: theme.text[0], fontFamily: 'poppins, serif' }}>
                    Choose Theme
                  </h2>
                  <button
                    onClick={() => setShowThemes(false)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    style={{ color: theme.accent }}>
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                <div className="grid grid-cols-2 gap-4">
                  {COLOR_THEMES.map((t, index) => (
                    <motion.button
                      key={t.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentTheme(index);
                        setShowThemes(false);
                      }}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: t.bg[0],
                        border: currentTheme === index ? `2px solid ${t.accent}` : '2px solid transparent'
                      }}>
                      <div className="flex gap-2 mb-2">
                        {t.bg.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="font-medium text-sm" style={{ color: t.text[0], fontFamily: 'poppins, serif' }}>
                        {t.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Articles Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setShowSaved(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden"
              style={{ backgroundColor: theme.bg[0] }}>

              <div className="p-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold" style={{ color: theme.text[0], fontFamily: 'poppins, serif' }}>
                    Saved Articles ({savedArticlesList.length})
                  </h2>
                  <button
                    onClick={() => setShowSaved(false)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    style={{ color: theme.accent }}>
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                {savedArticlesList.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: theme.accent }} />
                    <p className="text-lg opacity-60" style={{ color: theme.text[0], fontFamily: 'poppins, serif' }}>
                      No saved articles yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedArticlesList.map((article) => (
                      <motion.div
                        key={article.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 rounded-xl cursor-pointer"
                        style={{ backgroundColor: `${theme.accent}0D` }}
                        onClick={() => {
                          setShowSaved(false);
                          const index = articles.findIndex(a => a.id === article.id);
                          if (index !== -1) {
                            containerRef.current?.scrollTo({
                              top: index * window.innerHeight,
                              behavior: 'smooth'
                            });
                          }
                        }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2 line-clamp-2" style={{ color: theme.text[0], fontFamily: 'poppins, serif' }}>
                              {article.title}
                            </h3>
                            <p className="text-sm opacity-70 line-clamp-2" style={{ color: theme.text[0], fontFamily: 'poppins, serif' }}>
                              {article.summary}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(article.id);
                            }}
                            className="p-2 rounded-full hover:bg-black/5 transition-colors flex-shrink-0">
                            <Bookmark className="w-5 h-5" style={{ color: theme.accent, fill: theme.accent }} />
                          </button>
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

      {/* Theme Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowThemes(true)}
        className="fixed bottom-6 left-6 p-4 rounded-full shadow-2xl z-40"
        style={{ backgroundColor: theme.accent, color: theme.bg[0] }}>
        <Palette className="w-5 h-5" />
      </motion.button>

      {/* View Saved Button */}
      {savedArticles.size > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSaved(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 flex items-center gap-2"
          style={{ backgroundColor: theme.accent, color: theme.bg[0] }}>
          <Bookmark className="w-5 h-5" style={{ fill: theme.bg[0] }} />
          <span className="font-medium pr-1">{savedArticles.size}</span>
        </motion.button>
      )}

      <div
        ref={containerRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
        style={{
          background: `linear-gradient(to bottom, ${theme.gradient[0]}, ${theme.gradient[1]})`
        }}>
        {articles.length === 0 && !loadingMore && (
          <div className="h-screen flex flex-col items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 rounded-full"
              style={{
                borderColor: `${theme.accent}33`,
                borderTopColor: theme.accent
              }}
            />
            <p className="text-lg font-light" style={{ color: theme.accent }}>
              Preparing your reading...
            </p>
          </div>
        )}

        {articles.map((a, i) => (
          <ReelCard
            key={a.id}
            article={a}
            isActive={i === activeIndex}
            totalCards={articles.length}
            currentIndex={i}
            onSave={handleSave}
            isSaved={savedArticles.has(a.id)}
            colorTheme={theme}
          />
        ))}

        {loadingMore && (
          <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8" style={{ color: theme.accent }} />
          </div>
        )}
      </div>
    </>
  );
};

const App = () => {
  return <ReelFeed />;
};

export default App;