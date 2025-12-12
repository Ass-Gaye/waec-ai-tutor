import React from 'react';

export function MarkdownRenderer({ text }: { text: string }) {
  // Use a more robust regex to handle multiple asterisks and newlines
  const processedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(\r\n|\n|\r)/g, '<br />');

  // Split into paragraphs based on double line breaks, which is a common markdown convention
  const paragraphs = processedText.split(/<br \/>\s*<br \/>/);

  return (
    <div className="space-y-4 text-base leading-relaxed">
      {paragraphs.map((paragraph, pIndex) => {
        // Find code blocks and preserve them
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(paragraph)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: paragraph.substring(lastIndex, match.index),
            });
          }
          parts.push({ type: 'code', content: match[2], lang: match[1] });
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < paragraph.length) {
          parts.push({
            type: 'text',
            content: paragraph.substring(lastIndex),
          });
        }
        
        return (
          <div key={pIndex}>
            {parts.map((part, partIndex) => {
              if (part.type === 'code') {
                return (
                  <pre key={partIndex} className="bg-muted p-4 rounded-md overflow-x-auto my-4">
                    <code className="font-code text-sm">{part.content}</code>
                  </pre>
                );
              }
              return (
                <p
                  key={partIndex}
                  dangerouslySetInnerHTML={{ __html: part.content }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
