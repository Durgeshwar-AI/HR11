import { HfInference } from "@huggingface/inference";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const PRIMARY_MODEL = "Om-Shandilya/resume-matcher-bert";
const FALLBACK_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

let _hf = null;
let _usingFallback = false;

function getHf() {
  if (!_hf) {
    if (!process.env.HF_API_TOKEN) {
      throw new Error(
        "HF_API_TOKEN is not set. Add it to your .env file. " +
        "Get a free token at https://huggingface.co/settings/tokens"
      );
    }
    _hf = new HfInference(process.env.HF_API_TOKEN);
  }
  return _hf;
}

function clampScore(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function meanPool(tokenEmbeddings) {
  if (!Array.isArray(tokenEmbeddings) || tokenEmbeddings.length === 0) return tokenEmbeddings;
  if (typeof tokenEmbeddings[0] === "number") return tokenEmbeddings;
  const dim = tokenEmbeddings[0].length;
  const pooled = new Array(dim).fill(0);
  for (const token of tokenEmbeddings) {
    for (let i = 0; i < dim; i++) pooled[i] += token[i];
  }
  const n = tokenEmbeddings.length;
  for (let i = 0; i < dim; i++) pooled[i] /= n;
  return pooled;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function similarityToScore(sim, isFallbackModel = false) {
  if (sim < 0.15) {
    return Math.round(sim * 50);
  } else if (sim < 0.25) {
    return Math.round(sim * 40 + 5);
  } else if (sim < 0.35) {
    return Math.round(sim * 50 + 10);
  } else if (sim < 0.50) {
    return Math.round(sim * 60 + 15);
  } else if (sim < 0.65) {
    return Math.round(sim * 80 + 20);
  } else {
    return Math.round(sim * 100);
  }
}

async function getEmbedding(text, model = PRIMARY_MODEL) {
  const hf = getHf();
  try {
    const result = await hf.featureExtraction({
      model,
      inputs: text.slice(0, 8000),
      options: { wait_for_model: true },
    });
    return meanPool(result);
  } catch (err) {
    if (model === PRIMARY_MODEL) {
      console.warn(`[BERT] Primary model failed, falling back to base model.`);
      _usingFallback = true;
      return getEmbedding(text, FALLBACK_MODEL);
    }
    throw err;
  }
}

// SIMPLE THESAURUS - Just for keyword matching
const SKILL_SYNONYMS = {
  react: ["react", "reactjs", "jsx", "next", "nextjs"],
  vue: ["vue", "vuejs", "nuxt"],
  angular: ["angular", "angularjs"],
  javascript: ["javascript", "js", "es6"],
  typescript: ["typescript", "ts"],
  nodejs: ["node", "nodejs", "node.js"],
  python: ["python"],
  java: ["java"],
  golang: ["golang", "go"],
  csharp: ["c#", "csharp", "dotnet"],
  php: ["php"],
  ruby: ["ruby"],
  rust: ["rust"],
  kotlin: ["kotlin"],
  swift: ["swift"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  aws: ["aws", "amazon"],
  gcp: ["gcp", "google cloud"],
  azure: ["azure"],
  mongodb: ["mongodb", "mongo"],
  postgresql: ["postgresql", "postgres"],
  mysql: ["mysql"],
  redis: ["redis"],
  elasticsearch: ["elasticsearch"],
  kafka: ["kafka"],
  sql: ["sql"],
  graphql: ["graphql"],
  rest: ["rest", "restful"],
  api: ["api"],
  html: ["html", "html5"],
  css: ["css", "css3", "scss", "sass"],
  sass: ["sass", "scss"],
  webpack: ["webpack"],
  jest: ["jest"],
  selenium: ["selenium"],
  git: ["git", "github", "gitlab"],
  linux: ["linux", "unix"],
  windows: ["windows"],
  bash: ["bash", "shell"],
  jenkins: ["jenkins"],
  cicd: ["ci/cd", "cicd"],
  terraform: ["terraform"],
  agile: ["agile", "scrum"],
  microservices: ["microservices"],
  springboot: ["springboot", "spring boot"],
  express: ["express"],
  django: ["django"],
  flask: ["flask"],
  fastapi: ["fastapi"],
  pandas: ["pandas"],
  numpy: ["numpy"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],
  machinelearning: ["machine learning", "ml", "ai"],
  solidprinciples: ["solid", "design patterns"],
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "from",
  "by", "as", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "do",
  "does", "did", "can", "could", "would", "should", "may", "might", "must", "shall", "will",
  "which", "that", "this", "these", "those", "i", "you", "he", "she", "it", "we", "they",
  "what", "who", "when", "where", "why", "how", "all", "each", "every", "both", "neither",
  "either", "none", "some", "any", "such", "no", "not", "more", "most", "less", "least",
  "very", "just", "only", "even", "so", "than", "about", "after", "before", "between",
  "through", "during", "above", "below", "under", "over", "out", "off", "up", "down", "year",
  "years", "month", "day", "work", "worked", "working", "experience", "experienced", "expertise",
]);

/**
 * Extract keywords from text
 * Returns array of unique, cleaned keywords
 */
function extractKeywords(text) {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .match(/\b[a-z0-9+#./-]{2,}\b/g) || [];
  
  return [...new Set(
    words.filter(w => !STOPWORDS.has(w) && w.length > 2)
  )];
}

/**
 * Check if a keyword matches in resume (with synonym support)
 */
function findKeywordMatch(keyword, resumeText) {
  const resumeLower = resumeText.toLowerCase();
  
  // Direct match
  if (resumeLower.includes(keyword)) return true;
  
  // Check synonyms
  for (const [baseSkill, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.includes(keyword)) {
      return synonyms.some(syn => resumeLower.includes(syn));
    }
  }
  
  return false;
}

/**
 * Analyze skills - simple keyword matching
 */
function analyzeSkills(resumeText, jobDescription, explicitSkills = null) {
  const resumeLower = resumeText.toLowerCase();
  
  // Get job keywords
  let jobKeywords = [];
  
  if (explicitSkills && explicitSkills.length > 0) {
    jobKeywords = explicitSkills.map(s => s.toLowerCase().trim()).filter(s => s.length > 0);
  } else {
    jobKeywords = extractKeywords(jobDescription);
  }
  
  // Match keywords in resume
  const matched = [];
  const missing = [];
  
  for (const keyword of jobKeywords) {
    if (findKeywordMatch(keyword, resumeText)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }
  
  // Simple scoring: percentage of matched keywords
  let skillsScore = 0;
  if (jobKeywords.length > 0) {
    skillsScore = Math.round((matched.length / jobKeywords.length) * 100);
  }
  
  return { matched, missing, skillsScore, total: jobKeywords.length };
}

async function extractResumeText(resumeUrl, mimeType) {
  const response = await fetch(resumeUrl);
  if (!response.ok) throw new Error(`Failed to fetch resume: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const type = (mimeType || "").toLowerCase();
  let text = "";

  if (type.includes("pdf")) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    text = typeof result === "string" ? result : (result?.text || "");
    await parser.destroy();
  } else if (
    type.includes("docx") ||
    type.includes("openxmlformats") ||
    type.includes("wordprocessingml")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  } else {
    text = buffer.toString("utf-8");
  }

  text = text
    .trim()
    .replace(/\s+/g, " ")
    .substring(0, 50000);

  return text;
}

/**
 * Main screening function
 */
async function screenResume({ resumeUrl, mimeType, jobTitle, jobDescription, name, email, requiredSkills = null }) {
  console.log(`\n[screenResume] Starting screening for ${name || "Unknown"} | Role: ${jobTitle}`);
  
  _usingFallback = false;

  // Extract resume text
  let resumeText = "";
  try {
    console.log(`[screenResume] Fetching resume...`);
    resumeText = await extractResumeText(resumeUrl, mimeType);
    console.log(`[screenResume] ✓ Resume extracted (${resumeText.length} chars)`);
  } catch (err) {
    console.warn("[screenResume] ✗ Text extraction failed:", err.message);
    return {
      jobTitle,
      jobDescription,
      score: 0,
      scoreBreakdown: { skills: 0, semantic: 0, experience: 0, education: 0, overall: 0 },
      reasoning: "Could not extract resume text.",
      report: { recommendation: "REJECT", compositeScore: 0, summary: "Resume extraction failed." },
    };
  }

  if (!resumeText) {
    return {
      jobTitle,
      jobDescription,
      score: 0,
      scoreBreakdown: { skills: 0, semantic: 0, experience: 0, education: 0, overall: 0 },
      reasoning: "Resume is empty.",
      report: { recommendation: "REJECT", compositeScore: 0, summary: "Resume is empty." },
    };
  }

  // 1. SEMANTIC MATCHING (BERT)
  console.log(`[screenResume] Computing semantic similarity...`);
  const jobText = `${jobTitle}. ${jobDescription}`;
  const [resumeEmbedding, jobEmbedding] = await Promise.all([
    getEmbedding(resumeText),
    getEmbedding(jobText),
  ]);
  
  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
  const semanticScore = similarityToScore(similarity, _usingFallback);
  console.log(`[screenResume] ✓ Semantic: ${similarity.toFixed(4)} → ${semanticScore}/100`);

  // 2. SKILLS MATCHING
  console.log(`[screenResume] Analyzing skills...`);
  const skillsAnalysis = analyzeSkills(resumeText, jobDescription, requiredSkills);
  const skillsScore = skillsAnalysis.skillsScore;
  console.log(`[screenResume] ✓ Skills: ${skillsAnalysis.matched.length}/${skillsAnalysis.total} matched → ${skillsScore}/100`);

  // 3. EXPERIENCE (Years detection)
  // ✅ Check if job title mentions "intern" - interns don't need experience
  const isInternRole = jobTitle.toLowerCase().includes("intern");
  
  // ✅ Check if job description requires experience
  const jobDescLower = jobDescription.toLowerCase();
  const requiresExperience = /\b(\d+)\+?\s*(?:years?|yrs?|experience)\b/i.test(jobDescLower) ||
                             jobDescLower.includes("experienced") ||
                             jobDescLower.includes("professional");
  
  let experienceScore = 0;
  let maxYears = 0; // Initialize here so it's available in reasoning string
  
  if (isInternRole) {
    // For intern roles, experience barely matters - 5/100
    experienceScore = 0;
    maxYears = 0; // Just in case 
    console.log(`[screenResume] ✓ Experience: INTERN ROLE → ${experienceScore}/100 (experience not required)`);
  } else if (!requiresExperience) {
    // If job description doesn't require experience, don't penalize
    experienceScore = 0;
    maxYears = 0;
    console.log(`[screenResume] ✓ Experience: NO REQUIREMENT MENTIONED → ${experienceScore}/100 (not required)`);
  } else {
    // Normal case: score based on years mentioned
    const yearMatches = resumeText.match(/\b(\d{1,2})\+?\s*(?:years?|yrs?|y\/o)\b/gi) || [];
    maxYears = yearMatches.length > 0 
      ? Math.max(...yearMatches.map(m => parseInt(m)))
      : 0;
    experienceScore = Math.min(maxYears * 12, 100);
    console.log(`[screenResume] ✓ Experience: ${maxYears} years → ${experienceScore}/100`);
  }

  // 4. EDUCATION
  const eduKeywords = ["bachelor", "master", "phd", "btech", "mtech", "bsc", "msc", "mba", "degree", "university", "college"];
  const resumeLower = resumeText.toLowerCase();
  const eduMatches = eduKeywords.filter(k => resumeLower.includes(k)).length;
  const educationScore = Math.min(eduMatches * 20, 100);
  console.log(`[screenResume] ✓ Education: ${eduMatches} indicators → ${educationScore}/100`);

  // 5. COMPOSITE SCORE
  // interns don't need experience, so don't count it
  let weights;
  if (isInternRole) {
    weights = {
      semantic: 0.20,
      skills: 0.55,
      experience: 0,
      education: 0.25,
    };
  } else if (!requiresExperience) {
    weights = {
      semantic: 0.25,
      skills: 0.50,
      experience: 0,
      education: 0.25,
    };
  } else {
    weights = {
      semantic: 0.25,
      skills: 0.45,
      experience: 0.15,
      education: 0.15,
    };
  }

  const compositeScore = Math.round(
    semanticScore * weights.semantic +
    skillsScore * weights.skills +
    experienceScore * weights.experience +
    educationScore * weights.education
  );

  console.log(`[screenResume] ✓ COMPOSITE SCORE: ${compositeScore}/100`);

  // Determine recommendation
  let recommendation = "REVIEW";
  if (compositeScore >= 70) recommendation = "STRONG";
  else if (compositeScore >= 50) recommendation = "PASS";

  // Log detailed breakdown
  console.log(`\n${'═'.repeat(100)}`);
  console.log(`📋 RESUME SCREENING REPORT`);
  console.log(`${'═'.repeat(100)}`);
  
  console.log(`\n👤 CANDIDATE INFO:`);
  console.log(`   Name: ${name || "Unknown"}`);
  console.log(`   Email: ${email || "N/A"}`);
  console.log(`   Role: ${jobTitle}`);
  console.log(`   Screening: ${new Date().toLocaleString()}`);

  console.log(`\n📊 SCORE BREAKDOWN:`);
  console.log(`   Semantic Alignment:  ${semanticScore.toString().padStart(3)}/100  (${weights.semantic * 100}% weight) = ${(semanticScore * weights.semantic).toFixed(1)}`);
  console.log(`   Skills Matching:     ${skillsScore.toString().padStart(3)}/100  (${weights.skills * 100}% weight) = ${(skillsScore * weights.skills).toFixed(1)}`);
  console.log(`   Experience Level:    ${experienceScore.toString().padStart(3)}/100  (${weights.experience * 100}% weight) = ${(experienceScore * weights.experience).toFixed(1)}`);
  console.log(`   Education Quality:   ${educationScore.toString().padStart(3)}/100  (${weights.education * 100}% weight) = ${(educationScore * weights.education).toFixed(1)}`);

  console.log(`\n⚖️ CALCULATION:`);
  console.log(`   ${semanticScore} + ${skillsScore} + ${experienceScore} + ${educationScore}`);
  console.log(`   = ${(semanticScore * weights.semantic).toFixed(1)} + ${(skillsScore * weights.skills).toFixed(1)} + ${(experienceScore * weights.experience).toFixed(1)} + ${(educationScore * weights.education).toFixed(1)}`);
  console.log(`   = ${compositeScore}/100`);

  console.log(`\n${'─'.repeat(100)}`);
  console.log(`🎯 SKILLS ANALYSIS:`);
  console.log(`   Total Required: ${skillsAnalysis.total}`);
  console.log(`   Matched: ${skillsAnalysis.matched.length} → ${skillsAnalysis.matched.slice(0, 20).join(", ")}`);
  console.log(`   Missing: ${skillsAnalysis.missing.length} → ${skillsAnalysis.missing.slice(0, 20).join(", ")}`);

  console.log(`\n${'─'.repeat(100)}`);
  console.log(`✅ FINAL RECOMMENDATION: ${recommendation}`);
  console.log(`   Composite Score: ${compositeScore}/100`);
  console.log(`   Model: ${_usingFallback ? "MiniLM (fallback)" : "BERT (primary)"}`);
  console.log(`   Raw Similarity: ${similarity.toFixed(4)}`);
  
  console.log(`\n${'═'.repeat(100)}\n`);

  return {
    jobTitle,
    jobDescription,
    score: compositeScore,
    scoreBreakdown: {
      semantic: semanticScore,
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      overall: compositeScore,
    },
    reasoning: `Semantic alignment ${semanticScore}/100. Found ${skillsAnalysis.matched.length}/${skillsAnalysis.total} skills. ${experienceScore > 0 ? `${maxYears} years experience. ` : ""}${recommendation} recommendation.`,
    report: {
      recommendation,
      compositeScore,
      passThreshold: 50,
      summary: `${recommendation}: ${compositeScore}/100 - ${
        recommendation === "STRONG" ? "Excellent fit, proceed to interview." :
        recommendation === "PASS" ? "Good fit, proceed with review." :
        "Moderate fit, needs further assessment."
      }`,
      modelUsed: _usingFallback ? "MiniLM (fallback)" : "BERT (primary)",
      matchedSkills: skillsAnalysis.matched,
      missingSkills: skillsAnalysis.missing,
    },
  };
}

export { screenResume };