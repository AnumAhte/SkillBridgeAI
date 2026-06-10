import { SchemaType, type ResponseSchema } from "@google/generative-ai";

// Gemini responseSchema definitions (structured output).

export const careerAnalysisSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    readinessScore: { type: SchemaType.NUMBER },
    haveSkills: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          proficiency: { type: SchemaType.STRING },
        },
        required: ["name", "proficiency"],
      },
    },
    gaps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          priority: { type: SchemaType.NUMBER },
        },
        required: ["skill", "priority"],
      },
    },
    roadmap: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          position: { type: SchemaType.NUMBER },
          title: { type: SchemaType.STRING },
          skill: { type: SchemaType.STRING },
          estWeeks: { type: SchemaType.NUMBER },
        },
        required: ["position", "title", "skill", "estWeeks"],
      },
    },
    rationale: { type: SchemaType.STRING },
  },
  required: ["readinessScore", "haveSkills", "gaps", "roadmap", "rationale"],
};

export const courseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    level: { type: SchemaType.STRING },
    outcomes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    modules: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          lessons: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                title: { type: SchemaType.STRING },
                summary: { type: SchemaType.STRING },
              },
              required: ["title", "summary"],
            },
          },
          quiz: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                answerIndex: { type: SchemaType.NUMBER },
                explanation: { type: SchemaType.STRING },
              },
              required: ["question", "options", "answerIndex", "explanation"],
            },
          },
          assignment: { type: SchemaType.STRING },
        },
        required: ["title", "lessons", "quiz", "assignment"],
      },
    },
  },
  required: ["title", "level", "outcomes", "modules"],
};
