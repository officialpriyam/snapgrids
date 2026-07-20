module.exports = {
    name: 'SuperiorSkyblock',
    description: 'SupreiorSkyblock is an all in one plugin for your Skyblock server. Every aspect of the plugin is configurable, and it\'s packed with a rich API that can let you change the way it behaves however you want. The plugin is very well optimized to ensure your server can hold as many players as possible!',
    pluginId: 'SuperiorSkyblock2',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>bg-repo</id>
                <url>https://repo.bg-software.com/repository/api/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.bgsoftware</groupId>
                <artifactId>SuperiorSkyblockAPI</artifactId>
                <version>2025.1</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        API
        SuperiorSkyblock provides a powerful API, so you can make your own custom modules to the plugin, change behavior of the plugin, register custom commands and more!
        You can find the javadocs of the API here.
        
        Basic Usage
        All of the API methods can be accessed via the SuperiorSkyblockAPI class.
        The API contains lots of objects that are used as method parameters, and here I'll cover some of them:
        
        SuperiorPlayer
        This object is used as a warpper to the known player objects of the Bukkit's API. It contains data about the player, states of modes (fly mode etc) and more.
        You can retrieve the object using SuperiorSkyblockAPI.getPlayer(<UUID>).
        
        Island
        This object is used to cache data about the islands on your server. Members, banned list, multipliers, upgrades and all of the other data is stored in this object.
        You can get the Island of a player by using SuperiorPlayer#getIsland().
        If you want to get an Island in a specific location, you can use SuperiorSkyblockAPI.getGrid().getIslandAt(<Location>).
        
        GridManager
        The grid manager object handles all the islands on your server. If you want to interact with islands, get them from the top list or anything related to that, you should use this object.
    
        SuperiorSkyblockAPI class: com.bgsoftware.superiorskyblock.api
        Constructor
        SuperiorSkyblockAPI() (private constructor)
        
        General Methods
        static SuperiorSkyblock getSuperiorSkyblock()
        static void setPluginInstance(SuperiorSkyblock plugin)
        static int getAPIVersion()
        
        Player Methods
        static SuperiorPlayer getPlayer(Player player)
        static SuperiorPlayer getPlayer(String name) (nullable)
        static SuperiorPlayer getPlayer(UUID uuid)
        
        Island Methods
        static void createIsland(SuperiorPlayer superiorPlayer, String schemName, BigDecimal bonus, Biome biome, String islandName)
        static void createIsland(SuperiorPlayer superiorPlayer, String schemName, BigDecimal bonus, Biome biome, String islandName, boolean offset)
        static void createIsland(SuperiorPlayer superiorPlayer, String schemName, BigDecimal bonusWorth, BigDecimal bonusLevel, Biome biome, String islandName, boolean offset)
        static void deleteIsland(Island island)
        static com.bgsoftware.superiorskyblock.api.island.Island getIsland(String islandName) (nullable)
        static com.bgsoftware.superiorskyblock.api.island.Island getIslandByUUID(UUID uuid) (nullable)
        static com.bgsoftware.superiorskyblock.api.island.Island getSpawnIsland()
        static World getIslandsWorld(Island island, World.Environment environment) (nullable, deprecated)
        static World getIslandsWorld(Island island, Dimension dimension) (nullable)
        static com.bgsoftware.superiorskyblock.api.island.Island getIslandAt(Location location) (nullable)
        static void calcAllIslands()
        
        Schematic Methods
        static com.bgsoftware.superiorskyblock.api.schematic.Schematic getSchematic(String name) (nullable)
        
        Providers Methods
        static void setSpawnersProvider(SpawnersProvider spawnersProvider)
        
        Commands Methods
        static void registerCommand(SuperiorCommand superiorCommand)
        
        Manager Access Methods
        static com.bgsoftware.superiorskyblock.api.handlers.GridManager getGrid()
        static com.bgsoftware.superiorskyblock.api.handlers.StackedBlocksManager getStackedBlocks()
        static com.bgsoftware.superiorskyblock.api.handlers.BlockValuesManager getBlockValues()
        static com.bgsoftware.superiorskyblock.api.handlers.SchematicManager getSchematics()
        static com.bgsoftware.superiorskyblock.api.handlers.PlayersManager getPlayers()
        static com.bgsoftware.superiorskyblock.api.handlers.RolesManager getRoles()
        static com.bgsoftware.superiorskyblock.api.handlers.MissionsManager getMissions()
        static com.bgsoftware.superiorskyblock.api.handlers.MenusManager getMenus()
        static com.bgsoftware.superiorskyblock.api.handlers.KeysManager getKeys()
        static com.bgsoftware.superiorskyblock.api.handlers.ProvidersManager getProviders()
        static com.bgsoftware.superiorskyblock.api.handlers.UpgradesManager getUpgrades()
        static com.bgsoftware.superiorskyblock.api.handlers.CommandsManager getCommands()
        static com.bgsoftware.superiorskyblock.api.handlers.SettingsManager getSettings()
        static com.bgsoftware.superiorskyblock.api.handlers.FactoriesManager getFactory()
        static com.bgsoftware.superiorskyblock.api.handlers.ModulesManager getModules()
    
        
        SuperiorPlayer class: com.bgsoftware.superiorskyblock.api.wrappers
        Here are all the methods in the SuperiorPlayer interface with their return types:
        General Methods
        UUID getUniqueId()
        String getName()
        String getTextureValue()
        void setTextureValue(String textureValue)
        void updateLastTimeStatus()
        void setLastTimeStatus(long lastTimeStatus)
        long getLastTimeStatus()
        void updateName()
        void setName(String name)
        Player asPlayer() (nullable)
        OfflinePlayer asOfflinePlayer() (nullable)
        boolean isOnline()
        void runIfOnline(Consumer<Player> toRun)
        boolean hasFlyGamemode()
        com.bgsoftware.superiorskyblock.api.menu.view.MenuView<?, ?> getOpenedView() (nullable)
        boolean isAFK()
        boolean isVanished()
        boolean isShownAsOnline()
        boolean hasPermission(String permission)
        boolean hasPermissionWithoutOP(String permission)
        boolean hasPermission(IslandPrivilege permission)
        com.bgsoftware.superiorskyblock.api.enums.HitActionResult canHit(SuperiorPlayer otherPlayer)
        
        Location Methods
        World getWorld() (nullable)
        Location getLocation() (nullable)
        Location getLocation(@Nullable Location location) (nullable)
        void teleport(Location location)
        void teleport(Location location, @Nullable Consumer<Boolean> teleportResult)
        void teleport(Island island)
        void teleport(Island island, Dimension dimension)
        void teleport(Island island, @Nullable Consumer<Boolean> teleportResult)
        void teleport(Island island, Dimension dimension, @Nullable Consumer<Boolean> teleportResult)
        void teleport(Island island, World.Environment environment) (deprecated)
        void teleport(Island island, World.Environment environment, @Nullable Consumer<Boolean> teleportResult) (deprecated)
        boolean isInsideIsland()
        
        Island Methods
        SuperiorPlayer getIslandLeader()
        void setIslandLeader(SuperiorPlayer islandLeader) (deprecated)
        Island getIsland() (nullable)
        void setIsland(Island island)
        boolean hasIsland()
        void addInvite(Island island)
        void removeInvite(Island island)
        List<Island> getInvites()
        PlayerRole getPlayerRole()
        void setPlayerRole(PlayerRole playerRole)
        int getDisbands()
        void setDisbands(int disbands)
        boolean hasDisbands()
        
        Preferences Methods
        Locale getUserLocale()
        void setUserLocale(Locale locale)
        boolean hasWorldBorderEnabled()
        void toggleWorldBorder()
        void setWorldBorderEnabled(boolean enabled)
        void updateWorldBorder(@Nullable Island island)
        boolean hasBlocksStackerEnabled()
        void toggleBlocksStacker()
        void setBlocksStacker(boolean enabled)
        boolean hasSchematicModeEnabled()
        void toggleSchematicMode()
        void setSchematicMode(boolean enabled)
        boolean hasTeamChatEnabled()
        void toggleTeamChat()
        void setTeamChat(boolean enabled)
        boolean hasBypassModeEnabled()
        void toggleBypassMode()
        void setBypassMode(boolean enabled)
        boolean hasToggledPanel()
        void setToggledPanel(boolean toggledPanel)
        boolean hasIslandFlyEnabled()
        void toggleIslandFly()
        void setIslandFly(boolean enabled)
        boolean hasAdminSpyEnabled()
        void toggleAdminSpy()
        void setAdminSpy(boolean enabled)
        BorderColor getBorderColor()
        void setBorderColor(BorderColor borderColor)
        
        Schematics Methods
        BlockPosition getSchematicPos1()
        void setSchematicPos1(@Nullable Block block)
        BlockPosition getSchematicPos2()
        void setSchematicPos2(@Nullable Block block)
        
        Data Methods
        boolean isImmunedToPvP() (deprecated)
        void setImmunedToPvP(boolean immunedToPvP) (deprecated)
        boolean isLeavingFlag() (deprecated)
        void setLeavingFlag(boolean leavingFlag) (deprecated)
        boolean isImmunedToPortals() (deprecated)
        void setImmunedToPortals(boolean immuneToPortals) (deprecated)
        BukkitTask getTeleportTask() (nullable)
        void setTeleportTask(@Nullable BukkitTask teleportTask)
        PlayerStatus getPlayerStatus() (deprecated)
        void setPlayerStatus(PlayerStatus playerStatus)
        void removePlayerStatus(PlayerStatus playerStatus)
        boolean hasPlayerStatus(PlayerStatus playerStatus)
        void merge(SuperiorPlayer otherPlayer)


        Island class: com.bgsoftware.superiorskyblock.api.island
        General Methods
        com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer getOwner()
        UUID getUniqueId()
        long getCreationTime()
        String getCreationTimeDate()
        void updateDatesFormatter()
        
        Player Related Methods
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getIslandMembers(boolean includeOwner)
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getIslandMembers(com.bgsoftware.superiorskyblock.api.island.PlayerRole... playerRoles)
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getBannedPlayers()
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getIslandVisitors()
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getIslandVisitors(boolean vanishPlayers)
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getAllPlayersInside()
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getUniqueVisitors()
        List<Pair<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer, Long>> getUniqueVisitorsWithTimes()
        void inviteMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void revokeInvite(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        boolean isInvited(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getInvitedPlayers()
        void addMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, com.bgsoftware.superiorskyblock.api.island.PlayerRole playerRole)
        void kickMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        boolean isMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void banMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void banMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, @Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer whom)
        void unbanMember(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        boolean isBanned(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void addCoop(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void removeCoop(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        boolean isCoop(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        List<com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer> getCoopPlayers()
        int getCoopLimit()
        int getCoopLimitRaw()
        void setCoopLimit(int coopLimit)
        void setPlayerInside(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, boolean inside)
        boolean isVisitor(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, boolean checkCoopStatus)
        
        Location Related Methods
        Location getCenter(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        Location getCenter(World.Environment environment) (deprecated)
        com.bgsoftware.superiorskyblock.api.wrappers.BlockPosition getCenterPosition()
        Location getTeleportLocation(World.Environment environment) (deprecated, nullable)
        Map<World.Environment, Location> getTeleportLocations() (deprecated)
        void setTeleportLocation(Location teleportLocation) (deprecated)
        void setTeleportLocation(World.Environment environment, @Nullable Location teleportLocation) (deprecated)
        Location getIslandHome(com.bgsoftware.superiorskyblock.api.world.Dimension dimension) (nullable)
        Location getIslandHome(World.Environment environment) (deprecated, nullable)
        Map<com.bgsoftware.superiorskyblock.api.world.Dimension, Location> getIslandHomesAsDimensions()
        Map<World.Environment, Location> getIslandHomes() (deprecated)
        void setIslandHome(Location homeLocation)
        void setIslandHome(com.bgsoftware.superiorskyblock.api.world.Dimension dimension, @Nullable Location homeLocation)
        void setIslandHome(World.Environment environment, @Nullable Location homeLocation) (deprecated)
        Location getVisitorsLocation(com.bgsoftware.superiorskyblock.api.world.Dimension dimension) (nullable)
        Location getVisitorsLocation() (deprecated, nullable)
        Location getVisitorsLocation(World.Environment environment) (deprecated, nullable)
        void setVisitorsLocation(@Nullable Location visitorsLocation)
        Location getMinimum()
        com.bgsoftware.superiorskyblock.api.wrappers.BlockPosition getMinimumPosition()
        Location getMinimumProtected()
        com.bgsoftware.superiorskyblock.api.wrappers.BlockPosition getMinimumProtectedPosition()
        Location getMaximum()
        com.bgsoftware.superiorskyblock.api.wrappers.BlockPosition getMaximumPosition()
        Location getMaximumProtected()
        com.bgsoftware.superiorskyblock.api.wrappers.BlockPosition getMaximumProtectedPosition()
        
        General Methods
        boolean isSpawn()
        String getName()
        void setName(String islandName)
        String getRawName()
        String getDescription()
        void setDescription(String description)
        void disbandIsland()
        boolean transferIsland(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void replacePlayers(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer originalPlayer, @Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer newPlayer)
        void calcIslandWorth(@Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer asker)
        void calcIslandWorth(@Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer asker, @Nullable Runnable callback)
        com.bgsoftware.superiorskyblock.api.island.algorithms.IslandCalculationAlgorithm getCalculationAlgorithm()
        void updateBorder()
        void updateIslandFly(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        int getIslandSize()
        void setIslandSize(int islandSize)
        int getIslandSizeRaw()
        String getDiscord()
        void setDiscord(String discord)
        String getPaypal()
        void setPaypal(String paypal)
        Biome getBiome()
        void setBiome(Biome biome)
        void setBiome(Biome biome, boolean updateBlocks)
        boolean isLocked()
        void setLocked(boolean locked)
        boolean isIgnored()
        void setIgnored(boolean ignored)
        void sendMessage(String message, UUID... ignoredMembers)
        void sendMessage(com.bgsoftware.superiorskyblock.api.service.message.IMessageComponent messageComponent, Object... args)
        void sendMessage(com.bgsoftware.superiorskyblock.api.service.message.IMessageComponent messageComponent, List<UUID> ignoredMembers, Object... args)
        void sendTitle(@Nullable String title, @Nullable String subtitle, int fadeIn, int duration, int fadeOut, UUID... ignoredMembers)
        void executeCommand(String command, boolean onlyOnlineMembers, UUID... ignoredMembers)
        boolean isBeingRecalculated()
        void updateLastTime()
        void setCurrentlyActive()
        void setCurrentlyActive(boolean active)
        boolean isCurrentlyActive()
        long getLastTimeUpdate()
        void setLastTimeUpdate(long lastTimeUpdate)
        
        Bank Related Methods
        com.bgsoftware.superiorskyblock.api.island.bank.IslandBank getIslandBank()
        BigDecimal getBankLimit()
        void setBankLimit(BigDecimal bankLimit)
        BigDecimal getBankLimitRaw()
        boolean giveInterest(boolean checkOnlineOwner)
        long getLastInterestTime()
        void setLastInterestTime(long lastInterest)
        long getNextInterest()

        Upgrades Related Methods
        com.bgsoftware.superiorskyblock.api.upgrades.UpgradeLevel getUpgradeLevel(com.bgsoftware.superiorskyblock.api.upgrades.Upgrade upgrade)
        void setUpgradeLevel(com.bgsoftware.superiorskyblock.api.upgrades.Upgrade upgrade, int level)
        Map<String, Integer> getUpgrades()
        void syncUpgrades()
        void updateUpgrades()
        long getLastTimeUpgrade()
        boolean hasActiveUpgradeCooldown()
        double getCropGrowthMultiplier()
        void setCropGrowthMultiplier(double cropGrowth)
        double getCropGrowthRaw()
        double getSpawnerRatesMultiplier()
        void setSpawnerRatesMultiplier(double spawnerRates)
        double getSpawnerRatesRaw()
        double getMobDropsMultiplier()
        void setMobDropsMultiplier(double mobDrops)
        double getMobDropsRaw()
        int getBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        int getExactBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        com.bgsoftware.superiorskyblock.api.key.Key getBlockLimitKey(com.bgsoftware.superiorskyblock.api.key.Key key)
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getBlocksLimits()
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getCustomBlocksLimits()
        void clearBlockLimits()
        void setBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key, int limit)
        void removeBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        boolean hasReachedBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        boolean hasReachedBlockLimit(com.bgsoftware.superiorskyblock.api.key.Key key, int amount)
        int getEntityLimit(EntityType entityType)
        int getEntityLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getEntitiesLimitsAsKeys()
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getCustomEntitiesLimits()
        void clearEntitiesLimits()
        void setEntityLimit(EntityType entityType, int limit)
        void setEntityLimit(com.bgsoftware.superiorskyblock.api.key.Key key, int limit)
        CompletableFuture<Boolean> hasReachedEntityLimit(EntityType entityType)
        CompletableFuture<Boolean> hasReachedEntityLimit(com.bgsoftware.superiorskyblock.api.key.Key key)
        CompletableFuture<Boolean> hasReachedEntityLimit(EntityType entityType, int amount)
        CompletableFuture<Boolean> hasReachedEntityLimit(com.bgsoftware.superiorskyblock.api.key.Key key, int amount)
        com.bgsoftware.superiorskyblock.api.island.algorithms.IslandEntitiesTrackerAlgorithm getEntitiesTracker()
        int getTeamLimit()
        void setTeamLimit(int teamLimit)
        int getTeamLimitRaw()
        int getWarpsLimit()
        void setWarpsLimit(int warpsLimit)
        int getWarpsLimitRaw()
        void setPotionEffect(PotionEffectType type, int level)
        void removePotionEffect(PotionEffectType type)
        int getPotionEffectLevel(PotionEffectType type)
        Map<PotionEffectType, Integer> getPotionEffects()
        void applyEffects(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void applyEffects()
        void removeEffects(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void removeEffects()
        void clearEffects()
        void setRoleLimit(com.bgsoftware.superiorskyblock.api.island.PlayerRole playerRole, int limit)
        void removeRoleLimit(com.bgsoftware.superiorskyblock.api.island.PlayerRole playerRole)
        int getRoleLimit(com.bgsoftware.superiorskyblock.api.island.PlayerRole playerRole)
        int getRoleLimitRaw(com.bgsoftware.superiorskyblock.api.island.PlayerRole playerRole)
        Map<com.bgsoftware.superiorskyblock.api.island.PlayerRole, Integer> getRoleLimits()
        Map<com.bgsoftware.superiorskyblock.api.island.PlayerRole, Integer> getCustomRoleLimits()
        
        Warps Related Methods
        com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory createWarpCategory(String name)
        com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory getWarpCategory(String name) (nullable)
        com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory getWarpCategory(int slot) (nullable)
        void renameCategory(com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory warpCategory, String newName)
        void deleteCategory(com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory warpCategory)
        Map<String, com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory> getWarpCategories()
        com.bgsoftware.superiorskyblock.api.island.warps.IslandWarp createWarp(String name, Location location, @Nullable com.bgsoftware.superiorskyblock.api.island.warps.WarpCategory warpCategory)
        void renameWarp(com.bgsoftware.superiorskyblock.api.island.warps.IslandWarp islandWarp, String newName)
        com.bgsoftware.superiorskyblock.api.island.warps.IslandWarp getWarp(Location location) (nullable)
        com.bgsoftware.superiorskyblock.api.island.warps.IslandWarp getWarp(String name) (nullable)
        void warpPlayer(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, String warp)
        void deleteWarp(@Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, Location location)
        void deleteWarp(String name)
        Map<String, com.bgsoftware.superiorskyblock.api.island.warps.IslandWarp> getIslandWarps()
        
        Ratings Related Methods
        com.bgsoftware.superiorskyblock.api.enums.Rating getRating(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        void setRating(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer, com.bgsoftware.superiorskyblock.api.enums.Rating rating)
        void removeRating(com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer superiorPlayer)
        double getTotalRating()
        int getRatingAmount()
        Map<UUID, com.bgsoftware.superiorskyblock.api.enums.Rating> getRatings()
        void removeRatings()
        
        Settings Related Methods
        boolean hasSettingsEnabled(com.bgsoftware.superiorskyblock.api.island.IslandFlag islandFlag)
        Map<com.bgsoftware.superiorskyblock.api.island.IslandFlag, Byte> getAllSettings()
        void enableSettings(com.bgsoftware.superiorskyblock.api.island.IslandFlag islandFlag)
        void disableSettings(com.bgsoftware.superiorskyblock.api.island.IslandFlag islandFlag)
        
        Generator Related Methods
        void setGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, int percentage, com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        boolean setGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, int percentage, com.bgsoftware.superiorskyblock.api.world.Dimension dimension, @Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer caller, boolean callEvent)
        void setGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, int percentage, World.Environment environment) (deprecated)
        boolean setGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, int percentage, World.Environment environment, @Nullable com.bgsoftware.superiorskyblock.api.wrappers.SuperiorPlayer caller, boolean callEvent) (deprecated)
        int getGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        int getGeneratorPercentage(com.bgsoftware.superiorskyblock.api.key.Key key, World.Environment environment) (deprecated)
        Map<String, Integer> getGeneratorPercentages(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        Map<String, Integer> getGeneratorPercentages(World.Environment environment) (deprecated)
        void setGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, @Size int amount, com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        void setGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, @Size int amount, World.Environment environment) (deprecated)
        void removeGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        void removeGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, World.Environment environment) (deprecated)
        int getGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        int getGeneratorAmount(com.bgsoftware.superiorskyblock.api.key.Key key, World.Environment environment) (deprecated)
        int getGeneratorTotalAmount(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        int getGeneratorTotalAmount(World.Environment environment) (deprecated)
        Map<String, Integer> getGeneratorAmounts(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        Map<String, Integer> getGeneratorAmounts(World.Environment environment) (deprecated)
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getCustomGeneratorAmounts(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        Map<com.bgsoftware.superiorskyblock.api.key.Key, Integer> getCustomGeneratorAmounts(World.Environment environment) (deprecated)
        void clearGeneratorAmounts(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        void clearGeneratorAmounts(World.Environment environment) (deprecated)
        com.bgsoftware.superiorskyblock.api.key.Key generateBlock(Location location, boolean optimizeDefaultBlock) (nullable)
        com.bgsoftware.superiorskyblock.api.key.Key generateBlock(Location location, com.bgsoftware.superiorskyblock.api.world.Dimension dimension, boolean optimizeDefaultBlock) (nullable)
        com.bgsoftware.superiorskyblock.api.key.Key generateBlock(Location location, World.Environment environment, boolean optimizeDefaultBlock) (deprecated, nullable)
        
        Schematic Methods
        boolean wasSchematicGenerated(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        boolean wasSchematicGenerated(World.Environment environment) (deprecated)
        void setSchematicGenerate(com.bgsoftware.superiorskyblock.api.world.Dimension dimension)
        void setSchematicGenerate(com.bgsoftware.superiorskyblock.api.world.Dimension dimension, boolean generated)
        void setSchematicGenerate(World.Environment environment) (deprecated)
        void setSchematicGenerate(World.Environment environment, boolean generated) (deprecated)
        Collection<com.bgsoftware.superiorskyblock.api.world.Dimension> getGeneratedSchematics()
        int getGeneratedSchematicsFlag() (deprecated)
        String getSchematicName()
        
        Island Top Methods
        int getPosition(com.bgsoftware.superiorskyblock.api.island.SortingType sortingType)
        
        Vault Related Methods
        com.bgsoftware.superiorskyblock.api.island.IslandChest[] getChest()
        int getChestSize()
        void setChestRows(int index, int rows)
`




};