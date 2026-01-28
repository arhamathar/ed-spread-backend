require('dotenv').config();
const axios = require('axios');

class EmbeddingService {
    constructor() {
        this.apiUrl =
            'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';

        this.headers = {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Generate embedding(s)
     * @param {string | string[]} input
     * @returns {number[] | number[][]}
     */
    async generateEmbedding(input) {
        try {
            // 🔑 EXACTLY what HF router expects
            const payload = {
                inputs: {
                    // "source_sentence": "That is a happy person",
                    sentences: Array.isArray(input) ? input : input,
                },
            };
            // const payload = {
            //     inputs: { sentences: Array.isArray(input) ? input : input },
            // };

            const response = await axios.post(this.apiUrl, payload, {
                headers: this.headers,
                timeout: 30000,
            });

            /**
             * HF returns:
             * - number[]     -> single string
             * - number[][]   -> batch
             */
            return response.data;
        } catch (error) {
            console.error(
                'Error generating embedding:',
                error?.response?.data || error.message
            );
            throw new Error('Failed to generate embedding via Hugging Face');
        }
    }

    // ===== Helpers =====

    generateCourseEmbedding(title, description) {
        return this.generateEmbedding(`${title}. ${description}`);
    }

    generateQueryEmbedding(query) {
        return this.generateEmbedding(query);
    }

    generateBatchEmbeddings(texts) {
        return this.generateEmbedding(texts);
    }
}

module.exports = new EmbeddingService();
