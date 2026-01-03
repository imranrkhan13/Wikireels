import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, Bookmark, Share2, Palette, Sparkles, TrendingUp } from 'lucide-react';

const COLOR_THEMES = [
  { name: "Warm Cream", bg: ["#F5F1E8", "#F7F3EA", "#F3EFE6", "#F8F4EB", "#F6F2E9"], text: ["#3E3E3E", "#424242", "#404040", "#3C3C3C", "#3A3A3A"], accent: "#8B5C4A", gradient: ["#EDE7DC", "#E3DCD0"], badge: "Default" },
  { name: "Soft Sage", bg: ["#F0F4F0", "#EEF2EE", "#EDF1ED", "#F1F5F1", "#EFF3EF"], text: ["#2C3E2C", "#2E402E", "#2D3F2D", "#2B3D2B", "#2A3C2A"], accent: "#5A7A5A", gradient: ["#E4EBE4", "#D8E3D8"] },
  { name: "Gentle Lavender", bg: ["#F5F3F8", "#F7F5FA", "#F4F2F7", "#F8F6FB", "#F6F4F9"], text: ["#3E3542", "#403744", "#3F3643", "#3D3441", "#3C3340"], accent: "#7B5E7B", gradient: ["#EBE7F0", "#DFD9E8"] },
  { name: "Mint Whisper", bg: ["#F2F8F5", "#F4FAF7", "#F1F7F4", "#F5FBF8", "#F3F9F6"], text: ["#2E3F38", "#30413A", "#2F4039", "#2D3E37", "#2C3D36"], accent: "#5F8C7A", gradient: ["#E6F0EB", "#DAE8E0"], badge: "Most Used" },
  { name: "Peachy Blush", bg: ["#FFF5F0", "#FFF7F2", "#FFF4EF", "#FFF8F3", "#FFF6F1"], text: ["#4A3835", "#4C3A37", "#4B3936", "#493734", "#483633"], accent: "#C97A63", gradient: ["#FFEBE3", "#FFE0D4"] },
  { name: "Misty Blue", bg: ["#F0F5F8", "#F2F7FA", "#EFF4F7", "#F3F8FB", "#F1F6F9"], text: ["#2C3942", "#2E3B44", "#2D3A43", "#2B3841", "#2A3740"], accent: "#5B7C8E", gradient: ["#E4EDF2", "#D8E5EC"] },
  { name: "Ivory Linen", bg: ["#FAF8F3", "#FCFAF5", "#F9F7F2", "#FDFBF6", "#FBF9F4"], text: ["#3F3D35", "#413F37", "#403E36", "#3E3C34", "#3D3B33"], accent: "#8E7A5F", gradient: ["#F1EDE5", "#E8E2D7"] },
  { name: "Rose Quartz", bg: ["#F8F2F4", "#FAF4F6", "#F7F1F3", "#FBF5F7", "#F9F3F5"], text: ["#42363A", "#44383C", "#43373B", "#413539", "#403438"], accent: "#9E6B7B", gradient: ["#EFE6EA", "#E6DAE0"] },
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
  "unusual animals", "rare diseases", "historical hoaxes", "unexplained phenomena", "ancient civilizations",
  "lost cities", "cryptic manuscripts", "bizarre laws", "unusual sports", "strange architecture",
  "forgotten battles", "obscure philosophers", "rare minerals", "unusual plants", "historical oddities",
  "ancient artifacts", "mysterious symbols", "forgotten rulers", "unusual festivals", "rare books",
  "historical mysteries", "ancient rituals", "unusual traditions", "forgotten languages", "rare creatures",
  "historical enigmas", "ancient wonders", "mysterious places", "unusual inventions", "forgotten heroes",
  "rare phenomena", "historical curiosities", "ancient scripts"
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
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=50&format=json&origin=*`
      );

      const searchData = await searchRes.json();
      const pages = (searchData.query?.search || []).sort(() => Math.random() - 0.5);

      for (const p of pages) {
        if (usedTitles.has(p.title)) continue;

        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.title)}`
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasSensitiveContent, isActive]);

  return (
    <div className="h-screen w-screen snap-start snap-always flex items-center justify-center relative px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isActive ? 1 : 0.4,
          scale: isActive ? 1 : 0.92,
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full sm:w-[95%] md:w-[90%] lg:w-[80%] xl:w-[70%] 2xl:w-[65%] max-w-5xl h-[88vh] sm:h-[90vh] md:h-[92vh] relative">

        <div
          className="w-full h-full rounded-2xl sm:rounded-3xl flex flex-col relative overflow-hidden"
          style={{
            backgroundColor: bgColor,
            boxShadow: isActive
              ? `0 20px 50px rgba(0,0,0,0.18), 0 10px 25px rgba(0,0,0,0.1), inset 0 0 60px ${accentColor}10`
              : '0 8px 25px rgba(0,0,0,0.08)',
            border: `1px solid ${accentColor}15`
          }}>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={isActive ? {
                scale: [1, 1.3, 1.1, 1],
                rotate: [0, 90, 180, 270, 360],
                x: [0, 80, -40, 0],
                y: [0, -60, 50, 0],
                opacity: [0.08, 0.14, 0.1, 0.08],
              } : {}}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl"
              style={{
                backgroundColor: accentColor,
                mixBlendMode: 'multiply'
              }}
            />
            <motion.div
              animate={isActive ? {
                scale: [1, 1.2, 1],
                rotate: [360, 270, 180, 90, 0],
                x: [0, -60, 50, 0],
                y: [0, 80, -30, 0],
                opacity: [0.06, 0.11, 0.08, 0.06],
              } : {}}
              transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute -bottom-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-3xl"
              style={{
                backgroundColor: accentColor,
                mixBlendMode: 'multiply'
              }}
            />
          </div>

          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${accentColor}20, transparent 60%),
                          radial-gradient(circle at 80% 80%, ${accentColor}15, transparent 50%)`
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10">

              <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
                <motion.div
                  className="flex-1 space-y-2 sm:space-y-3 min-w-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}>

                  <motion.div
                    initial={{ scale: 0, x: -15 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.25, type: "spring", stiffness: 180 }}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] xs:text-xs font-semibold"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                      backdropFilter: 'blur(10px)'
                    }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="whitespace-nowrap">Wikipedia Discovery</span>
                  </motion.div>

                  <motion.h2
                    className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight break-words"
                    style={{
                      color: textColor,
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      textShadow: '0 2px 20px rgba(0,0,0,0.05)'
                    }}>
                    {article.title}
                  </motion.h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex flex-row gap-2 sm:gap-3 flex-shrink-0 items-start"
                >


                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSave(article.id)}
                    className="backdrop-blur-xl p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all shadow-lg"
                    style={{
                      backgroundColor: isSaved ? `${accentColor}30` : `${accentColor}15`,
                      border: `2px solid ${isSaved ? accentColor : 'transparent'}`
                    }}>
                    <motion.div
                      animate={isSaved ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{ duration: 0.4 }}>
                      <Bookmark
                        className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5"
                        style={{ color: accentColor, fill: isSaved ? accentColor : 'none', strokeWidth: 2 }}
                      />
                    </motion.div>
                  </motion.button>

                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="backdrop-blur-xl p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all shadow-lg"
                      style={{ backgroundColor: `${accentColor}15` }}>
                      <Share2 className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5" style={{ color: accentColor, strokeWidth: 2 }} />
                    </motion.button>

                    <AnimatePresence>
                      {showShareMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10, x: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10, x: 10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="absolute right-0 mt-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl z-30 backdrop-blur-xl"
                          style={{ backgroundColor: `${bgColor}F5`, border: `1px solid ${accentColor}20` }}>
                          {navigator.share && (
                            <motion.button
                              whileHover={{ x: 5, backgroundColor: `${accentColor}10` }}
                              onClick={() => handleShare('native')}
                              className="block w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                              style={{ color: textColor }}>
                              Share via...
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ x: 5, backgroundColor: `${accentColor}10` }}
                            onClick={() => handleShare('copy')}
                            className="block w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium whitespace-nowrap border-t transition-colors"
                            style={{ color: textColor, borderColor: `${accentColor}15` }}>
                            Copy link
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div className="flex-1 px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 pb-4 sm:pb-6 min-h-0 relative overflow-hidden">
              <div className={`h-full ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'} pr-1 sm:pr-2`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="relative">

                  {article.imageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{
                        opacity: imageLoaded ? 1 : 0,
                        scale: imageLoaded ? 1 : 0.9,
                      }}
                      transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      className="float-right ml-3 sm:ml-4 md:ml-5 mb-3 sm:mb-4 md:mb-5 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-2 sm:ring-4 ring-white/20"
                      style={{
                        width: '130px',
                        maxWidth: '40%',
                        boxShadow: `0 15px 50px ${accentColor}30, 0 0 30px ${accentColor}15`
                      }}>
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-auto object-cover"
                        onLoad={() => setImageLoaded(true)}
                        style={{ display: 'block' }}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className="text-sm xs:text-base sm:text-lg md:text-xl leading-relaxed"
                    style={{
                      color: textColor,
                      opacity: 0.9,
                      fontWeight: 400,
                      lineHeight: 1.7,
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                    {article.summary.split(' ').slice(0, isExpanded ? undefined : 80).map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.45 + (i * 0.003),
                          duration: 0.25,
                          ease: "easeOut"
                        }}
                        style={{ display: 'inline-block', marginRight: '0.3em' }}>
                        {word}
                      </motion.span>
                    ))}
                    {!isExpanded && article.summary.split(' ').length > 80 && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(true)}
                        className="inline-flex items-center gap-1 ml-1.5 sm:ml-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor
                        }}>
                        Read more
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 pb-4 xs:pb-5 sm:pb-6 md:pb-8 pt-4 sm:pt-5 md:pt-6 border-t relative z-20"
              style={{
                borderColor: `${accentColor}20`,
                background: `linear-gradient(to top, ${bgColor}, transparent)`
              }}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group shadow-2xl"
                  style={{
                    backgroundColor: accentColor,
                    color: bgColor,
                    boxShadow: `0 8px 35px ${accentColor}40`
                  }}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Continue on Wikipedia</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}>
                    <ExternalLink className="w-4 sm:w-5 h-4 sm:h-5" />
                  </motion.div>
                </motion.button>
              </a>
            </motion.div>
          </div>

          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="absolute top-20 sm:top-28 md:top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4">
                <div
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-xl"
                  style={{ backgroundColor: 'rgba(34, 139, 34, 0.95)' }}>
                  <p
                    className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap"
                    style={{ color: '#F5F1E8' }}>
                    Free Palestine 🇵🇸
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
{/* 
          <motion.div
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}>
            {[...Array(Math.min(totalCards, 5))].map((_, i) => {
              const isCurrent = i === currentIndex % 5;
              return (
                <motion.div
                  key={i}
                  animate={{
                    width: isCurrent ? 24 : 6,
                    opacity: isCurrent ? 1 : 0.3,
                    scale: isCurrent ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-1.5 sm:h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              );
            })}
          </motion.div> */}
        </div>
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
      const currentIndex = Math.round(scrollTop / clientHeight);
      setActiveIndex(currentIndex);

      if (scrollTop + clientHeight >= scrollHeight - clientHeight * 5) {
        loadMore();
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadingMore, initialized]);

  return (
    <>
      <AnimatePresence>
        {showThemes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setShowThemes(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: theme.bg[0] }}>
              <div className="p-4 sm:p-6 md:p-8 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" style={{ color: theme.accent }} />
                    </motion.div>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate"
                      style={{ color: theme.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Choose Your Theme
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowThemes(false)}
                    className="p-2 sm:p-3 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
                    style={{ color: theme.accent }}>
                    <span className="text-lg sm:text-xl md:text-2xl">✕</span>
                  </motion.button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-100px)] md:max-h-[calc(85vh-120px)] p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                  {COLOR_THEMES.map((t, index) => (
                    <motion.button
                      key={t.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentTheme(index);
                        setShowThemes(false);
                      }}
                      className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl text-left transition-all relative overflow-hidden group"
                      style={{
                        backgroundColor: t.bg[0],
                        border: currentTheme === index ? `2px solid ${t.accent}` : '2px solid transparent',
                        boxShadow: currentTheme === index
                          ? `0 6px 20px ${t.accent}40`
                          : '0 2px 8px rgba(0,0,0,0.08)'
                      }}>

                      {t.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.02 + 0.15, type: "spring" }}
                          className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1"
                          style={{
                            backgroundColor: `${t.accent}20`,
                            color: t.accent
                          }}>
                          {t.badge === "Default" && <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3" />}
                          {t.badge === "Most Used" && <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />}
                          <span className="hidden sm:inline">{t.badge}</span>
                        </motion.div>
                      )}

                      <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {t.bg.slice(0, 4).map((color, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.02 + 0.1 + (i * 0.04) }}
                            whileHover={{ scale: 1.15 }}
                            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ring-1 sm:ring-2 ring-white/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <p className="font-semibold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1"
                        style={{ color: t.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {t.name}
                      </p>

                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${t.accent}00, ${t.accent}FF)`
                        }}
                      />

                      {currentTheme === index && (
                        <motion.div
                          layoutId="activeTheme"
                          className="absolute inset-0 rounded-xl sm:rounded-2xl"
                          style={{
                            border: `2px solid ${t.accent}`,
                            backgroundColor: `${t.accent}08`
                          }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        />
                      )}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            onClick={() => setShowSaved(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: theme.bg[0] }}>

              <div className="p-4 sm:p-6 md:p-8 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" style={{ color: theme.accent, fill: theme.accent }} />
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate"
                      style={{ color: theme.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Saved Articles ({savedArticlesList.length})
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSaved(false)}
                    className="p-2 sm:p-3 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
                    style={{ color: theme.accent }}>
                    <span className="text-lg sm:text-xl md:text-2xl">✕</span>
                  </motion.button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-100px)] md:max-h-[calc(85vh-120px)] p-3 sm:p-4 md:p-6 lg:p-8">
                {savedArticlesList.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 sm:py-16">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      <Bookmark className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 opacity-30" style={{ color: theme.accent }} />
                    </motion.div>
                    <p className="text-sm sm:text-base md:text-lg opacity-60"
                      style={{ color: theme.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      No saved articles yet
                    </p>
                    <p className="text-xs sm:text-sm opacity-40 mt-1.5 sm:mt-2" style={{ color: theme.text[0] }}>
                      Start bookmarking articles you love!
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    {savedArticlesList.map((article, idx) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.015, x: 3 }}
                        className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all"
                        style={{
                          backgroundColor: `${theme.accent}10`,
                          border: `1px solid ${theme.accent}20`
                        }}
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 line-clamp-2"
                              style={{ color: theme.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              {article.title}
                            </h3>
                            <p className="text-xs sm:text-sm opacity-70 line-clamp-2"
                              style={{ color: theme.text[0], fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              {article.summary}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(article.id);
                            }}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-colors flex-shrink-0">
                            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.accent, fill: theme.accent }} />
                          </motion.button>
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

      <motion.button
        initial={{ scale: 0, rotate: -180, x: -100 }}
        animate={{ scale: 1, rotate: 0, x: 0 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        onClick={() => setShowThemes(true)}
        className="fixed bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl shadow-2xl z-40 backdrop-blur-xl"
        style={{
          backgroundColor: `${theme.accent}`,
          color: theme.bg[0],
          boxShadow: `0 8px 35px ${theme.accent}60, 0 0 50px ${theme.accent}30`
        }}>
        <Palette className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
      </motion.button>

      {savedArticles.size > 0 && (
        <motion.button
          initial={{ scale: 0, rotate: 180, x: 100 }}
          animate={{ scale: 1, rotate: 0, x: 0 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          onClick={() => setShowSaved(true)}
          className="fixed bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl shadow-2xl z-40 flex items-center gap-2 sm:gap-2.5 md:gap-3 backdrop-blur-xl"
          style={{
            backgroundColor: theme.accent,
            color: theme.bg[0],
            boxShadow: `0 8px 35px ${theme.accent}60, 0 0 50px ${theme.accent}30`
          }}>
          <Bookmark className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" style={{ fill: theme.bg[0] }} />
          <motion.span
            className="font-bold text-base sm:text-lg"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}>
            {savedArticles.size}
          </motion.span>
        </motion.button>
      )}

      {/* {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 0.8 }}
          className="hidden sm:flex fixed left-4 sm:left-5 md:left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-2.5 sm:gap-3">
          {articles.slice(0, Math.min(10, articles.length)).map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.35, x: 3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                containerRef.current?.scrollTo({
                  top: i * window.innerHeight,
                  behavior: 'smooth'
                });
              }}
              className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all"
              animate={{
                scale: i === activeIndex ? 1.35 : 1,
                opacity: i === activeIndex ? 1 : 0.3,
                backgroundColor: i === activeIndex ? theme.accent : `${theme.accent}80`
              }}
              transition={{ duration: 0.25 }}
              style={{
                boxShadow: i === activeIndex ? `0 0 12px ${theme.accent}` : 'none'
              }}
            />
          ))}
        </motion.div>
      )} */}

      <div
        ref={containerRef}
        className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
        style={{
          background: `linear-gradient(to bottom, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}>

        {articles.length === 0 && !loadingMore && (
          <div className="h-screen flex flex-col items-center justify-center gap-6 sm:gap-8 px-4">
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 rounded-full"
                style={{
                  borderColor: `${theme.accent}20`,
                  borderTopColor: theme.accent
                }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: theme.accent }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2 sm:space-y-3">
              <motion.p
                className="text-lg sm:text-xl font-semibold"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: theme.accent }}>
                Curating your experience
              </motion.p>
              <p className="text-xs sm:text-sm opacity-60" style={{ color: theme.text[0] }}>
                Discovering fascinating content...
              </p>
            </motion.div>
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" style={{ color: theme.accent }} />
              
            </motion.div>
            
            <br />
            <motion.p
              className="text-lg sm:text-xl font-semibold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: theme.accent }}>
              Be ready to drown in information...
            </motion.p>
          </div>
        )}
      </div>
    </>
  );
};

const App = () => <ReelFeed />;
export default App;