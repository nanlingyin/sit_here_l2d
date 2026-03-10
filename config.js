export const CONFIG = {
  api: {
    baseUrl: "https://api.hiyo.top",
    apiKey: "sk-rxRthcrOx2WrZf3aJXJEtO5hch2Eta35DzsXJf85hVUsJ4qc",
    model: "gemini-3.1-flash-image",
    timeout: 180
  },
  mask: {
    threshold: 128,
    feather: 2
  },
  paths: {
    background: "../test_image/test1.jpg",
    model: "./l2d/hiyori_pro_t11.model3.json",
    fallback: null,
    aiMaskImage: "../api_generated_images/test1_mask_preset/mask_raw.png"
  }
};
