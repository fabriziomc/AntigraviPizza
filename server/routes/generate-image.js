// Image Generation Proxy Route
// Handles image generation requests and proxies them to various AI providers
// This avoids CORS issues and keeps API tokens secure on the server

import fetch from 'node-fetch';
import express from 'express';


/**
 * Generate image using Hugging Face API (server-side)
 */
async function generateWithHuggingFace(prompt, token) {
    const model = 'black-forest-labs/FLUX.1-schnell'; // Free, faster model
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
                num_inference_steps: 30,
                guidance_scale: 7.5,
                width: 800,
                height: 600
            }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
    }

    // Get image as buffer
    const imageBuffer = await response.buffer();

    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64Image}`;
}



/**
 * Generate image using AI Horde (server-side)
 */


/**
 * POST /api/generate-image
 * Generate pizza image using AI providers
 */
export default async function generateImageRoute(req, res) {
    try {
        const { prompt, provider, token } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        let imageUrl;

        switch (provider) {
            case 'huggingface':
                if (!token) {
                    return res.status(400).json({ error: 'Hugging Face token is required' });
                }
                imageUrl = await generateWithHuggingFace(prompt, token);
                break;



            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        res.json({ imageUrl, provider });

    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            error: 'Image generation failed',
            message: error.message.includes('timed out') ? 'Generation timed out (Service is busy)' : error.message
        });
    }
}
