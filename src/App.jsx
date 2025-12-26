import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, BookOpen } from 'lucide-react';

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
          url: page.content_urls?.desktop?.page
        });

        if (results.length >= 10) break;
      }
    } catch (e) {
      console.error("Wiki fetch error:", e);
    }
  }

  return results;
};

const ReelCard = ({ article, isActive, totalCards, currentIndex }) => {
  const [showMessage, setShowMessage] = useState(false);

  const colors = [
    '#2D3047',
    '#3E4152',
    '#374151',
    '#2F3542',
    '#3B3F51',
  ];

  const colorIndex = Math.abs(article.title.length) % 5;
  const bgColor = colors[colorIndex];

  // Check for sensitive keywords
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
        initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
        animate={{
          opacity: isActive ? 1 : 0.6,
          scale: isActive ? 1 : 0.95,
          rotateX: isActive ? 0 : 10,
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[95%] sm:max-w-2xl h-full max-h-[92vh] sm:max-h-[88vh] relative"
        style={{ perspective: '1000px' }}>

        {/* Progress indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-6 sm:-top-10 left-0 right-0 flex items-center justify-center gap-1 sm:gap-1.5 z-50">
            {Array.from({ length: Math.min(totalCards, 10) }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 sm:h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 sm:w-8 bg-white' : 'w-0.5 sm:w-1 bg-white/30'
                  }`}
              />
            ))}
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: isActive ? 1.02 : 1 }}
          className="w-full h-full rounded-xl sm:rounded-2xl flex flex-col overflow-hidden cursor-default relative shadow-2xl"
          style={{
            backgroundColor: bgColor,
            transformStyle: 'preserve-3d',
          }}>

          {/* Floating icon */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between p-5 sm:p-8 md:p-10 lg:p-12 overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center space-y-4 sm:space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-tight font-bold break-words">
                {article.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-light">
                {article.summary}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 sm:mt-8">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full group">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 sm:py-4 bg-white text-gray-900 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all">
                  <span>Read Full Article</span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                  className="bg-green-500/90 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-2xl">
                  <p className="text-white text-sm sm:text-lg font-semibold whitespace-nowrap">
                    Free Palestine 🇵🇸
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-16 sm:-top-24 -right-16 sm:-right-24 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-20 sm:-bottom-32 -left-20 sm:-left-32 w-40 h-40 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl"
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
  const containerRef = useRef(null);

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
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1e)' }}>
      {articles.length === 0 && !loadingMore && (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-lg font-light">Loading WikiReels...</p>
        </div>
      )}

      {articles.map((a, i) => (
        <ReelCard
          key={a.id}
          article={a}
          isActive={i === activeIndex}
          totalCards={articles.length}
          currentIndex={i}
        />
      ))}

      {loadingMore && (
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-white/60" />
        </div>
      )}
    </div>
  );
};

const App = () => {
  return <ReelFeed />;
};

export default App;