import GeminiLogoImg from "@/assets/images/platforms/logos/gemini.png";
import OpenAiLogoImg from "@/assets/images/platforms/logos/openai.webp";
import ClaudeLogoImg from "@/assets/images/platforms/logos/claude.png";

const ModelLogo = ({ model }) => {
  const llmModels = [
    { value: "GPT-4o", label: "ChatGPT", logo: OpenAiLogoImg },
    { value: "Gemini-1-5-Pro", label: "Gemini", logo: GeminiLogoImg },
    { value: "Claude-3-5-Sonnet", label: "Claude", logo: ClaudeLogoImg },
  ];

  const selectedModelOption = llmModels.find((item) => item.value === model);

  return selectedModelOption?.logo ?? OpenAiLogoImg;
};

export { ModelLogo };
