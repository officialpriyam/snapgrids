"use client";

import { Suspense } from "react";
import GameServerList from "./GameServerList";
import type { CmsGamePage } from "../../types/site";

function GameServerListFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

type GameServerListWrapperProps = {
  gameId?: string;
  gamePage?: CmsGamePage;
};

export default function GameServerListWrapper({ gameId, gamePage }: GameServerListWrapperProps) {
  return (
    <Suspense fallback={<GameServerListFallback />}>
      <GameServerList gameId={gameId} gamePage={gamePage} />
    </Suspense>
  );
}
