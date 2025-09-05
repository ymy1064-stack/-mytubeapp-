export async function analyzeThumbnail(type, imageData) {
  const rulesObj = getGuidelines();
  const rules = type === 'short' ? rulesObj.thumb_short : rulesObj.thumb_long;

  const prompt = `
Analyze this ${type} YouTube thumbnail and provide constructive feedback.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "checks": [
    {"ok": boolean, "text": string}
  ],
  "tips": ["string"],
  "score": number
}

Evaluation Criteria:
1. Visual Appeal - Colors, contrast, composition
2. Readability - Text size, font, clarity
3. Emotional Impact - Does it evoke curiosity?
4. Brand Consistency - Logo, colors, style
5. Technical Quality - Resolution, lighting

Thumbnail Type: ${type}
Reference Guidelines: ${JSON.stringify(rules).slice(0, 500)}

Provide a score from 1-10 based on overall effectiveness.
`;

  try {
    const response = await callGemini(prompt);
    
    try {
      const result = JSON.parse(response);
      
      // Validate and format the response
      return {
        checks: Array.isArray(result.checks) ? result.checks.slice(0, 8) : [],
        tips: Array.isArray(result.tips) ? result.tips.slice(0, 5) : [],
        score: typeof result.score === 'number' ? Math.min(Math.max(result.score, 1), 10) : 7,
        type: type
      };
    } catch (parseError) {
      console.log('Failed to parse thumbnail analysis JSON, using fallback');
      
      // Fallback analysis
      return {
        checks: [
          { ok: true, text: "Image uploaded successfully" },
          { ok: false, text: "Automatic analysis unavailable" }
        ],
        tips: [
          "Ensure good lighting in your thumbnail",
          "Use high contrast colors for better visibility",
          "Keep text large and readable",
          "Show expressive faces when possible",
          "Maintain consistent branding"
        ],
        score: 6,
        type: type
      };
    }
  } catch (error) {
    console.log('Thumbnail analysis failed:', error.message);
    
    // Comprehensive fallback
    const fallbackTips = {
      long: [
        "Use the rule of thirds for composition",
        "Include expressive facial expressions",
        "Use bold, contrasting colors",
        "Keep text minimal but impactful",
        "Add your channel branding"
      ],
      short: [
        "Vertical format works best for Shorts",
        "Use large, bold text that's readable on mobile",
        "Bright colors attract more attention",
        "Focus on one main subject",
        "Use motion or action in the thumbnail"
      ]
    };

    return {
      checks: [
        { ok: true, text: "Image received successfully" },
        { ok: false, text: "Advanced analysis temporarily unavailable" }
      ],
      tips: fallbackTips[type] || fallbackTips.long,
      score: 6,
      type: type,
      note: "Basic analysis provided. AI service may be temporarily unavailable."
    };
  }
}
