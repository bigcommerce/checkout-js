function formatResults({ desktop, mobile }) {
    const desktopResult = formatResult(desktop, '🖥️ Desktop');
    const mobileResult = formatResult(mobile, '📱 Mobile');

    return `### ⚡️ Lighthouse results

${desktopResult}

${mobileResult}
    `;
}

function formatResult({ manifest, links }, title) {
    const index = manifest.findIndex((item) => item.isRepresentativeRun);

    const { summary } = manifest[index];
    const [[_, reportUrl]] = Object.entries(links);

    const comment = `#### [${title}](${reportUrl}):

| Category | Score |
| -------- | ----- |
${scoreRow('Performance', summary.performance)}
${scoreRow('Accessibility', summary.accessibility)}
${scoreRow('Best practices', summary['best-practices'])}
${scoreRow('SEO', summary.seo)}
`;

    return comment;
}

function scoreRow(label, score) {
    if (typeof score !== 'number') {
        return '';
    }

    let emoji;

    if (score >= 0.9) {
        emoji = '🟢';
    } else if (score >= 0.5) {
        emoji = '🟠';
    } else {
        emoji = '🔴';
    }

    return `| ${emoji} ${label} | ${Math.round(score * 100)} |`;
}

module.exports = formatResults;
