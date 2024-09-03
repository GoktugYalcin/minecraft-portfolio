import {create} from 'zustand';

interface PortfolioState {
    projects: Array<{ id: number; title: string; description: string }>;
    articles: Array<{ id: number; title: string; url: string }>;
    spotifyTrack: { name: string; artist: string; url: string } | null;
    setProjects: (projects: Array<{ id: number; title: string; description: string }>) => void;
    setArticles: (articles: Array<{ id: number; title: string; url: string }>) => void;
    setSpotifyTrack: (track: { name: string; artist: string; url: string } | null) => void;
}

const usePortfolioStore = create<PortfolioState>((set) => ({
    projects: [],
    articles: [],
    spotifyTrack: null,
    setProjects: (projects) => set({ projects }),
    setArticles: (articles) => set({ articles }),
    setSpotifyTrack: (track) => set({ spotifyTrack: track }),
}));

export default usePortfolioStore;