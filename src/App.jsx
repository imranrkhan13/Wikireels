import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2 } from 'lucide-react';
const KEYWORDS_REGEX = /(israel|palestine|genocide)/i;

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

// Load used titles
const loadUsedTitles = async () => {
  try {
    const data = localStorage.getItem('used-titles');
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
};

// Save used titles
const saveUsedTitles = async (titles) => {
  localStorage.setItem('used-titles', JSON.stringify([...titles]));
};

// Load query index
const loadQueryIndex = async () => {
  const data = localStorage.getItem('query-index');
  return data ? parseInt(data) : 0;
};

// Save query index
const saveQueryIndex = async (index) => {
  localStorage.setItem('query-index', index.toString());
};


let usedTitles = new Set();
let queryIndex = 0;

const fetchWikipediaArticles = async () => {
  const results = [];

  while (results.length < 10) {
    try {
      const query = NICHE_QUERIES[queryIndex % NICHE_QUERIES.length];
      queryIndex++;
      await saveQueryIndex(queryIndex);

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
        if (usedTitles.size < 1000 && usedTitles.has(p.title)) continue;

        const summaryRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            p.title
          )}`
        );

        if (!summaryRes.ok) continue;

        const page = await summaryRes.json();
        if (!page.extract || page.extract.length < 120) continue;

        usedTitles.add(p.title);
        await saveUsedTitles(usedTitles);

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


const ReelCard = ({ article, isActive }) => {
  const colors = ['#6D8196', '#ADCCED', '#546373'];
  const colorIndex = Math.abs(article.title.length) % 3;
  const bgColor = colors[colorIndex];

  return (
    <div className="h-screen w-screen snap-start snap-always flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: isActive ? 1 : 0.5,
          scale: isActive ? 1 : 0.98
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl h-full max-h-[92vh] sm:max-h-[90vh]">
        <div
          className="w-full h-full rounded-lg sm:rounded-xl flex flex-col justify-between p-5 sm:p-6 md:p-10"
          style={{ backgroundColor: bgColor }}>

          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 flex flex-col justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-4xl text-white leading-snug font-medium break-words">
              {article.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-light">
              {article.summary}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 sm:py-4 bg-white/95 text-gray-800 rounded-lg font-normal text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-white transition-colors">
                Read Full Article
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const ReelFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const containerRef = useRef(null);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    const newArticles = await fetchWikipediaArticles();
    console.log("Fetched:", newArticles);

    if (newArticles.length > 0) {
      setArticles(prev => [...prev, ...newArticles]);
    }

    setLoadingMore(false);
  };

  useEffect(() => {
    const init = async () => {
      usedTitles = await loadUsedTitles();
      queryIndex = await loadQueryIndex();
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

      // Load more when user is 3 screens away from bottom
      if (scrollTop + clientHeight >= scrollHeight - clientHeight * 3) {
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
      style={{ backgroundColor: '#36404A' }}>
      {articles.length === 0 && !loadingMore && (
        <div className="h-screen flex items-center justify-center text-white text-base sm:text-lg px-4">
          Loading WikiReels...
        </div>
      )}

      {articles.map((a, i) => (
        <ReelCard key={a.id} article={a} isActive={i === activeIndex} />
      ))}

      {loadingMore && (
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
      )}
    </div>
  );
};

const App = () => {
  return <ReelFeed />;
};

export default App;