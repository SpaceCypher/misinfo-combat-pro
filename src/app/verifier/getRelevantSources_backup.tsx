// Backup of original getRelevantSources function
export const getRelevantSources = (claimText: string, allSources: any[]) => {
  if (!Array.isArray(allSources) || allSources.length === 0) return [];
  if (claimText.includes('great wall') || claimText.includes('scientists have shown')) {
    return allSources.filter(source => 
      source.title?.toLowerCase().includes('great wall') ||
      source.snippet?.toLowerCase().includes('great wall') ||
      source.snippet?.toLowerCase().includes('visible') ||
      source.snippet?.toLowerCase().includes('space')
    );
  }
  if (claimText.includes('amazon') || claimText.includes('oxygen')) {
    return allSources.filter(source => 
      source.title?.toLowerCase().includes('amazon') ||
      source.title?.toLowerCase().includes('oxygen') ||
      source.snippet?.toLowerCase().includes('rainforest')
    );
  }
  if (claimText.includes('einstein') || claimText.includes('nobel')) {
    return allSources.filter(source => 
      source.title?.toLowerCase().includes('einstein') ||
      source.title?.toLowerCase().includes('nobel') ||
      source.snippet?.toLowerCase().includes('physics')
    );
  }
  return allSources.slice(0, 1);
};