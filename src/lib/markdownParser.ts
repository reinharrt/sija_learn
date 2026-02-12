// src/lib/markdownParser.ts

import MarkdownIt from 'markdown-it';
import { ContentBlock, BlockType } from '@/types';
import { generateUniqueId } from '@/lib/utils';

const md = new MarkdownIt({
    html: false,
    breaks: true,
    linkify: true,
});

interface ParsedBlock {
    type: BlockType;
    content: string;
    metadata?: Record<string, any>;
}


export function parseMarkdownToBlocks(markdownContent: string): ContentBlock[] {
    const tokens = md.parse(markdownContent, {});
    const parsedBlocks: ParsedBlock[] = [];

    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];

        // Heading
        if (token.type === 'heading_open') {
            const level = parseInt(token.tag.replace('h', ''));
            const contentToken = tokens[i + 1];
            const content = contentToken?.content || '';

            parsedBlocks.push({
                type: BlockType.HEADING,
                content,
                metadata: { level },
            });

            i += 3; // Skip heading_open, inline, heading_close
            continue;
        }

        // Paragraph (Text)
        if (token.type === 'paragraph_open') {
            const contentToken = tokens[i + 1];
            const content = contentToken?.children
                ?.map(child => child.content)
                .join('') || '';

            // Check if it's an image
            const imageChild = contentToken?.children?.find(child => child.type === 'image');
            if (imageChild) {
                parsedBlocks.push({
                    type: BlockType.IMAGE,
                    content: imageChild.attrGet('src') || '',
                    metadata: { alt: imageChild.content || '' },
                });
            } else if (content.trim()) {
                parsedBlocks.push({
                    type: BlockType.TEXT,
                    content,
                });
            }

            i += 3; // Skip paragraph_open, inline, paragraph_close
            continue;
        }

        // Code Block
        if (token.type === 'fence' || token.type === 'code_block') {
            parsedBlocks.push({
                type: BlockType.CODE,
                content: token.content || '',
                metadata: { language: token.info || '' },
            });

            i++;
            continue;
        }

        // Blockquote
        if (token.type === 'blockquote_open') {
            let quoteContent = '';
            let j = i + 1;

            // Collect all content inside blockquote
            while (j < tokens.length && tokens[j].type !== 'blockquote_close') {
                if (tokens[j].type === 'inline') {
                    quoteContent += tokens[j].content + '\n';
                }
                j++;
            }

            parsedBlocks.push({
                type: BlockType.QUOTE,
                content: quoteContent.trim(),
            });

            i = j + 1; // Skip to after blockquote_close
            continue;
        }

        // List (Unordered or Ordered)
        if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
            const listItems: string[] = [];
            let j = i + 1;

            // Collect all list items
            while (j < tokens.length &&
                tokens[j].type !== 'bullet_list_close' &&
                tokens[j].type !== 'ordered_list_close') {
                if (tokens[j].type === 'inline') {
                    listItems.push(tokens[j].content);
                }
                j++;
            }

            parsedBlocks.push({
                type: BlockType.LIST,
                content: listItems.join('\n'),
            });

            i = j + 1; // Skip to after list_close
            continue;
        }

        i++;
    }

    // Convert parsed blocks to ContentBlocks with IDs and order
    return parsedBlocks.map((block, index) => ({
        id: generateUniqueId(),
        type: block.type,
        content: block.content,
        order: index,
        metadata: block.metadata || {},
    }));
}


export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };

        reader.onerror = () => {
            reject(new Error('Gagal membaca file'));
        };

        reader.readAsText(file);
    });
}


export function validateMarkdownFile(file: File): { valid: boolean; error?: string } {
    // Check file extension
    if (!file.name.endsWith('.md')) {
        return { valid: false, error: 'File harus berformat .md' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File terlalu besar (maksimal 5MB)' };
    }

    return { valid: true };
}
