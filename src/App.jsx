import { useState, useEffect, useRef } from "react";

const WORD_POOL = ["the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","great","between","need","large","often","hand","high","place","hold","turn","found","still","learn","plant","cover","food","sun","four","state","never","become","add","under","last","point","play","small","number","off","always","move","night","live","city","sound","every","near","build","earth","light","world","story","might","set","put","end","does","another","large","often","hand","high","form","air"];

function generateWords(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return arr;
}

function Userinput({ input, setInput, disabled, inputRef }) {
  return (
    <textarea
      ref={inputRef}
      value={input}
      onChange={(e) => {
        const value = e.target.value;
        if (value.endsWith("  ")) return;
        setInput(value);
      }}
      disabled={disabled}
      placeholder="start typing to begin..."
      className="w-full bg-[#111228] border border-[#1a1e40] rounded-xl p-4 text-[#c0c8f0] font-mono text-sm resize-none h-20 outline-none focus:border-[#2e3468] disabled:opacity-40"
    />
  );
}

function Paragraph({ input, words }) {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);

  const inputArray = input.trim().split(" ").filter(Boolean);
  const currentIndex = input.endsWith(" ")
    ? inputArray.length
    : inputArray.length === 0 ? 0 : inputArray.length - 1;

  const [lineBreaks, setLineBreaks] = useState([]);

  useEffect(() => {
    const breaks = [];
    let lastTop = null;
    wordRefs.current.forEach((el, i) => {
      if (!el) return;
      const top = el.offsetTop;
      if (top !== lastTop) {
        breaks.push(i);
        lastTop = top;
      }
    });
    setLineBreaks(breaks);
  }, [words, input]);

  const currentLineIdx = lineBreaks.findLastIndex
    ? lineBreaks.findLastIndex((start) => start <= currentIndex)
    : 0;

  useEffect(() => {
    if (!containerRef.current || lineBreaks.length === 0) return;
    const lineStart = lineBreaks[currentLineIdx] ?? 0;
    const el = wordRefs.current[lineStart];
    if (!el) return;
    containerRef.current.style.transform = `translateY(-${el.offsetTop}px)`;
  }, [currentIndex, lineBreaks, currentLineIdx]);

  function getWordStyle(index) {
    const isCurrentLine = index >= (lineBreaks[currentLineIdx] ?? 0) && index < (lineBreaks[currentLineIdx + 1] ?? Infinity);
    const isNextLine = index >= (lineBreaks[currentLineIdx + 1] ?? Infinity) && index < (lineBreaks[currentLineIdx + 2] ?? Infinity);

    if (index < currentIndex) {
      return {
        color: inputArray[index] === words[index] ? "#6dbf8a" : "#e05c6e",
        opacity: isCurrentLine ? 1 : 0.3
      };
    }

    if (index === currentIndex) {
      return { color: "#dde0f8", opacity: 1 };
    }

    return {
      color: "#3a3f62",
      opacity: isCurrentLine ? 1 : isNextLine ? 0.5 : 0.15
    };
  }

  return (
    <div className="relative overflow-hidden h-24 mb-6">
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-[#0e0f1a]" />
      <div ref={containerRef} className="flex flex-wrap gap-2 font-mono text-lg leading-10 transition-transform duration-200">
        {words.map((word, index) => {
          const style = getWordStyle(index);
          return (
            <span
              key={index}
              ref={(el) => { if (el) wordRefs.current[index] = el; }}
              className={`whitespace-nowrap border-b ${index === currentIndex ? "border-[#5e6ad2]" : "border-transparent"}`}
              style={style}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [words, setWords] = useState(() => generateWords(300));

  const inputRef = useRef(null); // ✅ added

  useEffect(() => {
    if (timeLeft > 0 && !finished) {
      const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timeLeft === 0) setFinished(true);
  }, [timeLeft, finished]);

  // ✅ auto focus
  useEffect(() => {
    if (timer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [timer]);

  function handleTimeSelect(value) {
    setTimer(value);
    setTimeLeft(value);
    setInput("");
    setFinished(false);
    setWords(generateWords(300));
  }

  function handleRestart() {
    setTimer(null);
    setTimeLeft(null);
    setInput("");
    setFinished(false);
    setWords(generateWords(300));
  }

  const minutes = timer / 60;
  const wpm = Math.round((input.length / 5) / minutes);

  const inputArray = input.trim().split(" ").filter(Boolean);
  let correct = 0;
  inputArray.forEach((word, i) => {
    if (word === words[i]) correct++;
  });

  const accuracy = inputArray.length ? Math.round((correct / inputArray.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0e0f1a] flex items-center justify-center text-white p-6">
      {!timer ? (
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-mono text-gray-300">typetest</h1>
          <div className="flex gap-4">
            {[30, 60, 120, 300].map((t) => {
              const label = t < 60 ? `${t}s` : `${t / 60} min`;

              return (
                <button
                  key={t}
                  onClick={() => handleTimeSelect(t)}
                  className="px-6 py-2 rounded-xl border border-gray-700 bg-[#13142a] hover:bg-[#1a1c38]"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          <div className="flex justify-between mb-4">
            <div className="text-4xl font-mono text-indigo-400">{timeLeft}</div>
            <button onClick={handleRestart} className="text-sm text-gray-400">restart</button>
          </div>

          <Paragraph input={input} words={words} />

          <Userinput 
            input={input} 
            setInput={setInput} 
            disabled={finished}
            inputRef={inputRef} // ✅ passed
          />

          {finished && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-[#111228] p-4 rounded-xl text-center">
                <div className="text-3xl">{wpm}</div>
                <div className="text-xs text-gray-400">WPM</div>
              </div>
              <div className="bg-[#111228] p-4 rounded-xl text-center">
                <div className="text-3xl">{accuracy}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}