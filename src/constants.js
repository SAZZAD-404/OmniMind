// Anmix Proxy (fallback for non-OpenAI models via master key)
export const API_BASE_URL = "https://api-manager-tool--calebcaleb93621.replit.app/anmix/v1";
// Local Vite proxy path for OpenAI (bypasses CORS)
export const OPENAI_PROXY_URL = "/api/openai";

export const PROVIDER_MODELS = {
  OPENAI: {
    key: "VITE_OPENAI_API_KEY",
    baseUrl: "/api/openai", // Routes through Vite proxy → api.openai.com (no CORS)
    models: [
      "gpt-4o-mini", "gpt-4o", "gpt-5", "gpt-5-mini", "gpt-5-nano"
    ],
    exclusiveModels: [
      // GPT-4.1 series
      "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
      // GPT-5 extended
      "gpt-5-pro", "gpt-5.1", "gpt-5.2", "gpt-5.4",
      "gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.4-pro",
    ]
  },
  GOOGLE: {
    key: "VITE_GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-pro", "gemini-3-flash-preview", "gemma-7b", "gemma-2-9b"]
  },
  META: {
    key: "VITE_META_API_KEY",
    baseUrl: "https://api.llamameta.net/v1",
    models: ["Llama-3.3-70b-instruct", "Llama-4-maverick-17b-128e-instruct", "Llama-3.1-405b-instruct", "Llama-3.2-90b-vision-instruct", "Llama-3.1-8b-instruct", "Llama-3.1-70b-instruct", "Llama-3.2-3b-instruct"]
  },
  MISTRAL: {
    key: "VITE_MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1",
    models: ["mistral-small-24b-instruct", "mistral-small-3.1", "mistral-medium-3", "mistral-nemotron", "mixtral-8x22b", "mistral-small-3.2", "magistral-small", "devstal-2", "devstral-2", "mamba-codestral"]
  },
  COHERE: {
    key: "VITE_COHERE_API_KEY",
    baseUrl: "https://api.cohere.com/compatibility/v1",
    models: ["command-a-3", "command-a-vision", "command-a-reasoning", "command-r", "command-r-plus", "command-r7b", "command-r7b-arabic", "aya-expanse-8b", "aya-expanse-32b", "aya-vision-8b", "aya-vision-32b"]
  },
  NVIDIA: {
    key: "VITE_NVIDIA_API_KEY",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    models: ["nemotron-ultra-253b", "nemotron-nano-8b", "nemotron-super-49b-v1", "nemotron-3-nano", "nemotron-3-super"]
  },
  ALIBABA: {
    key: "VITE_ALIBABA_API_KEY",
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    models: ["qwen2.5-coder-32b", "qwen3-235b-a22b", "qwen3.5", "qwen3-coder", "qwen3-vl", "qwen3-coder-next"]
  },
  DEEPSEEK: {
    key: "VITE_DEEPSEEK_API_KEY",
    baseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-v3.2"]
  },
  MOONSHOT: {
    key: "VITE_MOONSHOT_API_KEY",
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["kimi-k2", "kimi-k2.5"]
  },
  MINIMAX: {
    key: "VITE_MINIMAX_API_KEY",
    baseUrl: "https://api.minimax.chat/v1",
    models: ["minimax-m2", "minimax-m2.5", "minimax-m2.7"]
  },
  ZHIPU: {
    key: "VITE_ZHIPU_API_KEY",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    models: ["glm-4.6", "glm-4.7", "glm5"]
  },
  OTHERS: {
    key: "VITE_OTHERS_API_KEY",
    baseUrl: API_BASE_URL,
    models: ["step-3.5-flash", "cogito-2.1", "rnj-1"]
  }
};

const filterModels = () => {
  const masterKey = import.meta.env.VITE_API_KEY;
  let available = new Set();

  if (masterKey) {
    Object.values(PROVIDER_MODELS).forEach(p => {
      p.models.forEach(m => available.add(m));
    });
  }

  for (const provider of Object.values(PROVIDER_MODELS)) {
    if (import.meta.env[provider.key]) {
      provider.models.forEach(m => available.add(m));
      if (provider.exclusiveModels) {
        provider.exclusiveModels.forEach(m => available.add(m));
      }
    }
  }

  return Array.from(available);
};

export const MODELS = filterModels();

// Returns { apiKey, baseUrl } — smart routing:
// - OpenAI models: use VITE_OPENAI_API_KEY + local Vite proxy (no CORS)
// - Other models: use master key + Anmix proxy
export const getApiConfigForModel = (modelName) => {
  const masterKey = import.meta.env.VITE_API_KEY;

  // Find the provider for this model
  const provider = Object.values(PROVIDER_MODELS).find(p =>
    p.models.includes(modelName) || (p.exclusiveModels && p.exclusiveModels.includes(modelName))
  );

  // If a specific provider key exists, use it with local proxy (CORS-safe)
  if (provider) {
    const specificKey = import.meta.env[provider.key];
    if (specificKey) {
      return { apiKey: specificKey, baseUrl: provider.baseUrl };
    }
  }

  // Fallback: Master Key → Anmix Proxy
  if (masterKey) {
    return { apiKey: masterKey, baseUrl: API_BASE_URL };
  }

  return { apiKey: undefined, baseUrl: API_BASE_URL };
};
