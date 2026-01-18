// services/llmService.js
require('dotenv').config();
const Groq = require('groq-sdk');

class LLMService {
    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Verified Groq model
        this.model = 'llama-3.3-70b-versatile';
    }

    async generateText(prompt) {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 150,
                top_p: 0.9,
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating text:', error?.message || error);
            throw new Error('Failed to generate explanation via Groq');
        }
    }

    async generateCourseExplanation(userQuery, course, score) {
        try {
            const priceText = course.price === 0 ? 'Free' : `₹${course.price}`;
            const matchPercent = (score * 100).toFixed(0);

            const prompt = `
                You are a helpful course recommendation assistant.
                Explain in 2–3 friendly sentences why this course is a good match.

                User wants to learn: "${userQuery}"

                Course details:
                - Title: ${course.title}
                - Description: ${course.description}
                - Type: ${course.type}
                - Price: ${priceText}
                - Match Score: ${matchPercent}%

                Be conversational, encouraging, and specific.
                `;

            const explanation = await this.generateText(prompt);

            return explanation.trim();
        } catch (error) {
            console.error('Error generating explanation:', error.message);

            // Fallback
            return `This course is a strong match for "${userQuery}" with a ${(
                score * 100
            ).toFixed(0)}% relevance score and covers key topics in ${
                course.title
            }.`;
        }
    }

    /**
     * Generate explanations sequentially (safe for rate limits)
     */
    async generateBatchExplanations(userQuery, courses) {
        const coursesWithExplanations = [];

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];

            try {
                console.log(
                    `Generating explanation ${i + 1}/${courses.length}: ${
                        course.title
                    }`
                );

                const explanation = await this.generateCourseExplanation(
                    userQuery,
                    course,
                    course.score
                );

                coursesWithExplanations.push({
                    ...course,
                    recommendation_reason: explanation,
                });

                // Light delay (Groq is fast, but still polite)
                if (i < courses.length - 1) {
                    await new Promise((r) => setTimeout(r, 1500));
                }
            } catch (error) {
                console.error(`Failed for ${course.title}:`, error.message);

                coursesWithExplanations.push({
                    ...course,
                    recommendation_reason: `This course aligns well with your interest in "${userQuery}" and provides structured learning in ${course.title}.`,
                });
            }
        }

        return coursesWithExplanations;
    }

    async generateOverallSummary(userQuery, courses) {
        try {
            const courseList = courses
                .slice(0, 5)
                .map(
                    (c, i) =>
                        `${i + 1}. ${c.title} – ${c.description.substring(
                            0,
                            80
                        )}...`
                )
                .join('\n');

            const prompt = `
You are a learning advisor.

User wants to learn: "${userQuery}"

Top recommended courses:
${courseList}

Write a concise 2–3 sentence summary explaining why these courses are good matches.
`;

            const summary = await this.generateText(prompt);

            return {
                overall_summary: summary.trim(),
                courses,
            };
        } catch (error) {
            console.error('Error generating summary:', error.message);

            return {
                overall_summary: `Based on your interest in "${userQuery}", these courses best match your learning goals.`,
                courses,
            };
        }
    }
}
// llmService = new LLMService();
module.exports = new LLMService();

// const userQuery = 'I want to learn backend development with Node.js';

// const dummyCourses = [
//     {
//         title: 'Complete Node.js Backend Bootcamp',
//         description:
//             'Build scalable backend applications using Node.js, Express, MongoDB, and REST APIs.',
//         type: 'Bootcamp',
//         price: 4999,
//         score: 0.87,
//     },
//     {
//         title: 'MERN Stack Masterclass',
//         description:
//             'Master MongoDB, Express, React, and Node.js by building full-stack projects.',
//         type: 'Course',
//         price: 7999,
//         score: 0.82,
//     },
//     {
//         title: 'API Development with Express.js',
//         description:
//             'Learn REST API design, authentication, middleware, and production best practices.',
//         type: 'Course',
//         price: 0,
//         score: 0.78,
//     },
// ];

// async function test() {
//     console.log('\n--- Single Explanation ---');
//     const single = await llmService.generateCourseExplanation(
//         userQuery,
//         dummyCourses[0],
//         dummyCourses[0].score
//     );
//     console.log(single);

//     console.log('\n--- Batch Explanations ---');
//     const batch = await llmService.generateBatchExplanations(
//         userQuery,
//         dummyCourses
//     );
//     console.log(batch);

//     console.log('\n--- Overall Summary ---');
//     const summary = await llmService.generateOverallSummary(userQuery, batch);
//     console.log(summary.overall_summary);
// }

// test();
