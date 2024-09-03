'use client';

import { useEffect } from 'react';
import usePortfolioStore from '@/app/store/usePortfolioStore';
import MinecraftScene from '@/components/MinecraftScene';

const Home: React.FC = () => {
  const setSpotifyTrack = usePortfolioStore((state) => state.setSpotifyTrack);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      const trackData = {
        name: 'Imagine',
        artist: 'John Lennon',
        url: 'https://open.spotify.com/track/example',
      };
      setSpotifyTrack(trackData);
    };

    fetchSpotifyData();
  }, [setSpotifyTrack]);

  return (
      <main>
        <MinecraftScene />
      </main>
  );
};

export default Home;