import { useState, useRef } from "react";
import { InferenceClient } from "@huggingface/inference";
import "./App.css";

const EXAMPLE_PROMPTS = [
  "A futuristic city at sunset, neon lights, cinematic",
  "A majestic white wolf in a snowy forest, photorealistic",
  "Abstract fluid art, vibrant colors, 8k resolution",
  "A cozy coffee shop in Tokyo, rainy evening, warm lighting",
];

function App() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_HF_API_KEY || ""
  );
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [history, setHistory] = useState([]);
  const imgRef = useRef(null);

  const generate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter your Hugging Face API key.");
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const client = new InferenceClient(apiKey);
      const blob = await client.textToImage({
        provider: "nscale",
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      });

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setHistory((prev) => [
        { prompt: prompt.trim(), url, id: Date.now() },
        ...prev.slice(0, 5),
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
  };

  const useExample = (p) => setPrompt(p);

  const download = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `ai-image-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="app">
      {/* Animated background orbs */}
      <div className="bg-orb orb1" />
      <div className="bg-orb orb2" />
      <div className="bg-orb orb3" />

      <header className="header">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">Imagine<span className="accent">AI</span></span>
        </div>
        <button
          className="key-btn"
          onClick={() => setShowKeyInput((p) => !p)}
          title="Set API Key"
        >
          <span className="key-icon">🔑</span>
          <span>{apiKey ? "API Key Set ✓" : "Set API Key"}</span>
        </button>
      </header>

      <main className="main">
        <div className="hero">
          <h1 className="title">
            Turn Words Into <span className="gradient-text">Masterpieces</span>
          </h1>
          <p className="subtitle">
            Powered by Stable Diffusion XL · Nscale (Fastest) · Describe anything and watch it come to life
          </p>
        </div>

        {/* API Key Panel */}
        {showKeyInput && (
          <div className="key-panel card">
            <label className="label">
              🔑 Hugging Face API Key
              <span className="label-hint">
                Get yours free at{" "}
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="link"
                >
                  huggingface.co/settings/tokens
                </a>
              </span>
            </label>
            <div className="key-row">
              <input
                type="password"
                className="input"
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                className="btn btn-sm"
                onClick={() => setShowKeyInput(false)}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Prompt Section */}
        <div className="prompt-card card">
          <label className="label">Your Prompt</label>
          <div className="textarea-wrap">
            <textarea
              className="textarea"
              rows={3}
              placeholder="A surreal dreamscape with floating islands, waterfalls cascading into clouds..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="char-count">{prompt.length} chars</span>
          </div>

          <div className="examples">
            <span className="examples-label">Try:</span>
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                className="chip"
                onClick={() => useExample(p)}
              >
                {p.length > 36 ? p.slice(0, 36) + "…" : p}
              </button>
            ))}
          </div>

          <button
            className={`btn btn-primary generate-btn ${loading ? "loading" : ""}`}
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Generating…
              </>
            ) : (
              <>
                <span className="btn-icon">✦</span>
                Generate Image
                <span className="shortcut">⌘↵</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="result-card card">
            <div className="skeleton-img">
              <div className="skeleton-shimmer" />
              <div className="skeleton-label">
                <span className="spinner-lg" />
                <span>Painting your world…</span>
              </div>
            </div>
          </div>
        )}

        {/* Result Image */}
        {imageUrl && !loading && (
          <div className="result-card card">
            <div className="result-header">
              <span className="result-title">Generated Image</span>
              <button className="btn btn-sm" onClick={download}>
                ⬇ Download
              </button>
            </div>
            <div className="img-wrap">
              <img
                ref={imgRef}
                src={imageUrl}
                alt={prompt}
                className="result-img"
              />
            </div>
            <p className="result-prompt">"{prompt}"</p>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="history-section">
            <h3 className="history-title">Previous Generations</h3>
            <div className="history-grid">
              {history.slice(1).map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  onClick={() => {
                    setImageUrl(item.url);
                    setPrompt(item.prompt);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <img src={item.url} alt={item.prompt} />
                  <p>{item.prompt.length > 40 ? item.prompt.slice(0, 40) + "…" : item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Built with React + Vite · Powered by{" "}
          <a
            href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            Stable Diffusion XL
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
