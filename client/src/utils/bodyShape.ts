// ─── Body Shape Calculator Utility ───────────────────────────────────────────
// Algorithm mirrors calculator.net/body-type-calculator.html
// All measurements must be in cm before calling calculateBodyShape().
// ─────────────────────────────────────────────────────────────────────────────

export type BodyShape =
  | "Hourglass"
  | "Bottom Hourglass"
  | "Top Hourglass"
  | "Spoon"
  | "Triangle"
  | "Inverted Triangle"
  | "Rectangle";

export interface BodyShapeResult {
  shape: BodyShape;
  emoji: string;
  whr: number;               // waist-to-hip ratio
  description: string;
  tips: string[];
}

export interface BodyMeasurements {
  bust: number;
  waist: number;
  highHip: number;
  hip: number;
  unit: "cm" | "inches";
}

// Convert inches → cm if needed
export function normaliseToCm(m: BodyMeasurements): Omit<BodyMeasurements, "unit"> {
  const factor = m.unit === "inches" ? 2.54 : 1;
  return {
    bust:    Math.round(m.bust    * factor * 10) / 10,
    waist:   Math.round(m.waist   * factor * 10) / 10,
    highHip: Math.round(m.highHip * factor * 10) / 10,
    hip:     Math.round(m.hip     * factor * 10) / 10,
  };
}

const SHAPE_DATA: Record<BodyShape, { emoji: string; description: string; tips: string[] }> = {
  "Hourglass": {
    emoji: "⏳",
    description:
      "Your bust and hips are well-balanced with a significantly narrower waist. This classic shape is flattered by almost any silhouette that emphasises the waist.",
    tips: [
      "Wrap dresses and fit-and-flare styles highlight your waist naturally.",
      "High-waisted trousers and skirts elongate your figure.",
      "Belts are your best friend — cinch any outfit at the waist.",
      "Avoid boxy or shapeless cuts that hide your natural curves.",
    ],
  },
  "Bottom Hourglass": {
    emoji: "🍐",
    description:
      "Similar to the hourglass, your hips are slightly fuller than your bust with a defined waist. You have beautiful curves concentrated in the lower half.",
    tips: [
      "A-line and fit-and-flare skirts balance your proportions perfectly.",
      "Structured blazers and boat-neck tops add volume to your upper half.",
      "Wide-leg trousers elongate and balance your hips.",
      "Avoid overly tight skirts that emphasise only the hip area.",
    ],
  },
  "Top Hourglass": {
    emoji: "🔺",
    description:
      "Your bust is slightly fuller than your hips with a defined waist. You carry more volume in the upper half while maintaining an elegant silhouette.",
    tips: [
      "V-necks and scoop necks elongate the upper body beautifully.",
      "Full or flared skirts add balance to your lower half.",
      "Dark-coloured tops paired with brighter bottoms create harmony.",
      "Avoid heavy layering on the top that adds extra volume.",
    ],
  },
  "Spoon": {
    emoji: "🥄",
    description:
      "Your hips are noticeably wider than your bust with a pronounced hip shelf. This curvy shape looks stunning in clothing that celebrates your lower curves.",
    tips: [
      "Peplum tops and ruffled blouses add volume to your upper body.",
      "A-line skirts skim your hips without clinging.",
      "Colourful or patterned tops draw the eye upward.",
      "Avoid clingy fabrics around the hips.",
    ],
  },
  "Triangle": {
    emoji: "🔻",
    description:
      "Also called the Pear shape — your hips are wider than your bust. Your lower half is your most prominent feature, and there are many styles that celebrate it.",
    tips: [
      "Statement tops, off-shoulder styles, and bold necklines balance your silhouette.",
      "Dark-coloured bottoms minimise the hip area if desired.",
      "A-line and wrap skirts are universally flattering.",
      "Avoid adding volume to your hips with hip-level pockets or details.",
    ],
  },
  "Inverted Triangle": {
    emoji: "🔺",
    description:
      "Your shoulders and bust are broader than your hips, giving you a powerful athletic silhouette. Balancing your upper and lower proportions is key.",
    tips: [
      "Full skirts and wide-leg trousers add volume and balance below the waist.",
      "V-necks and raglan sleeves soften broad shoulders.",
      "Avoid heavy shoulder details like ruffles or pads.",
      "High-waisted bottoms create the illusion of fuller hips.",
    ],
  },
  "Rectangle": {
    emoji: "📏",
    description:
      "Also called the Banana or Straight shape — your bust, waist, and hips have similar measurements. You have a lean, athletic frame with less waist definition.",
    tips: [
      "Create curves with peplum tops, ruffles, and layering.",
      "Belts worn at the natural waist add definition.",
      "Straight or wide-leg jeans complement your linear frame.",
      "Bold patterns and textures add visual interest across your silhouette.",
    ],
  },
};

// ─── Classification Algorithm ─────────────────────────────────────────────────
export function calculateBodyShape(raw: BodyMeasurements): BodyShapeResult {
  const { bust, waist, highHip, hip } = normaliseToCm(raw);

  const whr = Math.round((waist / hip) * 100) / 100;

  let shape: BodyShape;

  // Order matters — most specific checks first
  if (
    Math.abs(bust - hip) / Math.max(bust, hip) <= 0.01 &&
    waist <= bust * 0.75
  ) {
    shape = "Hourglass";
  } else if (
    hip > bust &&
    hip - bust <= 3.6 &&
    waist <= bust * 0.75
  ) {
    shape = "Bottom Hourglass";
  } else if (
    bust > hip &&
    bust - hip <= 3.6 &&
    waist <= hip * 0.75
  ) {
    shape = "Top Hourglass";
  } else if (
    hip > bust &&
    hip - bust > 3.5 &&
    hip > highHip * 1.047
  ) {
    shape = "Spoon";
  } else if (hip > bust && hip - bust > 3.5) {
    shape = "Triangle";
  } else if (bust > hip && bust - hip > 3.5) {
    shape = "Inverted Triangle";
  } else {
    shape = "Rectangle";
  }

  const { emoji, description, tips } = SHAPE_DATA[shape];
  return { shape, emoji, whr, description, tips };
}
