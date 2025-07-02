export interface YouTubeVideo {
    id: string;
    embedUrl: string;
}

/**
 * Extract YouTube video IDs from content
 */
export function extractYouTubeVideos(content: string): YouTubeVideo[] {
    const videos: YouTubeVideo[] = [];
    
    // YouTube URL patterns
    const patterns = [
        // youtube.com/watch?v=VIDEO_ID
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
        // youtu.be/VIDEO_ID
        /youtu\.be\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/embed/VIDEO_ID
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/v/VIDEO_ID
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/watch?v=VIDEO_ID&other_params
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/g,
        // youtube.com/embed/VIDEO_ID?other_params
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})\?/g
    ];

    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const videoId = match[1];
            if (!videos.some(video => video.id === videoId)) {
                videos.push({
                    id: videoId,
                    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`
                });
            }
        }
    });

    return videos;
}

/**
 * Hide YouTube links in content by removing them or replacing with placeholder text
 */
export function hideYouTubeLinks(content: string, showPlaceholder: boolean = false): string {
    // YouTube URL patterns to hide
    const patterns = [
        // youtube.com/watch?v=VIDEO_ID
        /https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})([&\w=]*)/g,
        // youtu.be/VIDEO_ID
        /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/embed/VIDEO_ID
        /https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/v/VIDEO_ID
        /https?:\/\/www\.youtube\.com\/v\/([a-zA-Z0-9_-]{11})/g,
        // youtube.com/embed/VIDEO_ID with parameters
        /https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})\?[^"\s]*/g
    ];

    let processedContent = content;

    if (showPlaceholder) {
        // Replace YouTube links with a subtle placeholder
        const placeholder = '<span class="text-gray-400 dark:text-gray-600 text-sm italic">[Video content available above]</span>';
        patterns.forEach(pattern => {
            processedContent = processedContent.replace(pattern, placeholder);
        });
    } else {
        // Replace YouTube links with empty string
        patterns.forEach(pattern => {
            processedContent = processedContent.replace(pattern, '');
        });
    }

    // Remove anchor tags that contain only YouTube links
    processedContent = processedContent.replace(/<a[^>]*href\s*=\s*["\']?https?:\/\/(www\.)?youtube\.com[^"\']*["\']?[^>]*>.*?<\/a>/gi, '');
    processedContent = processedContent.replace(/<a[^>]*href\s*=\s*["\']?https?:\/\/youtu\.be[^"\']*["\']?[^>]*>.*?<\/a>/gi, '');

    // Clean up any empty paragraphs, divs, or spans that might be left
    processedContent = processedContent.replace(/<p>\s*<\/p>/g, '');
    processedContent = processedContent.replace(/<div>\s*<\/div>/g, '');
    processedContent = processedContent.replace(/<span>\s*<\/span>/g, '');
    processedContent = processedContent.replace(/<p>\s*&nbsp;\s*<\/p>/g, '');
    processedContent = processedContent.replace(/<div>\s*&nbsp;\s*<\/div>/g, '');
    processedContent = processedContent.replace(/<span>\s*&nbsp;\s*<\/span>/g, '');

    // Clean up multiple consecutive empty lines
    processedContent = processedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    return processedContent;
} 