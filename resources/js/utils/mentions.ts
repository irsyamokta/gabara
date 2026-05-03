// resources/js/utils/mentions.ts
// Helper untuk linkify mentions di HTML string (memproses text nodes saja)
export default function linkifyMentions(
    html: string,
    usernames: string[] = [],
) {
    if (!html) return "";
    if (!usernames || usernames.length === 0) return html;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // walk only text nodes so we don't break existing tags
        const walker = doc.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            null,
        );
        const textNodes: Text[] = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode as Text);
        }

        textNodes.forEach((textNode) => {
            const text = textNode.nodeValue || "";
            const frag = doc.createDocumentFragment();
            let lastIndex = 0;
            let hasMatch = false;

            // Sort usernames by length (longest first) to match longer names first
            const sortedUsernames = [...usernames].sort(
                (a, b) => b.length - a.length,
            );

            // Find all mentions in the text
            const mentions: Array<{
                index: number;
                length: number;
                username: string;
            }> = [];

            sortedUsernames.forEach((username) => {
                // Escape special regex characters in username
                const escapedUsername = username.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&",
                );
                // Match @username with word boundaries
                const regex = new RegExp(
                    `@${escapedUsername}(?=\\s|$|[.,!?;:])`,
                    "gi",
                );
                let match;

                while ((match = regex.exec(text)) !== null) {
                    // Check if this position is already covered by another mention
                    const overlaps = mentions.some(
                        (m) =>
                            (match!.index >= m.index &&
                                match!.index < m.index + m.length) ||
                            (match!.index + match![0].length > m.index &&
                                match!.index + match![0].length <=
                                    m.index + m.length),
                    );

                    if (!overlaps) {
                        mentions.push({
                            index: match.index,
                            length: match[0].length,
                            username: username,
                        });
                    }
                }
            });

            // Sort mentions by index
            mentions.sort((a, b) => a.index - b.index);

            // Build the fragment with mentions replaced
            mentions.forEach((mention) => {
                if (mention.index > lastIndex) {
                    frag.appendChild(
                        doc.createTextNode(
                            text.slice(lastIndex, mention.index),
                        ),
                    );
                }

                const span = doc.createElement("span");
                span.className = "mention text-blue-600 font-medium";
                span.textContent = `@${mention.username}`;

                frag.appendChild(span);
                lastIndex = mention.index + mention.length;
                hasMatch = true;
            });

            if (lastIndex < text.length) {
                frag.appendChild(doc.createTextNode(text.slice(lastIndex)));
            }

            if (hasMatch && frag.childNodes.length > 0) {
                textNode.parentNode?.replaceChild(frag, textNode);
            }
        });

        return doc.body.innerHTML;
    } catch (err) {
        // fallback kalau DOMParser gagal
        return html;
    }
}
